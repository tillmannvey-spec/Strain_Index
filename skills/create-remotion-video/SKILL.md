---
name: create-remotion-video
description: Strukturierter Workflow zur Erstellung von Remotion Videos mit Plan, Style-Vorschlägen und fal.ai Asset-Generierung
metadata:
  tags: remotion, video, planning, fal.ai, workflow
---

# Remotion Video Creator Workflow

Dieser Skill bietet einen strukturierten Workflow zur Erstellung von Remotion Videos mit integrierter Asset-Generierung.

## Wann verwenden

Nutze diesen Skill, wenn der Nutzer ein neues Remotion Video erstellen möchte. Der Skill führt durch einen strukturierten Prozess von der Planung bis zur Implementierung.

## Workflow-Schritte

### 1. Plan-Erstellung (Plan Mode)

**Ziel**: Gemeinsam mit dem Nutzer einen klaren Plan für das Video entwickeln.

Verwende `EnterPlanMode` und sammle folgende Informationen:

- **Video-Konzept**: Was soll das Video zeigen? Welche Message/Story?
- **Zielgruppe**: Für wen ist das Video? (Social Media, Marketing, Tutorial, etc.)
- **Länge**: Wie lang soll das Video sein? (z.B. 15s, 30s, 60s)
- **Format**: Aspect Ratio (16:9, 9:16, 1:1)
- **Schlüsselszenen**: Welche Haupt-Szenen/Abschnitte soll es geben?

**Ausgabe**: Ein strukturierter Plan mit Timeline und Szenen-Übersicht.

### 2. Style & Umsetzungs-Vorschläge

**Ziel**: Konkrete Vorschläge für die visuelle Umsetzung machen.

Erstelle Vorschläge basierend auf:

#### Visueller Stil
- **Modern & Minimalistisch**: Clean Design, reduzierte Farbpalette, viel Whitespace
- **Bold & Energisch**: Kräftige Farben, dynamische Bewegungen, schnelle Cuts
- **Elegant & Professionell**: Subtile Animationen, gedämpfte Farben, sanfte Übergänge
- **Playful & Kreativ**: Bunte Farben, experimentelle Layouts, überraschende Effekte

#### Animations-Stil
- **Spring-basiert**: Natürliche, federnde Bewegungen (energisch, verspielt)
- **Easing-basiert**: Kontrollierte, präzise Bewegungen (professionell, elegant)
- **Kinetic Typography**: Text-fokussierte Animationen (informativ, modern)
- **3D & Depth**: Ebenen-Effekte, Parallax (sophisticated, beeindruckend)

#### Technische Umsetzung
- **Komponenten-Struktur**: Welche Haupt-Komponenten werden benötigt?
- **Transitions**: Welche Übergänge zwischen Szenen?
- **Typography**: Schriftarten und Text-Animationen
- **Color Scheme**: Farbpalette mit 3-5 Hauptfarben

**Ausgabe**: 2-3 konkrete Style-Vorschläge mit Beispiel-Code-Snippets.

### 3. Asset-Vorschläge (Bilder, Videos & Voice)

**Ziel**: Identifizieren, welche zusätzlichen Assets (Bilder/Videos/Voice) benötigt werden.

Analysiere das Video-Konzept und erstelle eine Liste mit:

#### Für jedes Asset
- **Typ**: Bild, Video oder Voice/Audio
- **Zweck**: Wofür wird es verwendet? (Hintergrund, Overlay, B-Roll, Narrator, Voiceover, etc.)
- **Szene**: In welcher Szene/Timeline-Position?
- **Spezifikationen**:
  - **Bilder/Videos**: Aspect Ratio, Resolution (2K Standard, 4K für Hintergründe), Dauer (5s/10s)
  - **Voice**: Textinhalt, Stimme, Style (professionell/expressiv), geschätzte Dauer

#### Prompt-Vorschläge
Für jedes Asset erstelle einen detaillierten fal.ai-Prompt:

**Für Bilder/Videos**:
- **Beschreibung**: Was soll zu sehen sein?
- **Stil**: Photorealistic, Cinematic, Abstract, etc.
- **Details**: Beleuchtung, Farben, Stimmung, Bewegung
- **Technische Parameter**: Format, Ratio, Qualität

**Für Voice/Audio**:
- **Text**: Der komplette Text der gesprochen werden soll
- **Stimme**: Welche Stimme passt? (Rachel, Adam, Bella, etc.)
- **Stil**: Professionell/stabil oder expressiv/emotional
- **Verwendung**: Narrator, Intro-Voiceover, Outro, etc.

**Beispiel**:
```
Asset 1: Hintergrund-Video
- Typ: Video
- Zweck: Intro-Hintergrund (0-5s)
- Specs: 16:9, 10s, mit Audio
- Prompt: "Cinematic aerial view of a modern city at sunrise with golden hour lighting, slow camera movement rising upwards, peaceful and inspiring atmosphere"

Asset 2: Narrator Voice
- Typ: Voice
- Zweck: Intro-Narrator (0-8s)
- Specs: Rachel (weiblich), professionell, stability 0.6
- Text: "Welcome to the future of innovation. Where ideas become reality and dreams take flight."
```

**Ausgabe**: Vollständige Asset-Liste mit fal.ai-ready Prompts.

### 4. Asset-Generierung mit fal.ai

**Ziel**: Die identifizierten Assets mit fal.ai generieren.

