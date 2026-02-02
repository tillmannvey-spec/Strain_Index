---
name: fal-media-generator
description: Generiert Bilder mit Nano Banana Pro, Videos mit Kling 2.6, oder Voice/Audio mit ElevenLabs 2.5 Turbo auf fal.ai. Nutze dies wenn der Nutzer Bilder, Videos oder Voiceovers erstellen möchte.
allowed-tools: Bash(python *)
---

# fal.ai Media Generator

Erstellt Bilder, Videos und Voice/Audio mit fal.ai APIs:
- **Bilder**: Nano Banana Pro (hochqualitative AI-Bildgenerierung)
- **Videos**: Kling 2.6 Pro (Text-to-Video mit nativer Audio-Generierung)
- **Voice/Audio**: ElevenLabs 2.5 Turbo (Text-to-Speech für Narrator und Voiceovers)

## Verwendung

### Bilder generieren

```bash
python ~/.claude/skills/fal-media-generator/scripts/generate.py image "$ARGUMENTS"
```

**Parameter für Bilder** (als JSON oder als Argumente):
- `prompt` (erforderlich): Text-Beschreibung des gewünschten Bildes
- `aspect_ratio`: 1:1, 16:9, 9:16, 4:3, 3:2, 21:9 (Standard: 1:1)
- `resolution`: 1K, 2K, 4K (Standard: 2K)
- `num_images`: Anzahl der Bilder (1-4, Standard: 1)
- `output_format`: jpeg, png, webp (Standard: png)

**Beispiele**:
```bash
# Einfach
python ~/.claude/skills/fal-media-generator/scripts/generate.py image "A sunset over mountains"

# Mit Parametern
python ~/.claude/skills/fal-media-generator/scripts/generate.py image "A sunset over mountains" --aspect_ratio 16:9 --resolution 2K

# Mehrere Bilder
python ~/.claude/skills/fal-media-generator/scripts/generate.py image "Modern architecture" --num_images 4
```

### Videos generieren

```bash
python ~/.claude/skills/fal-media-generator/scripts/generate.py video "$ARGUMENTS"
```

**Parameter für Videos** (als JSON oder als Argumente):
- `prompt` (erforderlich): Text-Beschreibung des gewünschten Videos
- `duration`: "5" oder "10" Sekunden (Standard: "5")
- `aspect_ratio`: 16:9, 9:16, 1:1 (Standard: 16:9)
- `generate_audio`: true/false - Native Audio-Generierung (Standard: true)
- `cfg_scale`: Guidance Scale 0.0-1.0 (Standard: 0.5)

**Beispiele**:
```bash
# Einfach (5s, 16:9, mit Audio)
python ~/.claude/skills/fal-media-generator/scripts/generate.py video "A cat playing with a ball of yarn"

# Lange Version mit Audio
python ~/.claude/skills/fal-media-generator/scripts/generate.py video "Cinematic sunset over ocean waves" --duration 10 --generate_audio true

# Quadratisch, ohne Audio
python ~/.claude/skills/fal-media-generator/scripts/generate.py video "Abstract colorful shapes morphing" --aspect_ratio 1:1 --generate_audio false
```

### Voice/Audio generieren

```bash
python ~/.claude/skills/fal-media-generator/scripts/generate.py voice "$TEXT"
```

**Parameter für Voice** (als JSON oder als Argumente):
- `prompt` (erforderlich): Text der gesprochen werden soll
- `voice`: Voice Name oder ID (Standard: "Rachel" - weiblich, amerikanisch)
  - Verfügbare Stimmen: Rachel, Adam, Bella, Antoni, Elli, Josh, Arnold, Domi, u.v.m.
- `model_id`: ElevenLabs Model (Standard: "eleven_turbo_v2_5")
- `stability`: Stimm-Stabilität 0.0-1.0 (Standard: 0.5) - Höher = konsistenter, Niedriger = expressiver
- `similarity_boost`: Stimm-Ähnlichkeit 0.0-1.0 (Standard: 0.75)
- `style`: Expressivität/Stil 0.0-1.0 (Standard: 0.0)
- `use_speaker_boost`: Speaker Boost aktivieren true/false (Standard: true)

**Beispiele**:
```bash
# Einfach (Standard-Stimme Rachel)
python ~/.claude/skills/fal-media-generator/scripts/generate.py voice "Welcome to our amazing product showcase"

# Mit spezifischer Stimme und Einstellungen
python ~/.claude/skills/fal-media-generator/scripts/generate.py voice "This is an exciting announcement" --voice Adam --stability 0.6 --style 0.3

# Narrator für Video (expressiv)
python ~/.claude/skills/fal-media-generator/scripts/generate.py voice "In a world where technology meets creativity, one tool stands above the rest" --voice Bella --stability 0.4 --style 0.5

# Professioneller Sprecher (sehr stabil)
python ~/.claude/skills/fal-media-generator/scripts/generate.py voice "For more information, visit our website" --voice Josh --stability 0.8 --similarity_boost 0.9
```

## Workflow

Wenn der Nutzer ein Bild, Video oder Voice erstellen möchte:

1. **Identifiziere den Medientyp**: Bild, Video oder Voice
2. **Sammle die Parameter**:
   - Für Bilder: Prüfe ob Quality (2K empfohlen), Aspect Ratio oder andere Einstellungen gewünscht sind
   - Für Videos: Prüfe ob Länge (5s oder 10s), Audio (Standard: an) oder Aspect Ratio spezifiziert wurden
   - Für Voice: Prüfe welche Stimme (Rachel Standard), Text-Inhalt und Style-Einstellungen gewünscht sind
3. **Führe das Script aus** mit den entsprechenden Parametern
4. **Zeige den Download-Link** und eine Vorschau (falls möglich)

## Ausgabe

Das Script gibt zurück:
- **Bilder**: URLs zu den generierten Bildern
- **Videos**: URL zum generierten Video
- **Voice/Audio**: URL zur generierten Audiodatei
- **Metadaten**: Dateigröße, Format, etc.

Die generierten Dateien werden automatisch heruntergeladen in:
- Bilder: `./fal-outputs/images/`
- Videos: `./fal-outputs/videos/`
- Audio: `./fal-outputs/audio/`

## Kosten (Information)

- **Bilder**: $0.15 pro Bild (4K: doppelter Preis)
- **Videos**: $0.07/Sekunde (ohne Audio) oder $0.14/Sekunde (mit Audio)
- **Voice**: ~$0.15-0.30 je nach Textlänge (ca. $0.15 pro 1000 Zeichen mit Turbo v2.5)

## API Key

Die fal.ai API Key ist im Script hinterlegt. Falls erforderlich, kann sie als Umgebungsvariable `FAL_KEY` gesetzt werden.
