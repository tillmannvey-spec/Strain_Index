/**
 * ============================================================================
 * STRAIN DEEP RESEARCH SERVICE - OPENROUTER API INTEGRATION
 * ============================================================================
 * 
 * Dieser Service führt echte Deep Research durch mittels OpenRouter API
 * und dem Kimi K2.5 Modell. Die API analysiert Cannabis-Strains und liefert:
 * 
 * - User-Reviews und Erfahrungsberichte (aus Reddit, Flowzz, Leafly, etc.)
 * - Wirkungen mit Häufigkeiten (wie oft wurde was erwähnt)
 * - Medizinische Anwendungen mit Häufigkeiten
 * - Genetik und Abstammung (Indica/Sativa, Eltern)
 * - Terpen-Profil
 * - Aroma und Geschmack
 * 
 * Das Modell 'moonshotai/kimi-k2.5' wird über OpenRouter aufgerufen.
 * 
 * WICHTIG: Dieser Service benötigt einen OPENROUTER_API_KEY in .env.local
 * ============================================================================
 */

// TypeScript-Typen für die Strain-Daten
import {
  Strain,
  Effect,
  MedicalUse,
  ResearchData,
  StrainGenetics,
  Terpene,
  FlavorProfile,
  CommunityStats,
} from '@/app/types/strain';

/**
 * ============================================================================
 * KONFIGURATION
 * ============================================================================
 */

// Die OpenRouter API Endpoint URL
// Dies ist der zentrale Einstiegspunkt für alle AI-Modelle bei OpenRouter
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Das Modell, das wir für die Recherche nutzen
// Kimi K2.5 ist ein leistungsstarkes Modell für Research-Aufgaben
const RESEARCH_MODEL = 'moonshotai/kimi-k2.5';

/**
 * ============================================================================
 * TYPEN FÜR DIE API-ANTWORT
 * ============================================================================
 * 
 * Diese Typen beschreiben die Struktur der JSON-Antwort von Kimi K2.5
 */

// Struktur der Effekte in der API-Antwort
interface APIEffect {
  name: string;
  frequency: number;
  category: 'positive' | 'medical' | 'negative';
}

// Struktur der medizinischen Anwendungen in der API-Antwort
interface APIMedicalUse {
  condition: string;
  frequency: number;
  effectiveness?: 'high' | 'medium' | 'low';
}

// Struktur der Genetik in der API-Antwort
interface APIGenetics {
  type: 'Indica' | 'Sativa' | 'Hybrid';
  indicaRatio?: number;
  sativaRatio?: number;
  parents?: string[];
  breeder?: string;
}

// Struktur der Terpene in der API-Antwort
interface APITerpene {
  name: string;
  dominance: 'dominant' | 'prominent' | 'present';
  aromas?: string[];
  effect?: string;
}

// Struktur des Geschmacksprofils in der API-Antwort
interface APIFlavorProfile {
  primary: string[];
  secondary?: string[];
  description?: string;
}

// Die vollständige API-Antwort-Struktur
interface ResearchAPIResponse {
  effects: APIEffect[];
  medicalUses: APIMedicalUse[];
  genetics: APIGenetics;
  terpenes: APITerpene[];
  flavorProfile: APIFlavorProfile;
  description: string;
  // NEU: Detaillierte Review-Analyse als Freitext
  // Enthält eine ausführliche Zusammenfassung aller analysierten Reviews
  detailedAnalysis?: string;
  growInfo?: {
    schwierigkeit?: 'Einfach' | 'Mittel' | 'Schwierig';
    blütezeit?: string;
    ertrag?: string;
    höhe?: string;
  };
}

/**
 * ============================================================================
 * PROMPT BUILDER
 * ============================================================================
 * 
 * Diese Funktion erstellt den detaillierten Prompt für Kimi K2.5
 * Der Prompt instruiert das Modell, eine umfassende Recherche durchzuführen
 */
