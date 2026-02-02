# Cannabis Strain Index PWA - Technical Architecture Specification

## Executive Summary

Eine moderne Progressive Web App für die persönliche Verwaltung von Cannabis-Strains mit Fokus auf iOS-Nutzung, Offline-Fähigkeit und "Silicon Valley" Designästhetik.

---

## 1. Tech Stack Empfehlung

### 1.1 Framework Decision: Next.js 15 (App Router)

**Empfehlung: Next.js 15 mit App Router**

| Kriterium | Next.js 15 | React + Vite |
|-----------|-----------|--------------|
| PWA Support | ✅ Built-in (next-pwa) | ✅ Manuell (vite-pwa-plugin) |
| Static Export | ✅ `output: 'export'` | ✅ Out-of-the-box |
| Vercel Deploy | ✅ Native | ⚠️ Einfach, aber nicht optimiert |
| iOS Optimization | ✅ Gut | ✅ Gut |
| Bundle Size | ⚠️ Größer | ✅ Kleiner |
| DX (Developer Experience) | ✅ Hervorragend | ✅ Gut |

**Entscheidung für Next.js 15:**
- Native Vercel-Integration für nahtloses Deployment
- Built-in PWA-Unterstützung mit `next-pwa`
- Static Site Generation für schnelle Ladezeiten
- App Router für moderne React Patterns

### 1.2 Kern-Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "idb": "^8.0.0",
    "fuse.js": "^7.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "typescript": "^5.7.0",
    "tailwindcss": "^3.4.0",
    "next-pwa": "^5.6.0",
    "@ducanh2912/next-pwa": "^10.0.0"
  }
}
```

### 1.3 State Management: Zustand + IndexedDB

| Aspekt | Lösung | Begründung |
|--------|--------|------------|
| Client State | Zustand | Lightweight, TypeScript-native, persistierbar |
| Server State | N/A (local only) | Kein Backend nötig |
| Persistent Storage | IndexedDB via idb | Größere Speicherkapazität, strukturierte Daten |
| Bilder | IndexedDB (Blob Storage) | Bis zu ~60% des verfügbaren Speichers |

**Warum nicht:**
- Redux: Overkill für lokale App
- Context API: Zu langsam für häufige Updates
- localStorage: Nur 5-10MB, zu wenig für Bilder

---

## 2. Datenmodell (TypeScript Interfaces)

### 2.1 Core Entities

```typescript
// types/strain.ts

export interface Strain {
  id: string;                    // UUID v4
  name: string;                  // "Alien Mints Huala"
  thcContent: string;            // "27%" (kann auch Range sein: "20-25%")
  origin: string;                // "Kanada"
  
  // Wirkungen
  effects: Effect[];             // Array von Wirkungen mit Häufigkeiten
  effectDescription: string;     // Charakteristische Beschreibung
  
  // Medizinische Anwendungen
  medicalUses: MedicalUse[];     // Array mit Häufigkeiten
  medicalFocus: string;          // Medizinischer Schwerpunkt
  
  // Bilder
  images: StrainImage[];         // Array von Bildern (mehrere pro Strain)
  
  // Metadaten
  createdAt: Date;
  updatedAt: Date;
  tags: string[];                // Für zusätzliche Filterung
}

export interface Effect {
  name: string;                  // "Entspannend", "Glücklich", "Kreativ"
  frequency: number;             // 47 (impliziert "47×")
  category: EffectCategory;      // Für Gruppierung
}

export type EffectCategory = 
  | 'positive'    // Glücklich, Euphorisch, Energisch
  | 'medical'     // Schmerzlindernd, Anti-Entzündlich
  | 'negative';   // Trockener Mund, Rote Augen (optional)

export interface MedicalUse {
  condition: string;             // "Angststörungen", "Chronische Schmerzen"
  frequency: number;             // 52
  effectiveness: 'high' | 'medium' | 'low'; // Zusätzliches Rating
}

export interface StrainImage {
  id: string;
  dataUrl: string;               // Base64 encoded oder blob URL
  mimeType: string;              // "image/jpeg", "image/png"
  size: number;                  // Bytes für Speicher-Management
  createdAt: Date;
  isPrimary: boolean;            // Hauptbild für Listenansicht
}
```

### 2.2 Filter & Search Types

```typescript
// types/filters.ts

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
```

### 2.3 Database Schema (IndexedDB)

```typescript
// lib/db/schema.ts

