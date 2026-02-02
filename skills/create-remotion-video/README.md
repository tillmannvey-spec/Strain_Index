# Create Remotion Video - Workflow Skill

Ein strukturierter, step-by-step Workflow zur Erstellung von Remotion Videos mit integrierter fal.ai Asset-Generierung.

## Überblick

Dieser Skill führt dich durch den kompletten Prozess der Video-Erstellung:
1. **Planung** - Konzept und Timeline entwickeln
2. **Style-Design** - Visuelle Richtung festlegen
3. **Asset-Planning** - Benötigte Medien identifizieren (Bilder, Videos, Voice)
4. **Asset-Generierung** - Bilder/Videos/Voice mit fal.ai erstellen
5. **Implementierung** - Remotion Code schreiben

## Wann nutzen

Verwende diesen Skill, wenn du:
- Ein neues Remotion Video von Grund auf erstellen willst
- Einen strukturierten Ansatz bevorzugst
- AI-generierte Assets (Bilder/Videos/Voice) brauchst
- Sicherstellen willst, dass nichts vergessen wird

**Beispiel-Anfragen**:
- "Erstelle ein Remotion Video für unseren Produkt-Launch"
- "Ich brauche ein 30s Marketing-Video"
- "Mach mir ein Instagram Reel mit Remotion"
- "Erstelle ein animiertes Erklärvideo"

## Workflow im Detail

### Phase 1: Planung (Plan Mode)

Der Skill startet automatisch im Plan Mode und sammelt:

**Video-Grundlagen**:
- Konzept/Zweck des Videos
- Zielgruppe und Plattform (YouTube, Instagram, Website, etc.)
- Gewünschte Länge (15s, 30s, 60s, etc.)
- Format/Aspect Ratio (16:9, 9:16, 1:1)

**Content-Struktur**:
- Anzahl der Szenen
- Was passiert in jeder Szene
- Timeline-Aufteilung
- Texte/Messages

**Beispiel-Output**:
```
Video Plan: Produkt-Launch
├─ Dauer: 30s @ 30fps (900 frames)
├─ Format: 16:9 (1920×1080)
└─ Szenen:
   ├─ Intro (0-5s): Logo-Reveal mit Hintergrund
   ├─ Feature 1 (5-12s): Produkt-Showcase
   ├─ Feature 2 (12-20s): Benefit-Highlight
   └─ Outro (20-30s): Call-to-Action
```

### Phase 2: Style-Vorschläge

Basierend auf dem Plan werden 2-3 Style-Optionen vorgeschlagen:

**Option A: Modern & Minimalistisch**
```tsx
// Farbschema
const colors = {
  primary: '#000000',
  secondary: '#FFFFFF',
  accent: '#0066FF'
};

// Animations-Approach
spring({ fps: 30, damping: 100 })
```

**Option B: Bold & Energisch**
```tsx
// Farbschema
const colors = {
  primary: '#FF6B00',
  secondary: '#FFD600',
  accent: '#00FF9F'
};

// Animations-Approach
spring({ fps: 30, damping: 20 })
```

Jeder Style-Vorschlag enthält:
- Farbpalette
- Animations-Parameter
- Typography-Empfehlungen
- Beispiel-Code-Snippets

### Phase 3: Asset-Planning

Für jede Szene werden benötigte Assets identifiziert:

**Asset-Liste Format**:
```
Asset #1: Intro Background Video
├─ Typ: Video
├─ Zweck: Hintergrund für Logo-Reveal (Szene 1)
├─ Timeline: 0-5s
├─ Specs: 16:9, 10s Dauer, mit Audio
└─ fal.ai Prompt: "Cinematic abstract background with flowing
                   gradient colors in blue and purple, slow
                   smooth movement, professional and modern"

Asset #2: Produkt Hero Image
├─ Typ: Bild
├─ Zweck: Hauptprodukt-Bild (Szene 2)
├─ Timeline: 5-12s
├─ Specs: 16:9, 4K Resolution
└─ fal.ai Prompt: "Professional product photography of modern
                   smartphone on clean white background,
                   dramatic studio lighting, highly detailed"

Asset #3: Confetti Animation
├─ Typ: Video
├─ Zweck: Overlay für CTA (Szene 4)
├─ Timeline: 20-30s
├─ Specs: 16:9, 10s Dauer, kein Audio
└─ fal.ai Prompt: "Colorful confetti and celebration particles
                   falling from top, transparent background style,
                   festive and joyful"

Asset #4: Narrator Voice
├─ Typ: Voice/Audio
├─ Zweck: Intro-Voiceover (Szene 1)
├─ Timeline: 0-8s
├─ Specs: Rachel (weiblich), professionell, stability 0.6
└─ Text: "Introducing the future of innovation. Where dreams
          become reality and possibilities are endless."
```

