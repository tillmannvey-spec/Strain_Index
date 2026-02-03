// TypeScript Interfaces for Cannabis Strain Index PWA
// Based on architecture-specification.md

export type EffectCategory = 
  | 'positive'    // Glücklich, Euphorisch, Energisch
  | 'medical'     // Schmerzlindernd, Anti-Entzündlich
  | 'negative';   // Trockener Mund, Rote Augen (optional)

export interface Effect {
  name: string;                  // "Entspannend", "Glücklich", "Kreativ"
  frequency: number;             // 47 (impliziert "47×")
  category?: EffectCategory;     // Für Gruppierung
}

export interface MedicalUse {
  condition: string;             // "Angststörungen", "Chronische Schmerzen"
  frequency: number;             // 52
  effectiveness?: 'high' | 'medium' | 'low'; // Zusätzliches Rating
  isHighlighted?: boolean;       // Für UI Hervorhebung
}

/**
 * Genetik-Informationen eines Strains
 * Diese Daten helfen zu verstehen, woher der Strain kommt und
 * was für eine Wirkung zu erwarten ist (Indica = entspannend, Sativa = energiegeladen)
 */
export interface StrainGenetics {
  // Verhältnis von Indica zu Sativa
  // Indica = eher körperlich entspannend
  // Sativa = eher geistig anregend/energiegeladen
  // Hybrid = Mischung aus beidem
  type: 'Indica' | 'Sativa' | 'Hybrid';
  
  // Prozentsatz Indica (0-100)
  // Beispiel: 60 bedeutet 60% Indica / 40% Sativa
  indicaPercentage?: number;
  
  // Sativa-Prozentsatz (wird automatisch berechnet aus 100 - indicaPercentage)
  sativaPercentage?: number;
  
  // Die Eltern-Strains (Genetik-Linie)
  // Beispiel: ["Alien Mints", "Huala Pie"]
  parents?: string[];
  
  // Der Züchter/Breeder, der diesen Strain entwickelt hat
  breeder?: string;
}

/**
 * Terpene sind aromatische Verbindungen in Cannabis
 * Sie sind verantwortlich für den Geruch/Geschmack und beeinflussen auch die Wirkung
 * Beispiel: Myrcen = erdig, entspannend | Limonen = zitrisch, aufheiternd
 */
export interface Terpene {
  // Name des Terpens (z.B. "Myrcen", "Limonen", "Caryophyllen")
  name: string;
  
  // Dominanz: wie stark vertreten ist dieses Terpen
  // dominant = Hauptterpen, prominent = deutlich vorhanden, present = enthalten
  dominance: 'dominant' | 'prominent' | 'present';
  
  // Beschreibung der Aromen (z.B. ["erdig", "würzig", "nelkig"])
  aromas?: string[];
  
  // Potenzielle Wirkung dieses Terpens
  // Beispiel: "entspannend", "aufheiternd", "schmerzlindernd"
  effect?: string;
}

/**
 * Geschmacks- und Aromaprofil eines Strains
 * Beschreibt, wie der Strain riecht und schmeckt
 */
export interface FlavorProfile {
  // Hauptaromen (z.B. ["Zitrus", "Erdig", "Harzig"])
  primary: string[];
  
  // Sekundäre Aromen (schwächer vorhanden)
  secondary?: string[];
  
  // Beschreibung des Gesamteindrucks
  // Beispiel: "Frische Minze mit unterlegten erdigen Noten"
  description?: string;
}

/**
 * Community-Statistiken
 * Zeigt, wie beliebt oder bekannt ein Strain ist
 */
export interface CommunityStats {
  // Anzahl der analysierten Reviews (aus verschiedenen Quellen)
  reviewCount: number;
  
  // Durchschnittliche Bewertung (0-5 Sterne)
  averageRating?: number;
  
  // Wie oft wurde der Strain gesucht/geklickt
  popularity?: number;
  
  // Datenquellen, die für die Recherche genutzt wurden
  // Beispiel: ["Reddit", "Flowzz", "Leafly"]
  sources?: string[];
}

/**
 * Zusätzliche Recherche-Daten
 * Enthält alle erweiterten Informationen aus der Deep Research Funktion
 */
export interface ResearchData {
  // Wann wurde die Recherche durchgeführt?
  researchedAt: Date;
  
  // Genetik-Informationen
  genetics?: StrainGenetics;
  
