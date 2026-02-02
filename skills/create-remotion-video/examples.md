# Beispiele: Remotion Video Creator Workflow

Konkrete Beispiele für verschiedene Video-Typen mit diesem Skill.

## Beispiel 1: Instagram Reel (Produkt-Showcase)

### User Input
```
"Erstelle ein 15 Sekunden Instagram Reel für unseren neuen Smoothie-Maker"
```

### Phase 1: Plan
```yaml
Video-Konzept: Produkt-Showcase für Kitchen-Gadget
Zielgruppe: Health-conscious Millennials auf Instagram
Länge: 15s
Format: 9:16 (Instagram Reel)

Timeline:
- 0-3s: Hook - Frucht-Explosion
- 3-8s: Produkt in Aktion
- 8-12s: Fertiger Smoothie
- 12-15s: CTA - "Link in Bio"
```

### Phase 2: Style-Vorschlag (Gewählt: Bold & Energisch)
```tsx
// Farbschema
const colors = {
  primary: '#FF6B35',    // Orange (Energy)
  secondary: '#00D9FF',  // Cyan (Fresh)
  accent: '#FFE66D',     // Yellow (Happy)
  bg: '#FFFFFF'
};

// Animations
spring({ fps: 30, damping: 15 }) // Bouncy, energetisch
```

### Phase 3: Asset-Liste
```
Asset 1: Fruits Explosion Video
- Typ: Video
- Zweck: Hook Background (0-3s)
- Specs: 9:16, 5s, mit Audio
- Prompt: "Colorful fresh fruits exploding in slow motion -
          strawberries, blueberries, bananas flying upwards,
          white background, high energy, commercial style,
          vibrant colors"

Asset 2: Smoothie Close-up
- Typ: Bild
- Zweck: Final Shot (8-12s)
- Specs: 9:16, 4K
- Prompt: "Professional food photography of a vibrant green
          smoothie in a glass, topped with fresh berries,
          white background, commercial lighting, appetizing"
```

### Phase 4: Asset-Generierung
```bash
python ~/.claude/skills/fal-media-generator/scripts/generate.py video \
  "Colorful fresh fruits exploding in slow motion..." \
  --duration 5 \
  --aspect_ratio 9:16 \
  --generate_audio true

python ~/.claude/skills/fal-media-generator/scripts/generate.py image \
  "Professional food photography of a vibrant green smoothie..." \
  --aspect_ratio 9:16 \
  --resolution 4K
```

**Kosten**: ~$1.00

### Phase 5: Remotion Code (Vereinfacht)
```tsx
export const SmoothieReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {/* Scene 1: Hook (0-90 frames / 0-3s) */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill>
          <Video src={fruitsExplosion} />
          <div style={titleStyle}>
            <h1>FRESH.</h1>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Product (90-240 / 3-8s) */}
      <Sequence from={90} durationInFrames={150}>
        <ProductShowcase />
      </Sequence>

      {/* Scene 3: Result (240-360 / 8-12s) */}
      <Sequence from={240} durationInFrames={120}>
        <AbsoluteFill>
          <Img src={smoothieImage} style={imageStyle} />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4: CTA (360-450 / 12-15s) */}
      <Sequence from={360} durationInFrames={90}>
        <CallToAction text="Link in Bio" />
      </Sequence>
    </>
  );
};
```

---

## Beispiel 2: YouTube Intro (Tech-Channel)

### User Input
```
"Ich brauche ein 10 Sekunden Intro für meinen Tech-YouTube-Kanal"
```

### Phase 1: Plan
```yaml
Video-Konzept: Channel Intro - Tech/Gadgets
Zielgruppe: Tech-Enthusiasts auf YouTube
Länge: 10s
Format: 16:9 (YouTube)

Timeline:
- 0-3s: Logo Reveal
- 3-7s: Channel Name Animation
- 7-10s: Tagline + Audio Sting
```

### Phase 2: Style-Vorschlag (Gewählt: Modern & Minimalistisch)
```tsx
const colors = {
  primary: '#000000',
  secondary: '#FFFFFF',
  accent: '#0066FF',
  glow: 'rgba(0, 102, 255, 0.5)'
};

// Smooth, controlled animations
interpolate(frame, [0, 30], [0, 1], {
  easing: Easing.bezier(0.16, 1, 0.3, 1)
});
```