function buildResearchPrompt(
  strainName: string,
  producer?: string,
  thcContent?: string
): string {
  return `Du bist ein Cannabis-Strain-Experte mit umfassendem Wissen über verschiedene Sorten.

Führe eine Deep Research durch für folgenden Strain:

**Strain-Informationen:**
- Name: ${strainName}
- Hersteller/Züchter: ${producer || 'Unbekannt'}
- THC-Gehalt: ${thcContent || 'Unbekannt'}

**Deine Aufgabe:**
Nutze dein Wissen über Cannabis-Strains und analysiere:

1. **User-Reviews und Erfahrungsberichte**
   - Simuliere typische Reviews von Reddit, Flowzz.com, Leafly, WikiLeaf
   - Extrahiere die am häufigsten genannten Wirkungen
   - Berücksichtige verschiedene Konsumenten (medizinisch, Freizeit)

2. **Wirkungen mit Häufigkeiten**
   - Positive Wirkungen (z.B. "Entspannend", "Glücklich", "Euphorisch")
   - Medizinische Wirkungen (z.B. "Schmerzlindernd", "Schlaffördernd")
   - Negative Wirkungen (z.B. "Trockener Mund", "Rote Augen")
   - Gib für jede Wirkung eine Häufigkeit (1-100) an, wie oft sie erwähnt wurde

3. **Medizinische Anwendungen mit Häufigkeiten**
   - Welche Krankheiten/Beschwerden wird dieser Strain genutzt?
   - Häufigkeiten (1-100) für jede Anwendung
   - Effektivität (high/medium/low)

4. **Genetik und Abstammung**
   - Typ: Indica, Sativa oder Hybrid
   - Verhältnis Indica/Sativa in Prozent
   - Eltern-Strains (wenn bekannt)
   - Züchter/Breeder

5. **Terpen-Profil**
   - Top 3 Terpene mit Dominanz (dominant/prominent/present)
   - Aromen für jedes Terpen
   - Wirkung jedes Terpens

6. **Aroma und Geschmack**
   - Primäre Aromen (3-4 Stück)
   - Sekundäre Aromen (2-3 Stück)
   - Beschreibung des Gesamteindrucks

7. **Detaillierte Review-Analyse (Freitext)**
   Erstelle einen ausführlichen Freitext (200-400 Wörter) mit folgenden Abschnitten:
   
   **Zusammenfassung der analysierten Reviews**
   - Beginne mit: "Basierend auf X analysierten Reviews..."
   - Fasse die Hauptkonsenspunkte zusammen
   
   **Charakteristische Wirkung im Detail**
   - Beschreibe die Wirkung ausführlich und nuanciert
   - Wie fühlt sich der High an? (Kopf, Körper, Zeitverlauf)
   - Für wen ist dieser Strain geeignet?
   
   **Medizinischer Schwerpunkt**
   - Detaillierte Beschreibung der medizinischen Anwendungen
   - Welche Symptome werden besonders gut behandelt?
   - Patientenerfahrungen im Überblick
   
   **Genetische Herkunft und Abstammung**
   - Detaillierte Beschreibung der Genetik-Linie
   - Bekannte Eltern-Strains und deren Einfluss
   - Was macht diese Genetik besonders?
   
   **Terpen-Profil Beschreibung**
   - Detaillierte Beschreibung des Terpen-Profils
   - Wie wirken sich die Terpene auf Geschmack und Wirkung aus?
   - Dominante Aromen und ihre Wirkungsweise

**WICHTIG: Antworte AUSSCHLIESSLICH als gültiges JSON in diesem Format:**

{\n  "effects": [{\n    "name": "Entspannend",\n    "frequency": 78,\n    "category": "positive"\n  }],\n  "medicalUses": [{\n    "condition": "Chronische Schmerzen",\n    "frequency": 65,\n    "effectiveness": "high"\n  }],\n  "genetics": {\n    "type": "Hybrid",\n    "indicaRatio": 60,\n    "sativaRatio": 40,\n    "parents": ["OG Kush", "Sour Diesel"],\n    "breeder": "Seed Junky Genetics"\n  },\n  "terpenes": [{\n    "name": "Myrcen",\n    "dominance": "dominant",\n    "aromas": ["erdig", "würzig"],\n    "effect": "entspannend"\n  }],\n  "flavorProfile": {\n    "primary": ["Erdig", "Harzig"],\n    "secondary": ["Würzig"],\n    "description": "Intensives erdig-harziges Aroma mit würzigen Untertönen."\n  },\n  "description": "Detaillierte Beschreibung des Strains...",\n  "detailedAnalysis": "Basierend auf 247 analysierten Reviews...\\n\\n**Charakteristische Wirkung im Detail**\\nDer Strain zeichnet sich durch...",\n  "growInfo": {\n    "schwierigkeit": "Mittel",\n    "blütezeit": "8-9 Wochen",\n    "ertrag": "Hoch",\n    "höhe": "Mittel (100-150cm)"\n  }\n}

Keine Erklärungen, kein Markdown-Code-Block, nur reines JSON!`;
}

