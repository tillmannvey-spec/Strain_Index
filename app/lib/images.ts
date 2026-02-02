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