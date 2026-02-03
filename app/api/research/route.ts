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
 * REQUEST BODY (Einzelner Strain):
 * {
 *   "name": "Alien Mints Huala",      // REQUIRED - Name des Strains
 *   "producer": "Seed Junky",         // OPTIONAL - Hersteller/Züchter
 *   "thcContent": "27%"               // OPTIONAL - THC-Gehalt
 * }
 * 
 * REQUEST BODY (Batch - Mehrere Strains):
 * {
 *   "strains": [                      // REQUIRED - Array von Strains
 *     {
 *       "name": "Alien Mints Huala",
 *       "producer": "Seed Junky",
 *       "thcContent": "27%"
 *     },
 *     {
 *       "name": "OG Kush",
 *       "producer": "Unknown"
 *     }
 *   ]
 * }
 * 
 * RESPONSE (Einzelner Strain - Erfolg):
 * {
 *   "success": true,
 *   "data": { ...Strain Objekt mit allen Recherche-Daten... }
 * }
 * 
 * RESPONSE (Batch - Erfolg):
 * {
 *   "success": true,
 *   "data": [
 *     { "success": true, "strain": {...} },
 *     { "success": false, "error": "Nicht gefunden", "requestedName": "OG Kush" }
 *   ],
 *   "summary": {
 *     "total": 2,
 *     "successful": 1,
 *     "failed": 1
 *   }
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
import { researchStrain, researchMultipleStrains, simulateDelay, BatchResearchResult } from '@/app/lib/research';

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
  // SCHRITT 3: Unterscheidung zwischen Einzel- und Batch-Request
  // Prüfe, ob es ein Batch-Request (strains Array) oder Einzel-Request ist
  // =======================================================================
  
  const { strains, name, producer, thcContent } = requestData;
  
  // Wenn ein 'strains' Array vorhanden ist, verarbeite als Batch
  if (strains && Array.isArray(strains)) {
    return handleBatchRequest(strains, apiKey);
  }
  
  // Ansonsten verarbeite als Einzel-Request
  return handleSingleRequest(name, producer, thcContent, apiKey);
}

/**
 * =============================================================================
 * HELFERFUNKTION: Einzelner Strain Request
 * =============================================================================
 */