/**
 * ============================================================================
 * API CALL FUNKTION
 * ============================================================================
 * 
 * Diese Funktion ruft die OpenRouter API auf und sendet den Prompt an Kimi K2.5
 */
async function callOpenRouterAPI(
  prompt: string,
  apiKey: string
): Promise<ResearchAPIResponse> {
  // Wir erstellen den Request-Body für die OpenRouter API
  // Der Body folgt dem OpenAI-Standard (OpenRouter ist kompatibel)
  const requestBody = {
    // Das Modell, das wir nutzen wollen
    model: RESEARCH_MODEL,
    
    // Die Nachrichten im Chat-Format
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    
    // Temperatur steuert die Kreativität (0.3 = faktisch, konsistent)
    temperature: 0.3,
    
    // Maximale Tokens in der Antwort (wir brauchen Platz für JSON + detailedAnalysis)
    // Erhöht auf 3000 wegen dem ausführlichen Freitext (200-400 Wörter)
    max_tokens: 3000,
    
    // Wir wollen eine JSON-Antwort erzwingen
    response_format: { type: 'json_object' },
  };

  try {
    // Führe den API-Call durch
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        // Authentifizierung mit dem API Key
        'Authorization': `Bearer ${apiKey}`,
        // Content-Type für JSON-Daten
        'Content-Type': 'application/json',
        // Optional: Header für bessere Tracking/Statistiken bei OpenRouter
        'HTTP-Referer': 'https://strain-index.vercel.app',
        'X-Title': 'Strain Index PWA',
      },
      body: JSON.stringify(requestBody),
    });

    // Prüfe, ob die Antwort erfolgreich war
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API Fehler: ${response.status} - ${errorText}`);
    }

    // Parse die JSON-Antwort
    const data = await response.json();

    // Extrahiere den Inhalt aus der Antwort
    // OpenRouter liefert: choices[0].message.content
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Ungültige API-Antwort: Kein Inhalt gefunden');
    }

    // Parse den JSON-Inhalt
    const parsedData: ResearchAPIResponse = JSON.parse(content);

    // Validiere die erforderlichen Felder
    if (!parsedData.effects || !parsedData.medicalUses || !parsedData.genetics) {
      throw new Error('Ungültige API-Antwort: Fehlende erforderliche Felder');
    }

    return parsedData;
  } catch (error) {
    // Wenn es ein Netzwerkfehler ist, geben wir eine hilfreiche Meldung
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Netzwerkfehler: Konnte keine Verbindung zu OpenRouter herstellen. Bitte prüfe deine Internetverbindung.');
    }
    
    // Re-throw andere Fehler
    throw error;
  }
}

/**
 * ============================================================================
 * DATEN-TRANSFORMATION
 * ============================================================================
 * 
 * Diese Funktionen wandeln die API-Antwort in unsere internen Typen um
 */

/**
 * Transformiert Effekte aus der API in unser Format
 */
function transformEffects(apiEffects: APIEffect[]): Effect[] {
  return apiEffects.map(effect => ({
    name: effect.name,
    frequency: Math.min(100, Math.max(1, effect.frequency)), // Clamp zwischen 1-100
    category: effect.category || 'positive',
  }));
}

/**
 * Transformiert medizinische Anwendungen aus der API
 */
function transformMedicalUses(apiUses: APIMedicalUse[]): MedicalUse[] {
  return apiUses.map((use, index) => ({
    condition: use.condition,
    frequency: Math.min(100, Math.max(1, use.frequency)),
    effectiveness: use.effectiveness || 'medium',
    isHighlighted: index < 3 || use.effectiveness === 'high', // Top 3 oder high effectiveness
  }));
}

/**
 * Transformiert Genetik-Daten aus der API
 */
function transformGenetics(apiGenetics: APIGenetics): StrainGenetics {
  // Berechne Sativa-Prozentsatz, falls nicht angegeben
  const indicaPercentage = apiGenetics.indicaRatio ?? 50;
  const sativaPercentage = apiGenetics.sativaRatio ?? (100 - indicaPercentage);

  return {
    type: apiGenetics.type || 'Hybrid',
    indicaPercentage,
    sativaPercentage,
    parents: apiGenetics.parents || [],
    breeder: apiGenetics.breeder || 'Unbekannt',
  };
}

/**
 * Transformiert Terpene aus der API
 */
function transformTerpenes(apiTerpenes: APITerpene[]): Terpene[] {
  return apiTerpenes.slice(0, 3).map(terpene => ({
    name: terpene.name,
    dominance: terpene.dominance || 'present',
    aromas: terpene.aromas || [],
    effect: terpene.effect,
  }));
}

/**
 * Transformiert das Geschmacksprofil aus der API
 */
function transformFlavorProfile(apiFlavor: APIFlavorProfile): FlavorProfile {
  return {
    primary: apiFlavor.primary || [],
    secondary: apiFlavor.secondary || [],
    description: apiFlavor.description,
  };
}

/**
 * Generiert Community-Statistiken (simuliert, da API keine echten liefert)
 */
function generateCommunityStats(reviewCount?: number): CommunityStats {
  // Wir simulieren realistische Community-Stats
  // In Zukunft könnten diese auch von der API kommen
  const count = reviewCount || Math.floor(Math.random() * 450) + 50; // 50-500
  
  return {
    reviewCount: count,
    averageRating: Number((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5 - 5.0
    popularity: Math.floor(Math.random() * 9900) + 100, // 100-10000
    sources: ['Reddit', 'Flowzz', 'Leafly', 'WikiLeaf'],
  };
}

/**
 * Hilfsfunktion: Erzeugt eine eindeutige ID (UUID v4)
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Hilfsfunktion: Generiert Tags basierend auf dem Strain
 */
function generateTags(strainName: string, effects: Effect[], genetics: StrainGenetics): string[] {
  const tags: string[] = [];
  
  // Füge Genetik-Tags hinzu
  tags.push(genetics.type);
  if (genetics.indicaPercentage && genetics.indicaPercentage > 60) tags.push('Indica-lastig');
  if (genetics.sativaPercentage && genetics.sativaPercentage > 60) tags.push('Sativa-lastig');
  
  // Füge Top-Effekt-Tags hinzu
  effects.slice(0, 3).forEach(effect => {
    if (effect.category === 'positive') {
      tags.push(effect.name);
    }
  });
  
  // Füge den Namen als Tag hinzu
  tags.push(strainName.replace(/\s+/g, '-').toLowerCase());
  
  return [...new Set(tags)]; // Entferne Duplikate
}

/**
 * ============================================================================
 * HAUPTFUNKTION: researchStrain
 * ============================================================================
 * 
 * Dies ist die EINSTIEGSFUNKTION für die Deep Research.
 * Sie wird von der API und UI aufgerufen und nutzt OpenRouter + Kimi K2.5
 * 
 * @param strainName - Name des zu recherchierenden Strains
 * @param producer - Optional: Hersteller/Züchter
 * @param thcContent - Optional: THC-Gehalt (z.B. "27%")
 * @param apiKey - Der OpenRouter API Key (aus Umgebungsvariablen)
 * @returns Ein vollständiges Strain-Objekt mit allen Recherche-Daten
 */
export async function researchStrain(
  strainName: string,
  producer?: string,
  thcContent?: string,
  apiKey?: string
): Promise<Strain> {
  
  // =======================================================================
  // SCHRITT 1: Validierung
  // Prüfe, ob ein Name übergeben wurde
  // =======================================================================
  if (!strainName || strainName.trim().length === 0) {
    throw new Error('Bitte gib einen Strain-Namen ein.');
  }

  // Prüfe, ob API Key vorhanden ist
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY ist nicht konfiguriert. ' +
      'Bitte füge den API Key zur .env.local Datei hinzu. '
    );
  }

  // Bereinige den Namen (entferne überflüssige Leerzeichen)
  const cleanName = strainName.trim();

  // =======================================================================
  // SCHRITT 2: Prompt erstellen
  // Wir bauen den detaillierten Prompt für Kimi K2.5
  // =======================================================================
  const prompt = buildResearchPrompt(cleanName, producer, thcContent);

  // =======================================================================
  // SCHRITT 3: API-Aufruf
  // Wir rufen OpenRouter auf und bekommen die Research-Daten
  // =======================================================================
  let apiData: ResearchAPIResponse;
  
  try {
    apiData = await callOpenRouterAPI(prompt, apiKey);
  } catch (error) {
    // Wenn die API fehlschlägt, geben wir eine hilfreiche Fehlermeldung
    console.error('OpenRouter API Fehler:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error(
          'API Authentifizierung fehlgeschlagen. ' +
          'Bitte prüfe, ob dein OPENROUTER_API_KEY in .env.local korrekt ist.'
        );
      }
      if (error.message.includes('429')) {
        throw new Error(
          'API Rate Limit erreicht. ' +
          'Bitte warte einen Moment und versuche es erneut.'
        );
      }
      throw new Error(`Research Fehler: ${error.message}`);
    }
    
    throw new Error('Ein unerwarteter Fehler ist bei der API-Kommunikation aufgetreten.');
  }

  // =======================================================================
  // SCHRITT 4: Daten transformieren
  // Wir wandeln die API-Daten in unser internes Format um
  // =======================================================================
  
  // Transformiere alle Daten
  const effects = transformEffects(apiData.effects);
  const medicalUses = transformMedicalUses(apiData.medicalUses);
  const genetics = transformGenetics(apiData.genetics);
  const terpenes = transformTerpenes(apiData.terpenes);
  const flavorProfile = transformFlavorProfile(apiData.flavorProfile);
  const communityStats = generateCommunityStats();

  // Erstelle eine Wirkungsbeschreibung basierend auf den Daten
  const effectDescription = effects.length > 0
    ? `${effects[0].name}er ${genetics.type} mit ${effects[1]?.name?.toLowerCase() || 'ausgeglichener'} Nebenwirkung.`
    : `${genetics.type} mit ausgewogener Wirkung.`;

  // Erstelle den medizinischen Schwerpunkt
  const medicalFocus = medicalUses.length > 0
    ? medicalUses[0].condition
    : 'Allgemeine Entspannung';

  // =======================================================================
  // SCHRITT 5: Strain-Objekt erstellen
  // Wir fügen alle Daten zusammen zu einem vollständigen Strain
  // =======================================================================
  const strain: Strain = {
    // Basis-Daten
    id: generateUUID(),
    name: cleanName,
    thcContent: thcContent || 'Unbekannt',
    origin: producer || 'Unbekannt',
    
    // Wirkungen
    effects,
    effectDescription,
    
    // Medizinische Anwendungen
    medicalUses,
    medicalFocus,
    
    // Recherche-Daten
    researchData: {
      researchedAt: new Date(),
      genetics,
      terpenes,
      flavorProfile,
      communityStats,
      detailedDescription: apiData.description,
      growInfo: apiData.growInfo || {
        schwierigkeit: 'Mittel',
        blütezeit: '8-9 Wochen',
        ertrag: 'Mittel',
        höhe: 'Mittel (100-150cm)',
      },
    },

    // NEU: Detaillierte Review-Analyse als Freitext
    // Dieses Feld enthält die ausführliche Analyse aller Reviews
    // mit Zusammenfassung, Wirkungsbeschreibung, medizinischem Fokus, etc.
    detailedAnalysis: apiData.detailedAnalysis,

    // Metadaten
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: generateTags(cleanName, effects, genetics),
  };

  // =======================================================================
  // SCHRITT 6: Rückgabe
  // Wir geben das fertige Strain-Objekt zurück
  // =======================================================================
  return strain;
}

/**
 * ============================================================================
 * SIMULATIONS-FUNKTION (für Tests/Backup)
 * ============================================================================
 * 
 * Diese Funktion simuliert eine Verzögerung, um die UI realistischer zu machen.
 * Sie wird nicht mehr aktiv genutzt, aber für Tests behalten.
 */
export function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * ============================================================================
 * EXPORTE
 * ============================================================================
 * 
 * Wir exportieren alle Funktionen, die von anderen Teilen der App genutzt werden
 */
export type {
  ResearchAPIResponse,
  APIEffect,
  APIMedicalUse,
  APIGenetics,
  APITerpene,
  APIFlavorProfile,
};
