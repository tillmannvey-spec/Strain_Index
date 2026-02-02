# fal.ai Media Generator Skill

Dieses Skill ermöglicht es Claude, Bilder und Videos mit fal.ai zu generieren:

- **Bilder**: Nano Banana Pro - State-of-the-art AI Bildgenerierung
- **Videos**: Kling 2.6 Pro - Professionelle Video-Generierung mit nativem Audio

## Installation

### 1. Python-Abhängigkeiten installieren

```bash
pip install fal-client
```

### 2. API Key konfigurieren (optional)

Der API Key ist bereits im Script hinterlegt. Falls du ihn ändern möchtest, kannst du die Umgebungsvariable setzen:

```bash
export FAL_KEY="dein-api-key"
```

### 3. Skill testen

Frage Claude einfach, ein Bild oder Video zu erstellen:

```
"Erstelle ein Bild von einem Sonnenuntergang über Bergen in 16:9 Format mit 2K Qualität"

"Erstelle ein 10-Sekunden-Video von einer Katze, die mit einem Wollknäuel spielt"
```

## Verwendung

### Bilder generieren

**Einfach:**
```bash
python scripts/generate.py image "A futuristic cityscape at night"
```

**Mit Parametern:**
```bash
python scripts/generate.py image "Modern architecture" \
  --aspect_ratio 16:9 \
  --resolution 2K \
  --num_images 4 \
  --output_format png
```

**Verfügbare Parameter:**
- `--aspect_ratio`: 1:1, 16:9, 9:16, 4:3, 3:2, 21:9 (Standard: 1:1)
- `--resolution`: 1K, 2K, 4K (Standard: 2K)
- `--num_images`: 1-4 (Standard: 1)
- `--output_format`: jpeg, png, webp (Standard: png)
- `--seed`: Zufallsseed für Reproduzierbarkeit

### Videos generieren

**Einfach:**
```bash
python scripts/generate.py video "A cat playing with a ball of yarn"
```

**Mit Parametern:**
```bash
python scripts/generate.py video "Cinematic sunset over ocean waves" \
  --duration 10 \
  --aspect_ratio 16:9 \
  --generate_audio true \
  --cfg_scale 0.5
```

**Verfügbare Parameter:**
- `--duration`: "5" oder "10" Sekunden (Standard: "5")
- `--aspect_ratio`: 16:9, 9:16, 1:1 (Standard: 16:9)
- `--generate_audio`: true/false (Standard: true)
- `--cfg_scale`: Guidance Scale 0.0-1.0 (Standard: 0.5)
- `--negative_prompt`: Negative Prompt für bessere Kontrolle

## Ausgabeverzeichnisse

- Bilder: `./fal-outputs/images/`
- Videos: `./fal-outputs/videos/`

## Kosten

- **Bilder**: $0.15 pro Bild (4K: $0.30)
- **Videos**:
  - Ohne Audio: $0.07 pro Sekunde
  - Mit Audio: $0.14 pro Sekunde

## Features

### Nano Banana Pro (Bilder)
- 1K, 2K, 4K Auflösung
- Verschiedene Aspect Ratios
- Mehrere Bilder gleichzeitig
- Kommerziell nutzbar
- Saubere, lesbare Texte im Bild
- Bis zu 14 Referenzbilder für Konsistenz

### Kling 2.6 Pro (Videos)
- 5 oder 10 Sekunden Länge
- 1080p Auflösung
- Native Audio-Generierung (Deutsch & Englisch)
- Kinematische Qualität
- Hochwertige Bewegungsanimationen

## Troubleshooting

### "fal_client nicht installiert"
```bash
pip install fal-client
```

### API Key Fehler
Setze die Umgebungsvariable:
```bash
export FAL_KEY="dein-api-key"
```

Oder bearbeite `DEFAULT_API_KEY` im `scripts/generate.py`

### Download Fehler
Stelle sicher, dass du eine Internetverbindung hast und die Ausgabeverzeichnisse erstellt werden können.

## Beispiele

### Beispiel 1: Produkt-Rendering
```bash
python scripts/generate.py image "A sleek modern smartphone on a marble surface" \
  --aspect_ratio 3:2 \
  --resolution 4K \
  --output_format png
```

### Beispiel 2: Social Media Video
```bash
python scripts/generate.py video "Product unboxing with dramatic lighting" \
  --duration 10 \
  --aspect_ratio 9:16 \
  --generate_audio true
```

### Beispiel 3: Mehrere Variations
```bash
python scripts/generate.py image "Minimalist logo design for a tech company" \
  --num_images 4 \
  --aspect_ratio 1:1 \
  --resolution 2K
```

## Dokumentation

- [fal.ai Nano Banana Pro](https://fal.ai/models/fal-ai/nano-banana-pro)
- [fal.ai Kling 2.6 Pro](https://fal.ai/models/fal-ai/kling-video/v2.6/pro/text-to-video)
- [fal.ai API Docs](https://fal.ai/docs)