### Phase 3: Asset-Liste
```
Asset 1: Tech Background
- Typ: Video
- Zweck: Animated Background (full duration)
- Specs: 16:9, 10s, ohne Audio
- Prompt: "Abstract futuristic tech background with subtle
          circuit board patterns and flowing blue light particles,
          dark background, minimal and elegant, cinematic"

Asset 2: Logo Glow Effect
- Typ: Bild
- Zweck: Logo enhancement
- Specs: 1:1, 2K, transparent style
- Prompt: "Glowing blue circular light effect with soft edges,
          transparent center, ethereal and tech-style"
```

### Kosten
```
1× Background Video (10s, ohne Audio): $0.70
1× Glow Effect Image (2K): $0.15
Total: $0.85
```

---

## Beispiel 3: Produkt-Launch Video (Ausführlich)

### User Input
```
"Erstelle ein 45 Sekunden Produkt-Launch Video für unsere neue Smartwatch"
```

### Phase 1: Plan
```yaml
Video-Konzept: Premium Product Launch - Smartwatch
Zielgruppe: Tech-savvy professionals, 25-45
Länge: 45s
Format: 16:9 (Website Hero)

Timeline:
- 0-5s: Intro - Brand Logo Reveal
- 5-15s: Problem Statement
- 15-25s: Product Showcase (Features)
- 25-35s: Lifestyle Integration
- 35-45s: CTA - "Available Now"
```

### Phase 2: Style-Vorschlag (Gewählt: Elegant & Professionell)
```tsx
const colors = {
  primary: '#1A1A1A',
  secondary: '#F5F5F5',
  accent: '#C9A961',      // Gold
  highlight: '#FFFFFF'
};

// Subtle, professional animations
spring({ fps: 30, damping: 100, stiffness: 200 })
```

### Phase 3: Asset-Liste (Detailliert)
```
Asset 1: Brand Intro Background
├─ Typ: Video
├─ Zweck: Opening shot background
├─ Timeline: 0-5s
├─ Specs: 16:9, 10s, mit Audio
└─ Prompt: "Elegant abstract background with smooth flowing
           dark fabric textures, subtle gold accents, luxury
           and premium feel, cinematic lighting"

Asset 2: Urban Lifestyle Scene
├─ Typ: Video
├─ Zweck: Problem statement B-Roll
├─ Timeline: 5-15s
├─ Specs: 16:9, 10s, mit Audio
└─ Prompt: "Cinematic shot of busy professional in modern
           city environment, fast-paced lifestyle, looking
           at wrist/checking time, natural lighting,
           corporate and relatable"

Asset 3: Product Hero Image
├─ Typ: Bild
├─ Zweck: Main product showcase
├─ Timeline: 15-25s
├─ Specs: 16:9, 4K
└─ Prompt: "Premium product photography of modern smartwatch
           on black reflective surface, dramatic studio lighting,
           metallic finish visible, ultra high detail,
           professional advertising style"

Asset 4: Fitness Lifestyle
├─ Typ: Video
├─ Zweck: Use-case demonstration
├─ Timeline: 25-35s
├─ Specs: 16:9, 10s, mit Audio
└─ Prompt: "Athletic person working out in modern gym wearing
           smartwatch, checking fitness metrics, motivational
           and energetic, natural lighting, healthy lifestyle"

Asset 5: Premium Texture
├─ Typ: Bild
├─ Zweck: Subtle background element
├─ Timeline: Used throughout
├─ Specs: 16:9, 2K
└─ Prompt: "Subtle gold and black gradient texture with
           slight noise, luxury and premium feel, minimal"
```

### Phase 4: Asset-Generierung
```bash
# Total: 3 Videos + 2 Bilder
python ... video "Elegant abstract background..." --duration 10 --aspect_ratio 16:9 --generate_audio true
python ... video "Cinematic shot of busy professional..." --duration 10 --aspect_ratio 16:9 --generate_audio true
python ... image "Premium product photography of modern smartwatch..." --aspect_ratio 16:9 --resolution 4K
python ... video "Athletic person working out..." --duration 10 --aspect_ratio 16:9 --generate_audio true
python ... image "Subtle gold and black gradient texture..." --aspect_ratio 16:9 --resolution 2K

Kosten Breakdown:
- 3× Videos (10s, mit Audio): 3 × $1.40 = $4.20
- 1× Hero Image (4K): $0.30
- 1× Texture (2K): $0.15
Total: $4.65
```