  // Terpen-Profil (Top 3 Terpene)
  terpenes?: Terpene[];
  
  // Aroma und Geschmack
  flavorProfile?: FlavorProfile;
  
  // Community-Statistiken
  communityStats?: CommunityStats;
  
  // Detaillierte Beschreibung aus verschiedenen Quellen
  detailedDescription?: string;
  
  // Wachstums-Informationen (für Grower)
  growInfo?: {
    schwierigkeit?: 'Einfach' | 'Mittel' | 'Schwierig';
    blütezeit?: string;  // z.B. "8-9 Wochen"
    ertrag?: string;     // z.B. "Hoch", "Mittel", "Niedrig"
    höhe?: string;       // z.B. "Mittel (100-150cm)"
  };
}

export interface StrainImage {
  id: string;
  // WICHTIG: Abwärtskompatibilität!
  // Alte Bilder haben nur dataUrl (Base64)
  // Neue Bilder haben url (Blob URL) und dataUrl ist optional
  dataUrl?: string;              // Base64 encoded (legacy, optional für neue Bilder)
  url?: string;                  // Vercel Blob URL (neu, bevorzugt)
  mimeType: string;              // "image/jpeg", "image/png"
  size: number;                  // Bytes für Speicher-Management
  createdAt: Date;
  isPrimary: boolean;            // Hauptbild für Listenansicht
}

// Hilfsfunktion: Gibt die anzuzeigende Bild-URL zurück
// Diese Funktion garantiert Abwärtskompatibilität mit alten Base64-Bildern
export function getImageDisplayUrl(image: StrainImage): string {
  // Neue Bilder haben eine Blob URL - diese bevorzugen wir
  if (image.url) {
    return image.url;
  }
  // Alte Bilder haben nur dataUrl (Base64)
  if (image.dataUrl) {
    return image.dataUrl;
  }
  // Fallback: leerer String (sollte nicht passieren)
  return '';
}

// Hilfsfunktion: Prüft ob ein Bild in Vercel Blob gespeichert ist
export function isBlobImage(image: StrainImage): boolean {
  return !!image.url && image.url.includes('blob.vercel-storage.com');
}

export interface Strain {
  id: string;                    // UUID v4
  name: string;                  // "Alien Mints Huala"
  thcContent: string;            // "27%" (kann auch Range sein: "20-25%")
  origin: string;                // "Kanada"

  // Wirkungen
  effects: Effect[];             // Array von Wirkungen mit Häufigkeiten
  effectDescription?: string;    // Charakteristische Beschreibung

  // Medizinische Anwendungen
  medicalUses: MedicalUse[];     // Array mit Häufigkeiten
  medicalFocus?: string;         // Medizinischer Schwerpunkt

  // Bilder
  images?: StrainImage[];        // Array von Bildern (mehrere pro Strain)
  image?: string;                // Legacy: Base64 für einfache Bilder

  // NEU: Deep Research Daten
  // Diese Felder werden durch die Auto-Research Funktion gefüllt
  // Sie enthalten erweiterte Informationen aus verschiedenen Quellen (Reddit, Flowzz, etc.)
  researchData?: ResearchData;   // Alle Recherche-Daten gebündelt

  // NEU: Detaillierte Review-Analyse
  // Ein ausführlicher Freitext mit detaillierter Auswertung aller analysierten Reviews
  // Enthält: Zusammenfassung, charakteristische Wirkung, medizinische Details, Genetik, Terpene
  detailedAnalysis?: string;     // Markdown-fähiger Freitext mit Deep Research Analyse

  // Metadaten
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];               // Für zusätzliche Filterung
}

// Filter & Search Types
export interface StrainFilters {
  searchQuery: string;
  effects: string[];             // Ausgewählte Wirkungen
  medicalConditions: string[];   // Ausgewählte medizinische Anwendungen
  thcRange: {
    min: number;
    max: number;
  } | null;
  origin: string[];              // Ausgewählte Herkunftsländer
}

export interface SortOption {
  field: 'name' | 'thcContent' | 'updatedAt' | 'createdAt';
  direction: 'asc' | 'desc';
}

// View State Types
export type ViewMode = 'list' | 'grid';

export interface UIState {
  searchQuery: string;
  isFilterOpen: boolean;
  selectedStrainId: string | null;
  viewMode: ViewMode;
}