export const DB_NAME = 'StrainIndexDB';
export const DB_VERSION = 1;

export enum StoreNames {
  STRAINS = 'strains',
  IMAGES = 'images',
  SETTINGS = 'settings',
}

// IndexedDB Key-Value Paare für Stores
export interface DBSchema {
  [StoreNames.STRAINS]: {
    key: string;           // strain.id
    value: Strain;
    indexes: {
      'by-name': string;           // strain.name
      'by-updated': Date;          // strain.updatedAt
      'by-thc': string;            // strain.thcContent (parsed)
    };
  };
  [StoreNames.IMAGES]: {
    key: string;           // image.id
    value: StrainImage;
    indexes: {
      'by-strain': string;         // strain.id (Foreign Key)
    };
  };
  [StoreNames.SETTINGS]: {
    key: string;
    value: unknown;
  };
}
```

---

## 3. Storage-Strategie

### 3.1 Übersicht

```
┌─────────────────────────────────────────────────────────────┐
│                     STORAGE ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Zustand    │  │  IndexedDB   │  │  Service Worker  │  │
│  │  (Runtime)   │  │  (Persistent)│  │    (Cache)       │  │
│  ├──────────────┤  ├──────────────┤  ├──────────────────┤  │
│  │ • UI State   │  │ • Strains    │  │ • Static Assets  │  │
│  │ • Filters    │  │ • Images     │  │ • App Shell      │  │
│  │ • Form Data  │  │ • Settings   │  │ • Runtime Cache  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 IndexedDB Implementation

```typescript
// lib/db/index.ts

import { openDB, DBSchema as IDBDBSchema } from 'idb';
import { DB_NAME, DB_VERSION, StoreNames } from './schema';

export async function initDB() {
  return openDB<StrainDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Strains Store
      if (!db.objectStoreNames.contains(StoreNames.STRAINS)) {
        const strainStore = db.createObjectStore(StoreNames.STRAINS, {
          keyPath: 'id',
        });
        strainStore.createIndex('by-name', 'name', { unique: false });
        strainStore.createIndex('by-updated', 'updatedAt', { unique: false });
        strainStore.createIndex('by-thc', 'thcContent', { unique: false });
      }

      // Images Store (separate für bessere Speicherverwaltung)
      if (!db.objectStoreNames.contains(StoreNames.IMAGES)) {
        const imageStore = db.createObjectStore(StoreNames.IMAGES, {
          keyPath: 'id',
        });
        imageStore.createIndex('by-strain', 'strainId', { unique: false });
      }

      // Settings Store
      if (!db.objectStoreNames.contains(StoreNames.SETTINGS)) {
        db.createObjectStore(StoreNames.SETTINGS);
      }
    },
  });
}
```

### 3.3 Bild-Speicherung

**Strategie:** 
- Bilder werden als **Base64 Data URLs** in IndexedDB gespeichert
- Vor dem Speichern: Automatische Komprimierung auf max 1200px Breite
- Format: JPEG mit 85% Qualität für optimale Größe
- Speicher-Limit pro Bild: ~2MB

```typescript
// lib/storage/image-storage.ts

export const MAX_IMAGE_WIDTH = 1200;
export const MAX_IMAGE_HEIGHT = 1200;
export const JPEG_QUALITY = 0.85;
export const MAX_STORAGE_MB = 50; // iOS Safari Limit ~50-100MB

export async function compressImage(
  file: File
): Promise<{ dataUrl: string; size: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      
      // Aspect ratio beibehalten, skalieren falls nötig
      if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
        const ratio = Math.min(
          MAX_IMAGE_WIDTH / width,
          MAX_IMAGE_HEIGHT / height
        );
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      const size = Math.ceil((dataUrl.length * 3) / 4); // Base64 → Bytes
      
      URL.revokeObjectURL(img.src);
      resolve({ dataUrl, size });
    };
    
    img.onerror = reject;
  });
}
```

### 3.4 Speicher-Management

```typescript
// lib/storage/quota.ts

export async function checkStorageQuota(): Promise<{
  usage: number;
  quota: number;
  percentUsed: number;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    return {
      usage,
      quota,
      percentUsed: quota > 0 ? (usage / quota) * 100 : 0,
    };
  }
  throw new Error('Storage API not available');
}
```

---

## 4. PWA-Setup

### 4.1 Next.js PWA Konfiguration