**Best Practices für Asset-Planning**:
- Background-Videos: 10s Länge (für Loops)
- Hero-Images: 4K für Qualität
- Overlays: Ohne Audio (spart Kosten)
- B-Roll: 5s meist ausreichend
- Voice: Text-Länge an Szenen-Dauer anpassen, passende Stimme wählen

### Phase 4: Asset-Generierung

Assets werden mit dem `fal-media-generator` Skill erstellt:

```bash
# Asset 1: Background Video
python ~/.claude/skills/fal-media-generator/scripts/generate.py video \
  "Cinematic abstract background with flowing gradient colors..." \
  --duration 10 \
  --aspect_ratio 16:9 \
  --generate_audio true

# Asset 2: Product Image
python ~/.claude/skills/fal-media-generator/scripts/generate.py image \
  "Professional product photography of modern smartphone..." \
  --aspect_ratio 16:9 \
  --resolution 4K

# Asset 3: Confetti Video
python ~/.claude/skills/fal-media-generator/scripts/generate.py video \
  "Colorful confetti and celebration particles falling..." \
  --duration 10 \
  --aspect_ratio 16:9 \
  --generate_audio false

# Asset 4: Narrator Voice
python ~/.claude/skills/fal-media-generator/scripts/generate.py voice \
  "Introducing the future of innovation. Where dreams become reality..." \
  --voice Rachel \
  --stability 0.6 \
  --style 0.3
```

**Output-Tracking**:
```
✓ Asset 1 generiert: ./fal-outputs/videos/intro_background_xyz.mp4
✓ Asset 2 generiert: ./fal-outputs/images/product_hero_abc.png
✓ Asset 3 generiert: ./fal-outputs/videos/confetti_overlay_def.mp4
✓ Asset 4 generiert: ./fal-outputs/audio/voice_Introducing_the_future.mp3

Kosten: $3.05
```

### Phase 5: Remotion Implementierung

Mit allen Assets bereit wird der Remotion Code erstellt:

```tsx
import { Composition } from 'remotion';
import { Video, Img } from 'remotion';
import { useCurrentFrame, interpolate, spring } from 'remotion';

// Assets importieren
import introVideo from './fal-outputs/videos/intro_background_xyz.mp4';
import productImg from './fal-outputs/images/product_hero_abc.png';
import confettiVideo from './fal-outputs/videos/confetti_overlay_def.mp4';

export const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Szene 1: Intro (0-150 frames) */}
      {frame < 150 && (
        <Sequence from={0} durationInFrames={150}>
          <IntroScene background={introVideo} />
        </Sequence>
      )}

      {/* Szene 2: Produkt (150-360 frames) */}
      {frame >= 150 && frame < 360 && (
        <Sequence from={150} durationInFrames={210}>
          <ProductScene image={productImg} />
        </Sequence>
      )}

      {/* Weitere Szenen... */}
    </div>
  );
};

registerRoot(() => {
  return (
    <Composition
      id="ProductLaunch"
      component={MyVideo}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
  );
});
```

## Typische Anwendungsfälle

### 1. Social Media Content

**Instagram Reel (9:16, 15-30s)**:
- Szenen: Hook → Content → CTA
- Assets: 2-3 kurze Video-Clips
- Style: Bold & Energisch
- Kosten: ~$2-3

**YouTube Intro (16:9, 10s)**:
- Szenen: Logo → Text → Transition
- Assets: 1 Background-Video
- Style: Modern & Professionell
- Kosten: ~$1.50

### 2. Marketing & Werbung

**Produkt-Launch (16:9, 30-60s)**:
- Szenen: Intro → Features → Benefits → CTA
- Assets: 3-5 Videos + 2-3 Bilder
- Style: Elegant & Professionell
- Kosten: ~$5-8

**Erklärvideo (16:9, 60-90s)**:
- Szenen: Problem → Lösung → How-to → CTA
- Assets: 4-6 Videos + Icons/Grafiken
- Style: Modern & Minimalistisch
- Kosten: ~$6-10

### 3. Corporate & Business

**Company Intro (16:9, 45s)**:
- Szenen: Mission → Team → Values → Contact
- Assets: 3-4 Videos + Logo-Varianten
- Style: Elegant & Professionell
- Kosten: ~$4-6

## Interaktive Entscheidungen

