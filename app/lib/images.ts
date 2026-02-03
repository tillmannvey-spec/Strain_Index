// Image Handling with browser-image-compression

import imageCompression from 'browser-image-compression';

// Compression options for iOS storage optimization
const compressionOptions = {
  maxWidthOrHeight: 800, // Max 800px for iOS storage limits
  useWebWorker: true,
  fileType: 'image/jpeg',
  initialQuality: 0.8, // 80% quality
  maxIteration: 10,
  exifOrientation: 1, // Keep original orientation (1 = no rotation)
};

// Compress an image file and return as base64
export async function compressImage(file: File): Promise<string> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File is not an image');
    }

    // Compress the image
    const compressedFile = await imageCompression(file, compressionOptions);
    
    // Convert to base64
    const base64 = await fileToBase64(compressedFile);
    
    console.log('[Image] Compressed', file.name, 'from', formatFileSize(file.size), 'to', formatFileSize(compressedFile.size));
    
    return base64;
  } catch (error) {
    console.error('[Image] Compression error:', error);
    throw error;
  }
}

// Convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Convert base64 to File (for re-upload scenarios)
export function base64ToFile(base64: string, filename: string): File {
  // Split the base64 string to get the mime type and data
  const parts = base64.split(';base64,');
  const mimeType = parts[0].split(':')[1];
  const byteString = atob(parts[1]);
  
  // Convert to byte array
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  // Create blob and file
  const blob = new Blob([ab], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
}

// Get image dimensions
export function getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = base64;
  });
}

// Resize image if it exceeds max dimensions
export async function resizeImage(base64: string, maxWidth: number, maxHeight: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      
      // Calculate new dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      // Create canvas and resize
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 with compression
      const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
      resolve(resizedBase64);
    };
    img.onerror = reject;
    img.src = base64;
  });
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get approximate base64 size in bytes
export function getBase64Size(base64: string): number {
  // Remove data URL prefix
  const base64Data = base64.split(',')[1] || base64;
  // Calculate size (base64 is ~4/3 of binary size)
  return Math.ceil((base64Data.length * 3) / 4);
}

// Validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Datei muss ein Bild sein (JPG, PNG, etc.)' };
  }
  
  // Check file size (max 10MB before compression)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: `Bild zu groß (${formatFileSize(file.size)}). Maximum: ${formatFileSize(maxSize)}` };
  }
  
  // Check supported formats
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  if (!supportedTypes.includes(file.type)) {
    return { valid: false, error: 'Format nicht unterstützt. Bitte JPG, PNG oder WebP verwenden.' };
  }
  
  return { valid: true };
}

// Create thumbnail from base64
export async function createThumbnail(base64: string, size: number = 150): Promise<string> {
  return resizeImage(base64, size, size);
}

// Process multiple images
export async function processImages(files: File[]): Promise<{ base64: string; filename: string }[]> {
  const results = [];
  
  for (const file of files) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      console.warn('[Image] Skipping invalid file:', file.name, validation.error);
      continue;
    }
    
    try {
      const base64 = await compressImage(file);
      results.push({ base64, filename: file.name });
    } catch (error) {
      console.error('[Image] Failed to process:', file.name, error);
    }
  }
  
  return results;
}

// ============================================================================
// Vercel Blob Upload Funktionen
// ============================================================================
// Diese Funktionen ermöglichen das Speichern von Bildern in der Cloud
// statt als Base64 in der IndexedDB. Das spielt Speicherplatz und verbessert
// die Performance.
// ============================================================================

/**
 * Lädt ein Bild zu Vercel Blob hoch
 * 
 * WAS MACHT DIESE FUNKTION:
 * 1. Nimmt eine Bild-Datei entgegen
 * 2. Komprimiert das Bild zuerst (wichtig für schnellere Uploads!)
 * 3. Sendet das komprimierte Bild an unsere API Route (/api/upload)
 * 4. Gibt die öffentliche URL zurück, unter der das Bild gespeichert ist
 * 
 * @param file - Das Bild als File-Objekt (vom <input type="file">)
 * @returns Promise<string> - Die URL des hochgeladenen Bildes
 * @throws Error wenn der Upload fehlschlägt
 * 
 * BEISPIEL VERWENDUNG:
 * ```typescript
 * const fileInput = document.querySelector('input[type="file"]');
 * const file = fileInput.files[0];
 * const imageUrl = await uploadImageToBlob(file);
 * console.log('Bild ist jetzt verfügbar unter:', imageUrl);
 * ```
 */