```javascript
// next.config.js

const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  
  // iOS-spezifische Anpassungen
  fallbacks: {
    document: '/offline',
  },
  
  // Cache-Strategien
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true, // Wichtig für static export
  },
};

module.exports = withPWA(nextConfig);
```

### 4.2 Web App Manifest

```json
// public/manifest.json

{
  "name": "Strain Index",
  "short_name": "Strains",
  "description": "Personal cannabis strain database with offline support",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "orientation": "portrait",
  "scope": "/",
  "lang": "de",
  "categories": ["lifestyle", "health"],
  
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ]
}
```

### 4.3 iOS-spezifische Meta-Tags

```typescript
// app/layout.tsx (wichtige Head-Konfiguration)

export const metadata: Metadata = {
  title: 'Strain Index',
  description: 'Personal cannabis strain database',
  
  // PWA Meta Tags
  applicationName: 'Strain Index',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Strain Index',
    startupImage: [
      {
        url: '/splash/apple-splash-2048-2732.jpg',
        media: '(device-width: 1024px) and (device-height: 1366px)',
      },
      {
        url: '/splash/apple-splash-1668-2388.jpg',
        media: '(device-width: 834px) and (device-height: 1194px)',
      },
      {
        url: '/splash/apple-splash-1536-2048.jpg',
        media: '(device-width: 768px) and (device-height: 1024px)',
      },
      {
        url: '/splash/apple-splash-1170-2532.jpg',
        media: '(device-width: 390px) and (device-height: 844px)',
      },
      {
        url: '/splash/apple-splash-1125-2436.jpg',
        media: '(device-width: 375px) and (device-height: 812px)',
      },
    ],
  },
  
  // Icons
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192' },
      { url: '/icons/icon-512x512.png', sizes: '512x512' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  
  // Theme Color
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  
  // Viewport (Mobile Optimization)
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};
```

### 4.4 Splash Screen Generation

Splash Screens für alle iOS Geräte sollten generiert werden:

```bash
# Tool: pwa-asset-generator
npx pwa-asset-generator logo.png ./public/splash \
  --splash-only \
  --background "#000000" \
  --dark-mode \
  --padding "40%"
```

---

## 5. Komponenten-Architektur

### 5.1 Komponenten-Hierarchie

```
┌────────────────────────────────────────────────────────────────┐
│                        APP STRUCTURE                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                     Layout                             │   │
│  │  ┌─────────────┐  ┌──────────────────────────────┐   │   │
│  │  │  Header     │  │        Main Content          │   │   │
│  │  │  - Logo     │  │                              │   │   │
│  │  │  - Search   │  │  ┌────────────────────────┐  │   │   │
│  │  │  - Add Btn  │  │  │     Page Content       │  │   │   │
│  │  └─────────────┘  │  │                        │  │   │   │
│  │                   │  │  - StrainList          │  │   │   │
│  │  ┌─────────────┐  │  │  - StrainDetail        │  │   │   │
│  │  │   TabBar    │  │  │  - StrainForm          │  │   │   │
│  │  │  (iOS-style)│  │  │  - Settings            │  │   │   │
│  │  └─────────────┘  │  └────────────────────────┘  │   │   │
│  │                   └──────────────────────────────┘   │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 5.2 Core Components

```typescript
// Komponenten-Übersicht (Pseudocode-Struktur)

// Layout Components
app/
├── layout.tsx                    # Root Layout mit PWA Meta-Tags
├── page.tsx                      # Home / Strain List
├── strain/
│   ├── [id]/
│   │   └── page.tsx              # Strain Detail View
│   └── new/
│       └── page.tsx              # Add New Strain
├── settings/
│   └── page.tsx                  # Settings Page
│
components/
├── layout/
│   ├── Header.tsx                # App Header mit Search
│   ├── BottomNav.tsx             # iOS-Style Tab Bar
│   └── SafeArea.tsx              # iOS Safe Area Handler
│
├── strain/
│   ├── StrainCard.tsx            # Strain List Item
│   ├── StrainList.tsx            # Virtualized List
│   ├── StrainDetail.tsx          # Detail View
│   ├── StrainForm.tsx            # Add/Edit Form
│   ├── EffectTag.tsx             # Effect Badge
│   ├── MedicalTag.tsx            # Medical Use Badge
│   └── ImageGallery.tsx          # Bild-Carousel
│
├── search/
│   ├── SearchBar.tsx             # Haupt-Suchfeld
│   ├── FilterPanel.tsx           # Filter Sidebar/Bottom Sheet
│   ├── FilterChip.tsx            # Aktive Filter Tags
│   └── Suggestions.tsx           # Autocomplete
│
├── ui/
│   ├── Button.tsx                # Primär/Sekundär Buttons
│   ├── Input.tsx                 # Text Inputs
│   ├── Select.tsx                # Dropdowns
│   ├── Modal.tsx                 # iOS-Style Modals
│   ├── BottomSheet.tsx           # Mobile Bottom Sheet
│   ├── Skeleton.tsx              # Loading States
│   └── EmptyState.tsx            # No Results State
│
└── forms/
    ├── ImageUploader.tsx         # Bild-Upload mit Kompression
    ├── EffectInput.tsx           # Effect mit Frequency
    ├── MedicalInput.tsx          # Medical Use mit Frequency
    └── THCInput.tsx              # THC Content Input