Der Workflow nutzt `AskUserQuestion` an kritischen Punkten:

### Nach der Planung
```
Welchen Style bevorzugst du?
○ Modern & Minimalistisch - Clean, reduziert, professional
○ Bold & Energisch - Dynamisch, farbenfroh, attention-grabbing
○ Elegant & Professionell - Subtil, sophisticated, hochwertig
```

### Vor Asset-Generierung
```
Soll ich alle 4 Assets jetzt generieren? (Kosten: ~$3.50)
○ Ja, alle generieren - Komplett-Workflow
○ Nur kritische Assets - Nur Videos, Bilder überspringen
○ Später entscheiden - Zuerst Code-Struktur aufsetzen
```

### Bei technischen Optionen
```
Welche Animations-Library für Text?
○ Remotion Native - Einfach, performant
○ Framer Motion - Mehr Features, komplexer
○ GSAP - Maximum Control, external dependency
```

## Kosten-Kalkulation

### Typische Asset-Kosten

**Videos (mit Kling 2.6 Pro)**:
- 5s ohne Audio: $0.35
- 5s mit Audio: $0.70
- 10s ohne Audio: $0.70
- 10s mit Audio: $1.40

**Bilder (mit Nano Banana Pro)**:
- 2K: $0.15
- 4K: $0.30

**Voice (mit ElevenLabs 2.5 Turbo)**:
- ~$0.15 pro 1000 Zeichen
- Kurzer Text (50-100 Zeichen): ~$0.01-0.02
- Narrator für 10s Video (150-200 Zeichen): ~$0.02-0.05

### Beispiel-Projekte

**Einfaches Social Media Video** (15s):
- 1× Background-Video (10s, mit Audio): $1.40
- 1× Product-Image (2K): $0.15
- 1× Intro-Voice (100 Zeichen): $0.02
- **Total: $1.57**

**Professional Marketing Video** (45s):
- 3× B-Roll Videos (10s, mit Audio): $4.20
- 2× Hero Images (4K): $0.60
- 1× Overlay Video (5s, ohne Audio): $0.35
- 1× Narrator Voice (300 Zeichen): $0.05
- **Total: $5.20**

**High-End Präsentation** (90s):
- 5× Scene Videos (10s, mit Audio): $7.00
- 4× Product Images (4K): $1.20
- 2× Animation Videos (10s, ohne Audio): $1.40
- 2× Narrator Voices (je 400 Zeichen): $0.12
- **Total: $9.72**

## Tipps & Best Practices

### Planung
- ✅ Klar definierte Szenen (nicht zu viele!)
- ✅ Timeline früh festlegen
- ✅ Zielgruppe im Kopf behalten
- ❌ Nicht zu komplex planen

### Style
- ✅ Konsistente Farbpalette (3-5 Farben)
- ✅ Ein Animations-Approach (nicht mischen)
- ✅ Typography mit Hierarchie
- ❌ Nicht zu viele Styles kombinieren

### Assets
- ✅ Detaillierte fal.ai Prompts
- ✅ Passende Aspect Ratios
- ✅ Audio nur wo nötig
- ❌ Nicht zu viele Assets (Kosten!)

### Code
- ✅ Komponenten wiederverwenden
- ✅ `remotion-best-practices` befolgen
- ✅ Timing mit Konstanten
- ❌ Nicht hardcoden

## Integration mit anderen Skills

### remotion-best-practices
Wird automatisch verwendet für:
- Animations-Patterns
- Asset-Integration
- Sequencing & Timing
- Best Practices

### fal-media-generator
Wird aufgerufen für:
- Alle Bild-Generierungen
- Alle Video-Generierungen
- Alle Voice/Audio-Generierungen
- Asset-Downloads

## Fehlerbehebung

### "Plan zu vage"
→ Nutze `AskUserQuestion` für konkretere Details

### "Assets passen nicht"
→ Verfeinere die Prompts, generiere neu

### "Zu teuer"
→ Reduziere Asset-Anzahl, nutze Bilder statt Videos

### "Timing stimmt nicht"
→ Passe Timeline im Code an, nutze `spring()` für natürlichere Bewegungen

## Zusammenfassung

Dieser Skill ist ideal für:
- ✅ Strukturierte Video-Erstellung
- ✅ Projekte mit AI-generierten Assets
- ✅ Anfänger, die Guidance brauchen
- ✅ Komplexe Multi-Szenen-Videos

Nicht ideal für:
- ❌ Schnelle Prototypen ohne Assets
- ❌ Code-only Animationen
- ❌ Sehr simple Videos (1-2 Szenen)
