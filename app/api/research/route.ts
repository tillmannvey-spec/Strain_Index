/**
 * ============================================================================
 * API ROUTE: /api/research
 * ============================================================================
 * 
 * Dieser API Endpoint ermöglicht die automatische Deep Research für Cannabis-Strains
 * mittels OpenRouter API und Kimi K2.5.
 * 
 * ENDPUNKT: POST /api/research
 * 
 * REQUEST BODY:
 * {
 *   "name": "Alien Mints Huala",      // REQUIRED - Name des Strains
 *   "producer": "Seed Junky",         // OPTIONAL - Hersteller/Züchter
 *   "thcContent": "27%"               // OPTIONAL - THC-Gehalt
 * }
 * 
 * RESPONSE (Erfolg):
 * {
 *   "success": true,
 *   "data": { ...Strain Objekt mit allen Recherche-Daten... }
 * }
 * 
 * RESPONSE (Fehler):
 * {
 *   "success": false,
 *   "error": "Fehlermeldung"
 * }
 * 
 * WICHTIG: Dieser Endpoint benötigt einen OPENROUTER_API_KEY in .env.local
 * ============================================================================
 */

// Next.js Imports für API Routes
import { NextRequest, NextResponse } from 'next/server';

// Importiere unseren Research-Service mit OpenRouter Integration
import { researchStrain, simulateDelay } from '@/app/lib/research';

/**
 * POST Handler - Verarbeitet Research-Anfragen
 * 
 * Diese Funktion wird aufgerufen, wenn ein Client einen POST-Request
 * an /api/research sendet. Sie führt die echte Recherche via
 * OpenRouter API durch und gibt die Ergebnisse zurück.
 * 
 * @param request - Das HTTP-Request-Objekt mit den Eingabedaten
 * @returns HTTP-Response mit den Research-Ergebnissen oder Fehlermeldung
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  
  // =======================================================================
  // SCHRITT 1: API Key aus Umgebungsvariablen lesen
  // Der Key wird in .env.local definiert und ist hier verfügbar
  // =======================================================================
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  // Prüfe, ob der API Key konfiguriert ist
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY ist nicht in .env.local konfiguriert!');
    
    return NextResponse.json(
      {
        success: false,
        error: 'Server-Konfigurationsfehler: OPENROUTER_API_KEY fehlt.',
        details: 'Bitte füge OPENROUTER_API_KEY=dein-key zur .env.local Datei hinzu.',
        help: 'Hol dir einen Key unter: https://openrouter.ai/keys',
      },
      { status: 500 } // HTTP 500 = Internal Server Error
    );
  }
  
  // =======================================================================
  // SCHRITT 2: Request-Daten auslesen
  // Wir parsen den JSON-Body des Requests
  // =======================================================================
  
  let requestData;
  
  try {
    // Versuche, den JSON-Body zu parsen
    requestData = await request.json();
  } catch (error) {
    // Wenn der Body kein gültiges JSON ist, geben wir einen Fehler zurück
    return NextResponse.json(
      {
        success: false,
        error: 'Ungültiges JSON-Format. Bitte überprüfe deine Eingabe.',
      },
      { status: 400 } // HTTP 400 = Bad Request
    );
  }
  
  // =======================================================================
  // SCHRITT 3: Validierung der Eingabedaten
  // Wir prüfen, ob alle erforderlichen Felder vorhanden sind
  // =======================================================================
  
  const { name, producer, thcContent } = requestData;
  
  // Prüfe, ob der Name vorhanden ist
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'Bitte gib einen Strain-Namen ein. Das Feld "name" ist erforderlich.',
      },
      { status: 400 }
    );
  }
  
  // Prüfe, ob der Name nicht zu lang ist (Sicherheitsmaßnahme)
  if (name.length > 100) {
    return NextResponse.json(
      {
        success: false,
        error: 'Der Strain-Name ist zu lang. Maximum sind 100 Zeichen.',
      },
      { status: 400 }
    );
  }
  
  // Prüfe optionale Felder (falls vorhanden)
  if (producer && typeof producer !== 'string') {
    return NextResponse.json(
      {
        success: false,
        error: 'Das Feld "producer" muss ein Text sein.',
      },
      { status: 400 }
    );
  }
  
  if (thcContent && typeof thcContent !== 'string') {
    return NextResponse.json(
      {
        success: false,
        error: 'Das Feld "thcContent" muss ein Text sein (z.B. "27%").',
      },
      { status: 400 }
    );
  }
  
  // =======================================================================
  // SCHRITT 4: Research durchführen
  // Wir rufen unseren Research-Service mit dem API Key auf
  // =======================================================================
  
  try {
    // Simuliere eine kurze Verzögerung für bessere UX
    // (zeigt dem User, dass "etwas passiert")
    await simulateDelay(500);
    
    // Rufe den Research-Service auf mit dem API Key
    // Dieser führt die echte Recherche via OpenRouter durch
    const strainData = await researchStrain(
      name.trim(),
      producer?.trim(),
      thcContent?.trim(),
      apiKey // Übergebe den API Key an den Service
    );
    
    // =======================================================================
    // SCHRITT 5: Erfolgreiche Response
    // Wir geben die recherchierten Daten zurück
    // =======================================================================
    
    return NextResponse.json(
      {
        success: true,
        data: strainData,
        message: `Erfolgreich Deep Research für "${name}" durchgeführt.`,
        source: 'OpenRouter API (Kimi K2.5)',
      },
      { status: 200 } // HTTP 200 = OK
    );
    
  } catch (error) {
    // =======================================================================
    // FEHLERBEHANDLUNG
    // Wenn etwas beim Research schiefgeht
    // =======================================================================
    
    console.error('Fehler beim Research:', error);
    
    // Bestimme die Fehlermeldung
    let errorMessage = 'Ein unerwarteter Fehler ist aufgetreten.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Spezifische Fehlerbehandlung
      if (errorMessage.includes('401')) {
        errorMessage = 'API Authentifizierung fehlgeschlagen. Bitte prüfe deinen OPENROUTER_API_KEY.';
        statusCode = 401;
      } else if (errorMessage.includes('429')) {
        errorMessage = 'API Rate Limit erreicht. Bitte warte einen Moment.';
        statusCode = 429;
      } else if (errorMessage.includes('Netzwerkfehler')) {
        errorMessage = 'Verbindungsproblem zu OpenRouter. Bitte prüfe deine Internetverbindung.';
        statusCode = 503;
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: 'Die Recherche konnte nicht durchgeführt werden.',
        help: 'Wenn das Problem weiterhin besteht, prüfe: 1) API Key in .env.local, 2) Internetverbindung, 3) OpenRouter Status',
      },
      { status: statusCode }
    );
  }
}

/**
 * GET Handler - Information über den Endpoint
 * 
 * Diese Funktion wird aufgerufen, wenn jemand einen GET-Request
 * an /api/research sendet. Sie gibt Informationen über die
 * Verwendung des Endpoints zurück.
 */