```

### 5.3 State Management Flow

```typescript
// stores/strain-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StrainState {
  // Data
  strains: Strain[];
  isLoading: boolean;
  
  // Filters
  filters: StrainFilters;
  sortOption: SortOption;
  
  // Actions
  setStrains: (strains: Strain[]) => void;
  addStrain: (strain: Strain) => Promise<void>;
  updateStrain: (id: string, updates: Partial<Strain>) => Promise<void>;
  deleteStrain: (id: string) => Promise<void>;
  
  // Filter Actions
  setSearchQuery: (query: string) => void;
  toggleEffect: (effect: string) => void;
  toggleMedicalCondition: (condition: string) => void;
  setTHCRange: (range: { min: number; max: number } | null) => void;
  resetFilters: () => void;
  
  // Computed
  filteredStrains: () => Strain[];
}

export const useStrainStore = create<StrainState>()(
  persist(
    (set, get) => ({
      strains: [],
      isLoading: true,
      filters: {
        searchQuery: '',
        effects: [],
        medicalConditions: [],
        thcRange: null,
        origin: [],
      },
      sortOption: { field: 'name', direction: 'asc' },
      
      // ... actions implementation
      
      filteredStrains: () => {
        const { strains, filters } = get();
        return strains.filter((strain) => {
          // Search
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            const searchableText = [
              strain.name,
              strain.origin,
              strain.effectDescription,
              strain.medicalFocus,
              ...strain.effects.map((e) => e.name),
              ...strain.medicalUses.map((m) => m.condition),
            ].join(' ').toLowerCase();
            
            if (!searchableText.includes(query)) return false;
          }
          
          // Effects Filter
          if (filters.effects.length > 0) {
            const strainEffects = strain.effects.map((e) => e.name);
            if (!filters.effects.some((e) => strainEffects.includes(e))) {
              return false;
            }
          }
          
          // Medical Filter
          if (filters.medicalConditions.length > 0) {
            const strainMedical = strain.medicalUses.map((m) => m.condition);
            if (!filters.medicalConditions.some((m) => strainMedical.includes(m))) {
              return false;
            }
          }
          
          return true;
        });
      },
    }),
    {
      name: 'strain-store',
      // Nur Filter persistieren, Strains kommen aus IndexedDB
      partialize: (state) => ({ filters: state.filters, sortOption: state.sortOption }),
    }
  )
);
```

---

## 6. Projektstruktur

```
cannabis-strain-index/
├── .github/
│   └── workflows/
│       └── deploy.yml            # Vercel Deployment
│
├── public/
│   ├── manifest.json             # PWA Manifest
│   ├── icons/                    # App Icons (alle Größen)
│   ├── splash/                   # iOS Splash Screens
│   ├── offline.html              # Offline Fallback Page
│   └── sw.js                     # Service Worker (auto-generated)
│
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root Layout
│   │   ├── page.tsx              # Home (Strain List)
│   │   ├── globals.css           # Global Styles
│   │   │
│   │   ├── strain/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # Strain Detail
│   │   │   └── new/
│   │   │       └── page.tsx      # New Strain Form
│   │   │
│   │   └── settings/
│   │       └── page.tsx          # Settings
│   │
│   ├── components/               # React Components
│   │   ├── layout/               # Layout Components
│   │   ├── strain/               # Strain-specific
│   │   ├── search/               # Search & Filter
│   │   ├── forms/                # Form Components
│   │   └── ui/                   # Reusable UI
│   │
│   ├── hooks/                    # Custom React Hooks
│   │   ├── useStrains.ts         # Strain CRUD
│   │   ├── useIndexedDB.ts       # DB Access
│   │   ├── useSearch.ts          # Search Logic
│   │   ├── useStorageQuota.ts    # Storage Monitoring
│   │   └── usePWA.ts             # PWA Install Prompt
│   │
│   ├── lib/                      # Utilities & Config
│   │   ├── db/
│   │   │   ├── index.ts          # IndexedDB Init
│   │   │   ├── schema.ts         # TypeScript Schema
│   │   │   └── operations.ts     # CRUD Operations
│   │   │
│   │   ├── storage/
│   │   │   ├── image-storage.ts  # Bild-Kompression
│   │   │   └── quota.ts          # Speicher-Quota
│   │   │
│   │   ├── search/
│   │   │   └── fuse-search.ts    # Fuzzy Search Setup
│   │   │
│   │   └── utils/
│   │       ├── cn.ts             # Tailwind Merge
│   │       ├── id.ts             # UUID Generation
│   │       └── formatters.ts     # THC % Formatting etc.
│   │
│   ├── stores/                   # Zustand Stores
│   │   ├── strain-store.ts
│   │   └── ui-store.ts
│   │
│   ├── types/                    # TypeScript Types
│   │   ├── strain.ts
│   │   ├── filters.ts
│   │   └── index.ts
│   │
│   └── styles/                   # Additional Styles
│       └── animations.css
│
├── tools/                        # Build Tools
│   └── generate-icons.js         # Icon/Splash Generator
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 7. Feature-Liste mit Priorisierung

