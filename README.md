# 🌿 Strain Index

Eine Progressive Web App (PWA) zur Verwaltung deiner persönlichen Cannabis-Strain-Datenbank. Verwalte Strains, track Wirkungen und medizinische Anwendungen – alles offline-fähig direkt auf deinem Gerät.

## Features

- 📱 **Progressive Web App** – Installierbar auf iOS, Android und Desktop
- 🔍 **Intelligente Suche** – Schnelle Volltextsuche mit Fuzzy-Matching
- 🏷️ **Filter-System** – Filtere nach Wirkungen, medizinischen Anwendungen, Herkunft und THC-Gehalt
- 📊 **Detaillierte Strain-Profile** – Wirkungen mit Häufigkeiten, medizinische Anwendungen, Bilder
- 📸 **Bild-Verwaltung** – Füge mehrere Bilder pro Strain hinzu mit automatischer Kompression
- 📥 **Text-Import** – Importiere Strain-Daten aus Text-Formaten
- 💾 **Offline-First** – Alle Daten werden lokal im Browser gespeichert (IndexedDB)
- 🌙 **Dark Mode** – Optimiert für Cannabis-Enthusiasten

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Database:** IndexedDB (via idb)
- **Search:** Fuse.js
- **Icons:** Lucide React
- **PWA:** Custom Service Worker

## Installation & Development

### Voraussetzungen

- Node.js 18+
- npm oder yarn

### Lokale Entwicklung

```bash
# Repository klonen
git clone <repository-url>
cd strain-index

# Dependencies installieren
npm install

# Development Server starten
npm run dev

# App öffnen
# http://localhost:3000
```

### Build

```bash
# Production Build erstellen
npm run build

# Statischen Export erstellen (für Vercel)
npm run export
```

## Deployment auf Vercel

### Option 1: Vercel CLI

```bash
# Vercel CLI installieren (falls nicht vorhanden)
npm i -g vercel

# Deployment starten
vercel

# Für Production
vercel --prod
```

### Option 2: GitHub Integration