export async function GET(): Promise<NextResponse> {
  // Prüfe, ob API Key konfiguriert ist (für Status-Info)
  const apiKeyConfigured = !!process.env.OPENROUTER_API_KEY;
  
  return NextResponse.json(
    {
      message: 'Strain Deep Research API',
      version: '2.0',
      poweredBy: 'OpenRouter API (Kimi K2.5)',
      status: apiKeyConfigured ? 'ready' : 'configuration_missing',
      usage: {
        method: 'POST',
        endpoint: '/api/research',
        body: {
          name: 'string (required) - Name des Strains',
          producer: 'string (optional) - Hersteller/Züchter',
          thcContent: 'string (optional) - THC-Gehalt, z.B. "27%"',
        },
      },
      example: {
        request: {
          name: 'Alien Mints Huala',
          producer: 'Seed Junky Genetics',
          thcContent: '27%',
        },
      },
      configuration: {
        required: 'OPENROUTER_API_KEY in .env.local',
        getKey: 'https://openrouter.ai/keys',
        model: 'moonshotai/kimi-k2.5',
      },
    },
    { status: 200 }
  );
}

/**
 * CORS-Konfiguration
 * 
 * Diese Konfiguration erlaubt es, dass die API auch von anderen
 * Domains aufgerufen werden kann (Cross-Origin Resource Sharing).
 */
export const config = {
  api: {
    bodyParser: {
      // Maximale Größe des Request-Bodies (in Bytes)
      sizeLimit: '1mb',
    },
  },
};