### 7.1 MVP (Must-Have) - Phase 1

| Feature | Beschreibung | Komplexität |
|---------|-------------|-------------|
| ✅ Strain CRUD | Anlegen, Bearbeiten, Löschen von Strains | Medium |
| ✅ Strain Detail View | Vollständige Anzeige aller Daten | Low |
| ✅ Bild-Upload | Einzelbild pro Strain mit Kompression | Medium |
| ✅ Volltext-Suche | Suche über Name, Effects, Medical | Low |
| ✅ Filter nach Effects | Mehrfachauswahl möglich | Medium |
| ✅ Filter nach Medical | Mehrfachauswahl möglich | Medium |
| ✅ PWA Setup | Manifest, Service Worker, iOS Optimierung | Medium |
| ✅ Offline Support | IndexedDB Storage, Offline Page | High |
| ✅ iOS Homescreen | Add to Homescreen, Standalone Mode | Low |
| ✅ Responsive Design | Mobile-First, iOS Look & Feel | Medium |

### 7.2 Phase 2 - Enhanced Features

| Feature | Beschreibung | Komplexität |
|---------|-------------|-------------|
| 📋 Mehrere Bilder | Galerie pro Strain | Low |
| 📋 THC Range Filter | Slider für Min/Max THC | Low |
| 📋 Sortierung | Nach Name, THC, Datum | Low |
| 📋 Tags System | Benutzerdefinierte Tags | Low |
| 📋 Favoriten | Star/Favorite Funktion | Low |
| 📋 Export/Import | JSON Backup & Restore | Medium |
| 📋 Statistics | Charts: Effects, Origins, etc. | Medium |

### 7.3 Phase 3 - Nice-to-Have

| Feature | Beschreibung | Komplexität |
|---------|-------------|-------------|
| 💡 Data Sync | Cloud Backup (optional) | High |
| 💡 Barcode Scanner | Strain Info via Barcode | High |
| 💡 Community | Öffentliche Strain Datenbank | High |
| 💡 Reviews | Bewertungen & Notizen | Medium |
| 💡 Dark Mode | Alternative Theme | Low |
| 💡 Compare Mode | Strains nebeneinander vergleichen | Medium |
| 💡 API Integration | Leafly / Wikileaf Daten | High |

### 7.4 Roadmap Timeline

```
Week 1-2:  [MVP Core]      Setup, CRUD, Basic UI
Week 3:    [MVP Polish]    Search, Filter, PWA
Week 4:    [MVP Release]   Testing, Deploy, iOS Testing

Month 2:   [Phase 2]       Enhanced Features, Import/Export
Month 3+:  [Phase 3]       Nice-to-Haves, Cloud Sync
```

---

## 8. Design System

### 8.1 Farbschema (Dark Mode iOS Style)