Für jedes Asset:

#### Bilder generieren
```bash
python ~/.claude/skills/fal-media-generator/scripts/generate.py image "$PROMPT" \
  --aspect_ratio $RATIO \
  --resolution $RESOLUTION \
  --output_format png
```

#### Videos generieren
```bash
python ~/.claude/skills/fal-media-generator/scripts/generate.py video "$PROMPT" \
  --duration $DURATION \
  --aspect_ratio $RATIO \
  --generate_audio $AUDIO
```

#### Voice/Audio generieren
```bash
python ~/.claude/skills/fal-media-generator/scripts/generate.py voice "$TEXT" \
  --voice $VOICE_NAME \
  --stability $STABILITY \
  --style $STYLE
```

**Best Practices**:
- Generiere Assets in der Reihenfolge ihrer Verwendung im Video
- Bei Voice: Prüfe ob die Länge zur geplanten Video-Szene passt
- Zeige nach jeder Generierung den Download-Link und Speicherort
- Notiere die Dateipfade für die spätere Integration in Remotion

**Ausgabe**: Heruntergeladene Assets in `./fal-outputs/` mit Übersicht der Dateipfade.

### 5. Remotion Code-Implementierung

**Ziel**: Das geplante Video in Remotion implementieren.

Nutze die `remotion-best-practices` Skill für:
- Composition-Setup
- Asset-Integration (Bilder/Videos aus fal-outputs)
- Animations-Implementierung
- Timing & Sequencing

**Struktur**:
```tsx
// 1. Composition definieren
// 2. Assets importieren
// 3. Szenen erstellen
// 4. Animationen hinzufügen
// 5. Sequencing & Timing
```

**Ausgabe**: Vollständig funktionierender Remotion Code.

## Interaktiver Workflow

### Verwendung mit AskUserQuestion

Nutze `AskUserQuestion` um:

1. **Nach Plan-Erstellung**: Style-Vorschlag auswählen lassen
   ```
   Welchen visuellen Stil bevorzugst du?
   - Modern & Minimalistisch (Recommended)
   - Bold & Energisch
   - Elegant & Professionell
   - Playful & Kreativ
   ```

2. **Bei Asset-Generierung**: Bestätigung einholen
   ```
   Soll ich jetzt die 3 vorgeschlagenen Assets generieren?
   - Ja, alle generieren (Recommended)
   - Nur Videos generieren
   - Nur Bilder generieren
   - Assets manuell auswählen
   ```

3. **Bei Unsicherheiten**: Konkrete Fragen stellen
   ```
   Welche Transition bevorzugst du zwischen Szenen?
   - Fade (Recommended)
   - Slide
   - Zoom
   - Custom
   ```

## Beispiel-Ablauf

```
User: "Erstelle ein Remotion Video für ein Produkt-Launch"
Step 1: EnterPlanMode
  → Fragen nach Konzept, Zielgruppe, Länge, Format
  → Plan erstellen mit Timeline

Step 2: Style-Vorschläge
  → "Modern & Minimalistisch" oder "Bold & Energisch"?
  → Farbschema vorschlagen
  → Animations-Approach (Spring vs. Easing)

Step 3: Asset-Liste
  → "Wir brauchen 2 Videos, 1 Bild und 1 Voice"
  → Asset 1: Produkt-Showcase Video (10s, 16:9)
  → Asset 2: Hintergrund-Textur Bild (2K, 16:9)
  → Asset 3: Confetti-Animation Video (5s, 16:9)
  → Asset 4: Narrator Voice (Rachel, professionell)

Step 4: Asset-Generierung
  → python generate.py video "Product rotating on pedestal..."
  → python generate.py image "Gradient background..."
  → python generate.py video "Colorful confetti falling..."
  → python generate.py voice "Introducing our revolutionary new product..."

Step 5: Remotion Code
  → Composition mit 30s @ 30fps
  → Import der generierten Assets
  → Szenen-Sequencing
  → Animationen hinzufügen
```

## Wichtige Hinweise

### Plan Mode nutzen
- **IMMER** `EnterPlanMode` zu Beginn nutzen
- Erst planen, dann implementieren
- Plan vom Nutzer bestätigen lassen

### Style-Vorschläge
- Mindestens 2-3 konkrete Vorschläge
- Mit Code-Beispielen
- Basierend auf Video-Zweck

### Asset-Generierung
- Nur Assets generieren, die wirklich benötigt werden
- Prompts so detailliert wie möglich
- Kosten im Blick behalten (ca. $1-3 pro Video)

### Integration mit anderen Skills
- Nutze `remotion-best-practices` für Code-Best-Practices
- Nutze `fal-media-generator` für Asset-Generierung
- Kombiniere beide Skills nahtlos im Workflow

## Kosten-Transparenz

Informiere den Nutzer über geschätzte Kosten:

**Beispiel**:
```
Für dieses Video benötigen wir:
- 2 Videos (10s mit Audio): 2 × $1.40 = $2.80
- 1 Bild (2K): $0.15
- 1 Voice (ca. 100 Zeichen): $0.15
Total: ~$3.10
```

## Erfolgs-Kriterien

Ein erfolgreich erstelltes Video hat:
- ✅ Klaren Plan mit definierten Szenen
- ✅ Passenden visuellen Stil
- ✅ Alle benötigten Assets generiert
- ✅ Funktionierenden Remotion Code
- ✅ Timing & Animationen wie geplant