1. Push deinen Code zu GitHub
2. Gehe zu [vercel.com](https://vercel.com) und melde dich an
3. Klicke auf "New Project"
4. Importiere dein GitHub-Repository
5. Vercel erkennt automatisch Next.js und konfiguriert alles
6. Klicke auf "Deploy"

### Wichtige Einstellungen

Die [`vercel.json`](vercel.json) ist bereits konfiguriert mit:
- Korrekten Cache-Headern für den Service Worker
- Optimierten Cache-Zeiten für Icons
- Build-Einstellungen für Next.js

### Umgebungsvariablen

Falls du Umgebungsvariablen benötigst:

```bash
# Lokale Entwicklung
.env.local

# Vercel Dashboard
Project Settings → Environment Variables
```

## iOS PWA Installation Guide

### Schritt-für-Schritt Anleitung

#### 1. App in Safari öffnen
- Öffne Safari auf deinem iPhone/iPad
- Navigiere zur deployed URL (z.B. `https://strain-index.vercel.app`)
- Warte bis die App vollständig geladen ist

#### 2. Zum Home-Bildschirm hinzufügen
- Tippe auf das **Teilen-Icon** (Rechteck mit Pfeil nach oben) in der Safari-Toolbar
- Scrolle in der Teilen-Menü nach unten
- Wähle **"Zum Home-Bildschirm"** (Add to Home Screen)
- Optional: Passe den Namen an (Standard: "Strain Index")
- Tippe auf **"Hinzufügen"** (Add)

#### 3. App starten
- Die App-Icon erscheint auf deinem Home-Bildschirm
- Tippe auf das Icon, um die App im Standalone-Modus zu öffnen
- Die App läuft jetzt ohne Safari-UI (keine Adressleiste, kein Toolbar)

### iOS-spezifische Features

- **Status Bar:** Schwarz-transluzent für nahtloses Design
- **Safe Areas:** Automatische Anpassung an Notch und Home-Indicator
- **Offline-Nutzung:** App funktioniert ohne Internetverbindung
- **App-Icon:** 180x180 Apple Touch Icon wird automatisch verwendet

### Tipps für iOS

- **Updates:** Die App aktualisiert sich automatisch im Hintergrund
- **Speicher:** Alle Daten werden lokal gespeichert – keine Cloud-Synchronisation
- **Backup:** Daten werden mit iCloud-Backup gesichert (Safari-Daten)

## Daten-Import Guide

### Unterstütztes Text-Format

Die App kann Strain-Daten aus folgendem Format importieren:

```
Alien Mints Huala (27% THC, Kanada)
A) Wirkungen
Basierend auf 127 analysierten Reviews
• Entspannend: 47×
• Glücklich: 32×
• Euphorisch: 28×
• Gesprächig: 15×
• Kreativ: 12×
Charakteristisch entspannend und glücklich.

B) Medizinische Anwendungen
Basierend auf 94 Reviews
• Angststörungen: 52×
• Chronische Schmerzen: 41×
• Depressionen: 38×
• Stress: 35×
Hilft besonders bei Angststörungen und Schmerzen.
```

### Mehrere Strains importieren

Trenne mehrere Strains durch Leerzeilen oder `---`:

```
Strain 1 (20% THC, USA)
A) Wirkungen...

---

Strain 2 (25% THC, Niederlande)
A) Wirkungen...
```

### Import-Schritte

1. **Import-Button öffnen**
   - Tippe auf den **Import-Button** (Pfeil-nach-oben Icon) unten rechts
   - Oder: Nutze den Import-Button im Empty-State

2. **Text einfügen**
   - Kopiere deine Strain-Daten aus der Quelle
   - Füge sie in das Textarea-Feld ein
   - Die App parst automatisch und zeigt eine Vorschau

3. **Vorschau prüfen**
   - Klappe einzelne Strains auf, um Details zu sehen
   - Validierte Strains werden mit ✅ markiert
   - Fehler werden mit ⚠️ angezeigt

4. **Importieren**
   - Tippe auf **"X importieren"**
   - Die Strains werden zur IndexedDB hinzugefügt
   - Die Hauptseite zeigt die neuen Strains an

### Import-Formate im Detail

#### Minimales Format
```
Nur der Name des Strains
```

#### Mit THC und Herkunft
```
Strain Name (25% THC, Kanada)
```

#### Vollständig mit Wirkungen
```
Strain Name (25% THC, Kanada)
A) Wirkungen
• Entspannend: 45×
• Glücklich: 30×
```

#### Medizinische Anwendungen
```
Strain Name (25% THC, Kanada)
A) Wirkungen
• Entspannend: 45×
B) Medizinische Anwendungen
• Schmerzen: 50×
• Angst: 40×
```

### Fehlerbehebung beim Import

| Problem | Lösung |
|---------|--------|
| Keine Strains erkannt | Prüfe das Format – Name sollte am Anfang stehen |
| THC nicht erkannt | Verwende Format: `25% THC` oder `25 % THC` |
| Wirkungen nicht geparst | Bullet-Points müssen mit `•` oder `-` beginnen |
| Falsche Häufigkeiten | Format: `Name: 45×` oder `Name: 45 x` |

## Datenmanagement

### Lokale Speicherung

Alle Daten werden in der IndexedDB des Browsers gespeichert:
- **Strains:** Vollständige Strain-Profile
- **Bilder:** Base64-kodierte Bilder (komprimiert)
- **Metadaten:** Erstellungs- und Aktualisierungsdaten

### Backup erstellen

Da alle Daten lokal gespeichert sind:

1. **iOS:** Werden mit iCloud-Backup gesichert
2. **Android:** Werden mit Google-Backup gesichert
3. **Manuell:** Exportiere wichtige Daten regelmäßig

### Speicherplatz

- Text-Daten: Minimal (~KB)
- Bilder: ~50-200KB pro Bild (automatisch komprimiert)
- IndexedDB-Limit: ~50MB-2GB (browserabhängig)

## Projektstruktur

```
strain-index/
├── app/
│   ├── components/        # React Komponenten
│   │   ├── AddStrainForm.tsx
│   │   ├── EmptyState.tsx
│   │   ├── FilterModal.tsx
│   │   ├── ImageUploader.tsx
│   │   ├── ImportModal.tsx      # Import-Funktionalität
│   │   ├── SearchBar.tsx
│   │   ├── StrainCard.tsx
│   │   └── StrainDetail.tsx
│   ├── hooks/            # Custom Hooks
│   │   ├── useSearch.ts
│   │   └── useStrains.ts
│   ├── lib/              # Utility-Funktionen
│   │   ├── db.ts         # IndexedDB API
│   │   ├── images.ts     # Bild-Kompression
│   │   ├── import.ts     # Text-Import Parser
│   │   ├── search.ts     # Such-Logik
│   │   └── store.ts      # Zustand Store
│   ├── types/            # TypeScript Interfaces
│   │   └── strain.ts
│   ├── globals.css
│   ├── layout.tsx        # Root Layout mit PWA Meta
│   ├── page.tsx          # Hauptseite
│   └── strain/
│       └── [id]/
│           ├── page.tsx
│           └── StrainPageClient.tsx
├── public/
│   ├── icons/            # PWA Icons
│   │   ├── icon.svg
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   └── apple-touch-icon.png
│   ├── manifest.json     # PWA Manifest
│   └── sw.js             # Service Worker
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json           # Vercel Deployment Config
```

## Browser-Kompatibilität

| Browser | PWA Support | IndexedDB | Getestet |
|---------|-------------|-----------|----------|
| Safari iOS | ✅ | ✅ | iOS 16+ |
| Chrome Android | ✅ | ✅ | Android 12+ |
| Chrome Desktop | ✅ | ✅ | Win/Mac |
| Safari macOS | ✅ | ✅ | macOS 13+ |
| Firefox | ⚠️ | ✅ | Desktop |
| Edge | ✅ | ✅ | Desktop |

## Troubleshooting

### App wird nicht installiert
- Prüfe, ob du Safari auf iOS verwendest
- Stelle sicher, dass die Seite über HTTPS läuft
- Lösche den Browser-Cache und versuche es erneut

### Daten werden nicht gespeichert
- Überprüfe IndexedDB-Berechtigungen im Browser
- Stelle sicher, dass du nicht im Private/Incognito-Modus bist
- Prüfe den verfügbaren Speicherplatz

### Suchfunktion funktioniert nicht
- Aktualisiere die Seite (Service Worker lädt sich neu)
- Prüfe, ob JavaScript aktiviert ist
- Lösche den Cache und lade neu

### Bilder werden nicht angezeigt
- Maximale Bildgröße: 5MB vor Kompression
- Unterstützte Formate: JPEG, PNG, WebP
- Versuche ein kleineres Bild

## Contributing

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Commit deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## Lizenz

MIT License - siehe [LICENSE](LICENSE) für Details.

---

**Hinweis:** Diese App ist für legale Märkte gedacht. Bitte beachte die Gesetze deines Landes bezüglich Cannabis.

**Datenschutz:** Alle Daten werden lokal auf deinem Gerät gespeichert. Es findet keine Übertragung an externe Server statt.