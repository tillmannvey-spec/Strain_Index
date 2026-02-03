// API Route für das Hochladen von Bildern zu Vercel Blob
// Diese Route wird vom Browser aufgerufen, um Bilder in die Cloud zu speichern

import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

/**
 * POST Handler - Nimmt ein Bild entgegen und lädt es zu Vercel Blob hoch
 * 
 * WAS PASSIERT HIER:
 * 1. Der Browser sendet ein Bild als FormData (ähnlich wie ein HTML Formular)
 * 2. Wir extrahieren die Datei aus der Anfrage
 * 3. Wir laden die Datei zu Vercel Blob hoch
 * 4. Wir geben die öffentliche URL des gespeicherten Bildes zurück
 * 
 * @param request - Die HTTP Anfrage vom Browser
 * @returns JSON mit der Blob-URL oder Fehlermeldung
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // === Schritt 1: Daten aus der Anfrage extrahieren ===
    // Der Browser sendet die Daten als FormData (multipart/form-data)
    // Das ist das Format, das HTML Forms standardmäßig verwenden
    const formData = await request.formData();
    
    // Die Datei wurde unter dem Namen 'file' im FormData gespeichert
    // Das müssen wir genau so abrufen, wie es vom Frontend gesendet wurde
    const file = formData.get('file') as File | null;

    // === Schritt 2: Validierung ===
    // Prüfen ob überhaupt eine Datei mitgeschickt wurde
    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei gefunden. Bitte wähle ein Bild aus.' },
        { status: 400 } // 400 = Bad Request (Client-Fehler)
      );
    }

    // Prüfen ob es wirklich ein Bild ist
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Die Datei ist kein Bild. Bitte wähle ein JPG, PNG oder WebP.' },
        { status: 400 }
      );
    }

    // === Schritt 3: Eindeutigen Dateinamen erstellen ===
    // Wir fügen einen Zeitstempel hinzu, um Kollisionen zu vermeiden
    // Beispiel: "mein-bild.jpg" wird zu "mein-bild-1706871234567.jpg"
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sonderzeichen entfernen
    const timestamp = Date.now(); // Aktuelle Zeit in Millisekunden
    const filename = `${timestamp}-${originalName}`;

    // === Schritt 4: Bild zu Vercel Blob hochladen ===
    // Die put() Funktion speichert die Datei und gibt eine URL zurück
    // BLOB_READ_WRITE_TOKEN muss in den Umgebungsvariablen gesetzt sein!
    const blob = await put(filename, file, {
      // Der Zugriffsmodus: 'public' bedeutet jeder kann das Bild sehen
      access: 'public',
      
      // Optional: Content-Type explizit setzen (damit Browser das Bild richtig anzeigen)
      contentType: file.type,
    });

    // === Schritt 5: Erfolg zurückmelden ===
    // Wir geben die URL zurück, unter der das Bild jetzt erreichbar ist
    console.log('[API Upload] Bild erfolgreich hochgeladen:', blob.url);
    
    return NextResponse.json({
      success: true,
      url: blob.url,        // Die öffentliche URL des Bildes
      pathname: blob.pathname, // Der Dateipfad im Blob Storage
    });

  } catch (error) {
    // === Fehlerbehandlung ===
    // Wenn etwas schief geht, loggen wir es und geben eine Fehlermeldung zurück
    console.error('[API Upload] Fehler beim Hochladen:', error);
    
    return NextResponse.json(
      { 
        error: 'Fehler beim Hochladen des Bildes. Bitte versuche es erneut.',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 } // 500 = Internal Server Error (Server-Fehler)
    );
  }
}