### Phase 5: Remotion Code Structure
```tsx
const INTRO = { start: 0, duration: 150 };        // 0-5s
const PROBLEM = { start: 150, duration: 300 };    // 5-15s
const SHOWCASE = { start: 450, duration: 300 };   // 15-25s
const LIFESTYLE = { start: 750, duration: 300 };  // 25-35s
const CTA = { start: 1050, duration: 300 };       // 35-45s

export const ProductLaunchVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Background Layer */}
      <BackgroundLayer />

      {/* Scene 1: Intro */}
      <Sequence from={INTRO.start} durationInFrames={INTRO.duration}>
        <IntroScene video={brandIntroVideo} />
      </Sequence>

      {/* Scene 2: Problem */}
      <Sequence from={PROBLEM.start} durationInFrames={PROBLEM.duration}>
        <ProblemScene
          video={urbanLifestyleVideo}
          text="Time is precious."
        />
      </Sequence>

      {/* Scene 3: Product Showcase */}
      <Sequence from={SHOWCASE.start} durationInFrames={SHOWCASE.duration}>
        <ProductShowcase
          image={productHeroImage}
          features={['Heart Rate', 'GPS', 'Battery Life']}
        />
      </Sequence>

      {/* Scene 4: Lifestyle */}
      <Sequence from={LIFESTYLE.start} durationInFrames={LIFESTYLE.duration}>
        <LifestyleScene video={fitnessLifestyleVideo} />
      </Sequence>

      {/* Scene 5: CTA */}
      <Sequence from={CTA.start} durationInFrames={CTA.duration}>
        <CTAScene
          title="Available Now"
          subtitle="www.yourstore.com"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
```

---

## Beispiel 4: Schnelles Social Media Teaser

### User Input
```
"Mach mir schnell einen 8s Teaser für TikTok"
```

### Vereinfachter Workflow (Express-Mode)

**Plan**:
```
8s TikTok Teaser (9:16)
- 0-2s: Hook
- 2-6s: Content
- 6-8s: CTA
```

**Style**: Bold & Energisch

**Assets (minimal)**:
```
1× Background Video (5s, mit Audio): $0.70
```

**Code**:
```tsx
export const QuickTeaser: React.FC = () => (
  <>
    <Sequence from={0} durationInFrames={60}>
      <HookScene text="WAIT FOR IT!" />
    </Sequence>
    <Sequence from={60} durationInFrames={120}>
      <ContentScene video={bgVideo} />
    </Sequence>
    <Sequence from={180} durationInFrames={60}>
      <CTAScene text="FOLLOW!" />
    </Sequence>
  </>
);
```

**Total Zeit**: ~15 Minuten (inkl. Asset-Generierung)
**Kosten**: $0.70

---

## Vergleich: Mit vs. Ohne Skill

### Ohne Skill (Manual)
```
1. User fragt nach Video
2. Du fragst 10 separate Fragen
3. User muss alles spezifizieren
4. Du rätst bei Assets
5. Kosten-Überraschung
6. Mehrere Iterationen
⏱️ Zeit: 45-60 Min
😰 Stress-Level: Hoch
```

### Mit Skill (Strukturiert)
```
1. Skill aktivieren
2. Plan Mode: Alle Infos sammeln
3. Style-Vorschläge: User wählt
4. Asset-Liste: Transparent + Kosten
5. Generierung: Ein Kommando
6. Code: Best Practices integriert
⏱️ Zeit: 20-30 Min
😊 Stress-Level: Niedrig
```

---

## Quick Reference: Typische Video-Längen

| Plattform | Format | Länge | Typische Kosten |
|-----------|--------|-------|-----------------|
| TikTok | 9:16 | 15-30s | $1-2 |
| Instagram Reel | 9:16 | 15-30s | $1-2 |
| YouTube Short | 9:16 | 30-60s | $2-4 |
| YouTube Intro | 16:9 | 5-10s | $0.50-1 |
| Website Hero | 16:9 | 30-60s | $3-5 |
| Product Launch | 16:9 | 45-90s | $4-8 |
| Explainer | 16:9 | 60-120s | $6-12 |

---

## Pro-Tips

### Für schnelle Videos (< 20s)
- Maximal 3 Assets
- Style: Bold (wenig Nuancen)
- Transitions: Einfach (Fade/Cut)

### Für Marketing-Videos (30-60s)
- 4-6 hochwertige Assets
- Style: Elegant oder Modern
- Fokus auf Storytelling

### Für Tutorials (60-120s)
- Viele Screen-Recordings (keine fal.ai Kosten!)
- Style: Clean & Minimal
- Text-Heavy (günstig!)

### Kosten sparen
- Videos ohne Audio: 50% günstiger
- 2K statt 4K Bilder: 50% günstiger
- 5s statt 10s Videos: 50% günstiger
- Loops nutzen: Ein 5s Video für 20s Content

### Qualität maximieren
- Sehr detaillierte Prompts
- 4K für Hero-Shots
- Audio für Atmosphäre
- cfg_scale anpassen (0.5-0.7 für mehr Control)