async function handleSingleRequest(
  name: string,
  producer: string | undefined,
  thcContent: string | undefined,
  apiKey: string
): Promise<NextResponse> {
  
  // =======================================================================
  // SCHRITT 1: Validierung der Eingabedaten
  // =======================================================================
  
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
  // SCHRITT 2: Research durchführen
  // =======================================================================
  
  try {
    // Simuliere eine kurze Verzögerung für bessere UX
    await simulateDelay(500);
    
    // Rufe den Research-Service auf mit dem API Key
    const strainData = await researchStrain(
      name.trim(),
      producer?.trim(),
      thcContent?.trim(),
      apiKey
    );
    
    // =======================================================================
    // SCHRITT 3: Erfolgreiche Response
    // =======================================================================
    
    return NextResponse.json(
      {
        success: true,
        data: strainData,
        message: `Erfolgreich Deep Research für "${name}" durchgeführt.`,
        source: 'OpenRouter API (Kimi K2.5)',
      },
      { status: 200 }
    );
    
  } catch (error) {
    // =======================================================================
    // FEHLERBEHANDLUNG
    // =======================================================================
    
    console.error('Fehler beim Research:', error);
    
    let errorMessage = 'Ein unerwarteter Fehler ist aufgetreten.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
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
 * =============================================================================
 * HELFERFUNKTION: Batch Request (Mehrere Strains)
 * =============================================================================
 * 
 * Verarbeitet ein Array von Strains nacheinander mit Rate-Limiting.
 * Selbst wenn einzelne Strains fehlschlagen, werden die anderen verarbeitet.
 */
async function handleBatchRequest(
  strains: Array<{ name: string; producer?: string; thcContent?: string }>,
  apiKey: string
): Promise<NextResponse> {
  
  // =======================================================================
  // SCHRITT 1: Validierung
  // =======================================================================
  
  // Prüfe, ob das Array nicht leer ist
  if (strains.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'Das "strains" Array darf nicht leer sein.',
      },
      { status: 400 }
    );
  }
  
  // Prüfe, ob nicht zu viele Strains auf einmal angefragt werden
  const MAX_BATCH_SIZE = 20;
  if (strains.length > MAX_BATCH_SIZE) {
    return NextResponse.json(
      {
        success: false,
        error: `Zu viele Strains. Maximum sind ${MAX_BATCH_SIZE} pro Batch-Request.`,
      },
      { status: 400 }
    );
  }
  
  // Validiere jeden Eintrag im Array
  for (let i = 0; i < strains.length; i++) {
    const strain = strains[i];
    
    if (!strain.name || typeof strain.name !== 'string' || strain.name.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Ungültiger Eintrag bei Index ${i}: "name" ist erforderlich.`,
        },
        { status: 400 }
      );
    }
    
    if (strain.name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: `Ungültiger Eintrag bei Index ${i}: Name ist zu lang (max 100 Zeichen).`,
        },
        { status: 400 }
      );
    }
  }
  
  // =======================================================================
  // SCHRITT 2: Batch-Research durchführen
  // =======================================================================
  
  try {
    console.log(`[Batch Research] Starte Verarbeitung von ${strains.length} Strains...`);
    
    // Verwende die Batch-Funktion aus dem Research-Service
    const results = await researchMultipleStrains(
      strains,
      apiKey,
      undefined, // Kein Progress-Callback im API-Endpoint (Client kann nicht darauf zugreifen)
      {
        delayBetweenRequests: 1500, // 1.5 Sekunden Pause zwischen Requests
        abortOnError: false,         // Fahre fort, auch wenn einzelne fehlschlagen
      }
    );
    
    // =======================================================================
    // SCHRITT 3: Ergebnisse aufbereiten
    // =======================================================================
    
    // Erstelle eine Zusammenfassung
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    // Formatiere die Ergebnisse für die Response
    const formattedResults = results.map(result => ({
      success: result.success,
      requestedName: result.requestedName,
      strain: result.strain,
      error: result.error,
    }));
    
    console.log(`[Batch Research] Abgeschlossen: ${successful} erfolgreich, ${failed} fehlgeschlagen`);
    
    return NextResponse.json(
      {
        success: true,
        data: formattedResults,
        summary: {
          total: results.length,
          successful,
          failed,
        },
        message: `Batch-Research abgeschlossen: ${successful} von ${results.length} Strains erfolgreich recherchiert.`,
        source: 'OpenRouter API (Kimi K2.5)',
      },
      { status: 200 }
    );
    
  } catch (error) {
    // =======================================================================
    // FEHLERBEHANDLUNG
    // =======================================================================
    
    console.error('Fehler beim Batch-Research:', error);
    
    let errorMessage = 'Ein unerwarteter Fehler ist beim Batch-Research aufgetreten.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (errorMessage.includes('401')) {
        errorMessage = 'API Authentifizierung fehlgeschlagen. Bitte prüfe deinen OPENROUTER_API_KEY.';
        statusCode = 401;
      } else if (errorMessage.includes('429')) {
        errorMessage = 'API Rate Limit erreicht. Bitte warte einen Moment und versuche es mit weniger Strains.';
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
        message: 'Das Batch-Research konnte nicht durchgeführt werden.',
        help: 'Wenn das Problem weiterhin besteht, versuche es mit weniger Strains oder prüfe deinen API Key.',
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
      version: '2.1',
      poweredBy: 'OpenRouter API (Kimi K2.5)',
      status: apiKeyConfigured ? 'ready' : 'configuration_missing',
      features: ['single', 'batch'],
      usage: {
        method: 'POST',
        endpoint: '/api/research',
        single: {
          body: {
            name: 'string (required) - Name des Strains',
            producer: 'string (optional) - Hersteller/Züchter',
            thcContent: 'string (optional) - THC-Gehalt, z.B. "27%"',
          },
        },
        batch: {
          body: {
            strains: 'array (required) - Array von Strain-Objekten',
            'strains[].name': 'string (required) - Name des Strains',
            'strains[].producer': 'string (optional) - Hersteller/Züchter',
            'strains[].thcContent': 'string (optional) - THC-Gehalt',
          },
          limits: {
            maxBatchSize: 20,
            delayBetweenRequests: '1.5 Sekunden (Rate-Limiting)',
          },
        },
      },
      examples: {
        single: {
          request: {
            name: 'Alien Mints Huala',
            producer: 'Seed Junky Genetics',
            thcContent: '27%',
          },
        },
        batch: {
          request: {
            strains: [
              { name: 'Alien Mints Huala', producer: 'Seed Junky', thcContent: '27%' },
              { name: 'OG Kush' },
              { name: 'Blue Dream', thcContent: '20%' },
            ],
          },
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