export async function uploadImageToBlob(file: File): Promise<string> {
  try {
    // === Schritt 1: Bild validieren ===
    // Prüfen ob das File wirklich ein Bild ist
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Ungültige Bilddatei');
    }

    // === Schritt 2: Bild komprimieren ===
    // Das ist WICHTIG! Komprimierte Bilder laden schneller hoch
    // und verbrauchen weniger Speicher in Vercel Blob
    console.log('[Blob Upload] Komprimiere Bild:', file.name);
    const compressedFile = await imageCompression(file, compressionOptions);
    console.log('[Blob Upload] Komprimiert von', formatFileSize(file.size), 'auf', formatFileSize(compressedFile.size));

    // === Schritt 3: FormData erstellen ===
    // FormData ist das Format, das HTML Forms verwenden
    // Es erlaubt das Senden von Dateien über HTTP
    const formData = new FormData();
    formData.append('file', compressedFile); // Der Name 'file' muss zur API Route passen!

    // === Schritt 4: An unsere API Route senden ===
    // Wir rufen POST /api/upload auf (relativer Pfad funktioniert automatisch)
    console.log('[Blob Upload] Sende an API...');
    const response = await fetch('/api/upload', {
      method: 'POST', // HTTP Methode muss POST sein
      body: formData, // Der Body enthält unsere Datei
      // WICHTIG: Kein Content-Type Header setzen!
      // Der Browser setzt den automatisch mit dem richtigen Boundary
    });

    // === Schritt 5: Antwort verarbeiten ===
    // Prüfen ob der Server einen Fehler zurückgegeben hat
    if (!response.ok) {
      // Bei Fehler gibt die API ein JSON mit { error: "..." } zurück
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP Fehler: ${response.status}`);
    }

    // Erfolg! Wir holen uns die URL aus der Antwort
    const result = await response.json();
    console.log('[Blob Upload] Erfolg! URL:', result.url);

    // Die URL ist das Wichtigste - die speichern wir in der Datenbank
    return result.url;

  } catch (error) {
    // Fehler protokollieren und weiterwerfen
    console.error('[Blob Upload] Fehler:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Unbekannter Fehler beim Upload');
  }
}

/**
 * Löscht ein Bild von Vercel Blob
 * 
 * WAS MACHT DIESE FUNKTION:
 * 1. Nimmt die URL eines gespeicherten Bildes entgegen
 * 2. Sendet einen Lösch-Befehl an unsere API Route (/api/delete)
 * 3. Das Bild wird dauerhaft aus Vercel Blob entfernt
 * 
 * @param url - Die Blob-URL des zu löschenden Bildes
 * @returns Promise<void> - Erfolgt ohne Rückgabewert
 * @throws Error wenn das Löschen fehlschlägt
 * 
 * BEISPIEL VERWENDUNG:
 * ```typescript
 * const imageUrl = 'https://xyz.blob.vercel-storage.com/bild.jpg';
 * await deleteImageFromBlob(imageUrl);
 * console.log('Bild wurde gelöscht');
 * ```
 */
export async function deleteImageFromBlob(url: string): Promise<void> {
  try {
    // === Schritt 1: URL validieren ===
    // Nur Vercel Blob URLs dürfen gelöscht werden (Sicherheit)
    if (!url || typeof url !== 'string') {
      throw new Error('Keine gültige URL angegeben');
    }

    // Prüfen ob es eine Vercel Blob URL ist
    if (!url.includes('blob.vercel-storage.com')) {
      // Wenn es eine alte Base64 URL ist, ignorieren wir sie einfach
      // (Base64 Bilder sind im lokalen Speicher, nicht in der Cloud)
      if (url.startsWith('data:image')) {
        console.log('[Blob Delete] Base64 Bild übersprungen (lokaler Speicher)');
        return;
      }
      throw new Error('Nur Vercel Blob URLs können gelöscht werden');
    }

    // === Schritt 2: Löschanfrage senden ===
    // Wir rufen DELETE /api/delete auf mit der URL als JSON Body
    console.log('[Blob Delete] Lösche Bild:', url);
    const response = await fetch('/api/delete', {
      method: 'DELETE', // HTTP DELETE Methode
      headers: {
        'Content-Type': 'application/json', // Wir senden JSON
      },
      body: JSON.stringify({ url }), // Die URL als JSON
    });

    // === Schritt 3: Antwort prüfen ===
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP Fehler: ${response.status}`);
    }

    const result = await response.json();
    console.log('[Blob Delete] Erfolg:', result.message);

  } catch (error) {
    console.error('[Blob Delete] Fehler:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Unbekannter Fehler beim Löschen');
  }
}

/**
 * Prüft ob ein Bild in Vercel Blob gespeichert ist
 * 
 * @param url - Die zu prüfende URL
 * @returns true wenn es eine Blob URL ist, false wenn Base64 oder ungültig
 */
export function isBlobUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.includes('blob.vercel-storage.com');
}

/**
 * Verarbeitet mehrere Bilder und lädt sie zu Vercel Blob hoch
 * 
 * @param files - Array von File-Objekten
 * @returns Array von Objekten mit { url, filename }
 */
export async function processAndUploadImages(
  files: File[]
): Promise<{ url: string; filename: string }[]> {
  const results = [];

  for (const file of files) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      console.warn('[Blob] Überspringe ungültige Datei:', file.name, validation.error);
      continue;
    }

    try {
      // Hochladen zu Vercel Blob
      const url = await uploadImageToBlob(file);
      results.push({ url, filename: file.name });
    } catch (error) {
      console.error('[Blob] Fehler beim Upload:', file.name, error);
    }
  }

  return results;
}