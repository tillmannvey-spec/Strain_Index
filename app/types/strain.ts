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

export interface StrainImage {
  id: string;
  dataUrl: string;               // Base64 encoded oder blob URL
  mimeType: string;              // "image/jpeg", "image/png"
  size: number;                  // Bytes für Speicher-Management
  createdAt: Date;
  isPrimary: boolean;            // Hauptbild für Listenansicht
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