```css
:root {
  /* Background */
  --bg-primary: #000000;
  --bg-secondary: #1c1c1e;
  --bg-tertiary: #2c2c2e;
  
  /* Text */
  --text-primary: #ffffff;
  --text-secondary: #8e8e93;
  --text-tertiary: #636366;
  
  /* Accent (iOS Blue) */
  --accent-primary: #0a84ff;
  --accent-secondary: #5ac8fa;
  
  /* Effects (Semantic Colors) */
  --effect-relax: #30d158;      /* Grün */
  --effect-happy: #ffcc00;      /* Gelb */
  --effect-energetic: #ff9500;  /* Orange */
  --effect-sleepy: #bf5af2;     /* Lila */
  
  /* Medical */
  --medical-primary: #007aff;
  --medical-bg: rgba(0, 122, 255, 0.15);
}
```

### 8.2 Typography

```css
/* iOS System Fonts */
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;

/* Scale */
--text-xs: 12px;    /* Captions */
--text-sm: 14px;    /* Secondary */
--text-base: 16px;  /* Body */
--text-lg: 18px;    /* Subheadings */
--text-xl: 20px;    /* Headings */
--text-2xl: 24px;   /* Large Titles */
```

### 8.3 Spacing (8pt Grid)

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
```

### 8.4 iOS-style Components

- **Cards:** Rounded corners (12px), subtle border
- **Buttons:** Filled oder Ghost, rounded (10px)
- **Inputs:** Rounded (10px), border on focus
- **Bottom Sheet:** Sheet modal für Filter/Actions
- **Pull-to-Refresh:** Native iOS Verhalten

---

## 9. Performance Considerations

### 9.1 Budgets

| Metrik | Ziel | Maximum |
|--------|------|---------|
| First Contentful Paint (FCP) | < 1.5s | 2s |
| Largest Contentful Paint (LCP) | < 2.5s | 4s |
| Time to Interactive (TTI) | < 3.5s | 5s |
| Bundle Size (Initial) | < 150KB | 200KB |
| IndexedDB Size | < 30MB | 50MB |

### 9.2 Optimierungen

- **Code Splitting:** Route-based splitting automatisch durch Next.js
- **Image Optimization:** Automatische Kompression, lazy loading
- **Virtualized Lists:** Für große Strain-Listen
- **Memoization:** React.memo für Card-Komponenten
- **Preloading:** Wichtige Assets prefetch

### 9.3 iOS-spezifische Optimierungen

```typescript
// Passive Event Listeners für Scroll-Performance
document.addEventListener('touchstart', handler, { passive: true });
document.addEventListener('touchmove', handler, { passive: true });

// Fast Click Elimination
// CSS: touch-action: manipulation;
```

---

## 10. Vercel Deployment

### 10.1 Vercel Config

```json
// vercel.json

{
  "version": 2,
  "buildCommand": "next build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/offline",
      "destination": "/offline.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

### 10.2 Deployment Pipeline

```yaml
# .github/workflows/deploy.yml

name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Run Tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: vercel/action-deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 11. Zusammenfassung der Architektur-Entscheidungen

| Bereich | Entscheidung | Alternative | Begründung |
|---------|-------------|-------------|------------|
| **Framework** | Next.js 15 | React + Vite | Vercel-Native, PWA built-in |
| **State** | Zustand | Redux, Context | Lightweight, persistierbar |
| **Storage** | IndexedDB | localStorage | Größere Kapazität, strukturiert |
| **Bilder** | Base64 in IndexedDB | File System API | iOS-Kompatibilität |
| **Styling** | Tailwind CSS | CSS Modules | Rapid Development, Consistency |
| **UI Library** | Custom + Headless UI | Material-UI | iOS-Style, kleines Bundle |
| **Search** | Fuse.js | Algolia, Lunr | Client-side, offline |
| **Forms** | React Hook Form | Formik | Performance, kleiner |
| **Icons** | Lucide React | Heroicons | Tree-shakeable, modern |

---

## 12. Nächste Schritte

1. **Setup:** Repository initialisieren, Next.js installieren
2. **Design:** UI Mockups in Figma (optional)
3. **Core:** Datenmodelle implementieren
4. **Storage:** IndexedDB Layer bauen
5. **UI:** Basis-Komponenten (Layout, Cards)
6. **Features:** CRUD + Search implementieren
7. **PWA:** Manifest, Service Worker, Icons
8. **Testing:** iOS Geräte testen
9. **Deploy:** Vercel Deployment

---

*Dokument erstellt: 2026-02-02*
*Version: 1.0*
