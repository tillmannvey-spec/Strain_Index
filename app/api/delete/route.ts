// API Route für das Löschen von Bildern aus Vercel Blob
// Diese Route wird aufgerufen, wenn ein Bild gelöscht werden soll

import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';

/**
 * DELETE Handler - Löscht ein Bild von Vercel Blob
 * 
 * WAS PASSIERT HIER:
 * 1. Der Browser sendet die URL des zu löschenden Bildes
 * 2. Wir extrahieren die URL aus der Anfrage
 * 3. Wir löschen das Bild von Vercel Blob
 * 4. Wir bestätigen das Löschen
 * 
 * WICHTIG: Die URL muss eine gültige Vercel Blob URL sein
 * (z.B. https://xyz123.blob.vercel-storage.com/mein-bild.jpg)
 * 
 * @param request - Die HTTP Anfrage vom Browser
 * @returns JSON mit Erfolgsmeldung oder Fehlermeldung
 */
export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    // === Schritt 1: URL aus der Anfrage extrahieren ===
    // Der Browser sendet die URL als JSON-Body
    // Beispiel: { "url": "https://xyz123.blob.vercel-storage.com/bild.jpg" }
    const body = await request.json();
    const { url } = body;

    // === Schritt 2: Validierung ===
    // Prüfen ob überhaupt eine URL mitgeschickt wurde
    if (!url) {
      return NextResponse.json(
        { error: 'Keine URL angegeben. Bitte gib die Blob-URL des Bildes an.' },
        { status: 400 } // 400 = Bad Request
      );
    }

    // Prüfen ob es eine gültige URL ist
    if (typeof url !== 'string' || !url.startsWith('http')) {
      return NextResponse.json(
        { error: 'Ungültige URL. Die URL muss mit http:// oder https:// beginnen.' },
        { status: 400 }
      );
    }

    // Optional: Prüfen ob es eine Vercel Blob URL ist (Sicherheitsmaßnahme)
    // Dies verhindert, dass jemand versehentlich andere URLs löscht
    if (!url.includes('blob.vercel-storage.com')) {
      return NextResponse.json(
        { error: 'Ungültige Blob-URL. Nur Vercel Blob URLs sind erlaubt.' },
        { status: 400 }
      );
    }

    // === Schritt 3: Bild von Vercel Blob löschen ===
    // Die del() Funktion entfernt die Datei aus dem Storage
    // BLOB_READ_WRITE_TOKEN muss gesetzt sein (siehe .env.example)
    await del(url);

    // === Schritt 4: Erfolg zurückmelden ===
    console.log('[API Delete] Bild erfolgreich gelöscht:', url);
    
    return NextResponse.json({
      success: true,
      message: 'Bild erfolgreich gelöscht',
      deletedUrl: url,
    });

  } catch (error) {
    // === Fehlerbehandlung ===
    // Typische Fehler:
    // - Bild wurde bereits gelöscht
    // - URL existiert nicht
    // - Keine Berechtigung (Token falsch)
    console.error('[API Delete] Fehler beim Löschen:', error);
    
    // Wenn das Bild nicht gefunden wurde, ist das kein kritischer Fehler
    // Wir behandeln es trotzdem als Erfolg, da das Ziel (Bild nicht mehr vorhanden) erreicht ist
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return NextResponse.json({
        success: true,
        message: 'Bild war bereits gelöscht oder nicht gefunden',
        deletedUrl: null,
      });
    }

    return NextResponse.json(
      { 
        error: 'Fehler beim Löschen des Bildes. Bitte versuche es erneut.',
        details: errorMessage
      },
      { status: 500 } // 500 = Internal Server Error
    );
  }
}
