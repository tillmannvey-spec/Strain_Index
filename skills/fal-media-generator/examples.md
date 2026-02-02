# Beispiele für fal.ai Media Generator

## Bilder (Nano Banana Pro)

### 1. Einfaches Bild
```bash
python scripts/generate.py image "A serene mountain landscape at sunset"
```

### 2. Social Media Post (1:1)
```bash
python scripts/generate.py image "Modern minimalist product photography of a coffee cup" \
  --aspect_ratio 1:1 \
  --resolution 2K \
  --output_format png
```

### 3. YouTube Thumbnail (16:9)
```bash
python scripts/generate.py image "Exciting tech review thumbnail with vibrant colors" \
  --aspect_ratio 16:9 \
  --resolution 2K
```

### 4. Instagram Story (9:16)
```bash
python scripts/generate.py image "Fashion photography, urban street style" \
  --aspect_ratio 9:16 \
  --resolution 2K
```

### 5. Hochauflösende Grafik
```bash
python scripts/generate.py image "Detailed architectural visualization of a modern building" \
  --aspect_ratio 16:9 \
  --resolution 4K \
  --output_format png
```

### 6. Mehrere Variationen
```bash
python scripts/generate.py image "Logo design for a tech startup, modern and minimal" \
  --num_images 4 \
  --aspect_ratio 1:1 \
  --resolution 2K
```

### 7. Reproduzierbares Ergebnis
```bash
python scripts/generate.py image "Abstract art with geometric shapes" \
  --aspect_ratio 1:1 \
  --resolution 2K \
  --seed 42
```

## Videos (Kling 2.6 Pro)

### 1. Einfaches Video (5s)
```bash
python scripts/generate.py video "A cat playing with a red ball of yarn"
```

### 2. Langes Video mit Audio (10s)
```bash
python scripts/generate.py video "A cinematic shot of ocean waves crashing on a beach at sunset" \
  --duration 10 \
  --generate_audio true
```

### 3. Instagram Reel (9:16)
```bash
python scripts/generate.py video "A person dancing energetically in a colorful urban environment" \
  --duration 5 \
  --aspect_ratio 9:16 \
  --generate_audio true
```

### 4. YouTube Short (9:16, 10s)
```bash
python scripts/generate.py video "Quick cooking tutorial: making pasta" \
  --duration 10 \
  --aspect_ratio 9:16 \
  --generate_audio true
```

### 5. Quadratisches Video für Social Media (1:1)
```bash
python scripts/generate.py video "Product showcase: rotating smartphone" \
  --duration 5 \
  --aspect_ratio 1:1 \
  --generate_audio false
```

### 6. Kinematische Szene
```bash
python scripts/generate.py video "Old friends reuniting at a train station after 20 years, emotional and cinematic" \
  --duration 10 \
  --aspect_ratio 16:9 \
  --generate_audio true \
  --cfg_scale 0.7
```

### 7. Abstract Motion Graphics
```bash
python scripts/generate.py video "Abstract colorful liquid shapes morphing smoothly" \
  --duration 10 \
  --aspect_ratio 16:9 \
  --generate_audio false \
  --cfg_scale 0.3
```

### 8. Video ohne Audio
```bash
python scripts/generate.py video "Peaceful nature scene with birds flying" \
  --duration 5 \
  --aspect_ratio 16:9 \
  --generate_audio false
```

## Voice/Audio (ElevenLabs 2.5 Turbo)

### 1. Einfacher Narrator (Standard Rachel)
```bash
python scripts/generate.py voice "Welcome to our channel. Today we're going to explore something amazing."
```

### 2. Professioneller Sprecher (männlich, stabil)
```bash
python scripts/generate.py voice "In a world where technology evolves every day, one innovation stands out" \
  --voice Adam \
  --stability 0.8 \
  --similarity_boost 0.9
```

### 3. Expressiver Narrator (weiblich, emotional)
```bash
python scripts/generate.py voice "This is the moment we've all been waiting for. The future is here!" \
  --voice Bella \
  --stability 0.4 \
  --style 0.6
```

### 4. Video Intro Voiceover
```bash
python scripts/generate.py voice "Hey everyone, welcome back to my channel. In today's video, we're diving deep into the world of AI" \
  --voice Rachel \
  --stability 0.5 \
  --style 0.3
```

### 5. Produkt-Präsentation (männlich, professionell)
```bash
python scripts/generate.py voice "Introducing the latest innovation in smart home technology. Designed for modern living, built for tomorrow" \
  --voice Josh \
  --stability 0.7 \
  --similarity_boost 0.85
```

### 6. Dramatischer Narrator (männlich, tief)
```bash
python scripts/generate.py voice "From the depths of the ocean to the peaks of the highest mountains, nature reveals its secrets" \
  --voice Antoni \
  --stability 0.6 \
  --style 0.5 \
  --use_speaker_boost true
```

### 7. Tutorial Voiceover (freundlich, klar)
```bash
python scripts/generate.py voice "Let me show you how easy this is. First, open the application. Then, click on the settings icon" \
  --voice Domi \
  --stability 0.6 \
  --style 0.2
```

### 8. Werbung Voiceover (energisch)
```bash
python scripts/generate.py voice "Don't miss out on this limited time offer! Order now and get fifty percent off" \
  --voice Elli \
  --stability 0.5 \
  --style 0.7
```

## Anwendungsfälle

### Marketing & Werbung

**Produktfoto:**
```bash
python scripts/generate.py image "Sleek modern smartwatch on a marble surface with dramatic lighting" \
  --aspect_ratio 3:2 \
  --resolution 4K
```

**Produktvideo:**
```bash
python scripts/generate.py video "Elegant product reveal of a luxury perfume bottle" \
  --duration 10 \
  --aspect_ratio 16:9 \
  --generate_audio true
```

**Produkt-Voiceover:**
```bash
python scripts/generate.py voice "Experience luxury like never before. Our new fragrance collection captures the essence of elegance" \
  --voice Rachel \
  --stability 0.7 \
  --style 0.3
```

### Social Media Content

**Instagram Post:**
```bash
python scripts/generate.py image "Travel photography: vibrant street market in Morocco" \
  --aspect_ratio 1:1 \
  --resolution 2K
```

**TikTok/Instagram Reel:**
```bash
python scripts/generate.py video "Quick DIY craft tutorial with satisfying results" \
  --duration 10 \
  --aspect_ratio 9:16 \
  --generate_audio true
```

**Social Media Voiceover:**
```bash
python scripts/generate.py voice "Check out this amazing tutorial! You won't believe how easy it is" \
  --voice Bella \
  --stability 0.5 \
  --style 0.5
```

### Kunst & Design

**Konzeptkunst:**
```bash
python scripts/generate.py image "Futuristic cyberpunk cityscape with neon lights and flying cars" \
  --aspect_ratio 21:9 \
  --resolution 4K
```

**Motion Graphics:**
```bash
python scripts/generate.py video "Smooth abstract transitions with gradient colors" \
  --duration 10 \
  --aspect_ratio 16:9 \
  --generate_audio false
```

### Storytelling & Content Creation

**Storyboard:**
```bash
python scripts/generate.py image "Dramatic movie scene: hero standing on cliff edge at sunset" \
  --aspect_ratio 16:9 \
  --resolution 2K \
  --num_images 3
```

**Kurze Szene:**
```bash
python scripts/generate.py video "Cinematic establishing shot of a magical forest at dawn" \
  --duration 10 \
  --aspect_ratio 16:9 \
  --generate_audio true
```

**Storytelling Narrator:**
```bash
python scripts/generate.py voice "Once upon a time, in a land far away, there existed a magical forest where dreams came alive" \
  --voice Antoni \
  --stability 0.6 \
  --style 0.6
```

## Tipps für bessere Prompts

### Für Bilder:
1. **Sei spezifisch**: "Modern minimalist living room with plants" statt "room"
2. **Beschreibe den Stil**: "Photorealistic", "Oil painting", "Anime style"
3. **Beleuchtung angeben**: "Golden hour lighting", "Studio lighting", "Dramatic shadows"
4. **Details hinzufügen**: Farben, Materialien, Stimmung

### Für Videos:
1. **Bewegung beschreiben**: "Slowly zooming in", "Camera panning left", "Rotating 360°"
2. **Emotion/Stimmung**: "Energetic", "Peaceful", "Dramatic", "Mysterious"
3. **Kamerawinkel**: "Wide shot", "Close-up", "Aerial view"
4. **Zeitangaben**: "At sunset", "During rainstorm", "In slow motion"

### Für Voice:
1. **Stimme wählen**: Passend zum Zweck (Rachel/Bella = weiblich, Adam/Josh/Antoni = männlich)
2. **Stability einstellen**: Hoch (0.7-0.9) für professionell/konsistent, Niedrig (0.3-0.5) für expressiv/emotional
3. **Style anpassen**: 0.0 für neutral, 0.5-1.0 für mehr Ausdruck und Variation
4. **Text strukturieren**: Pausen mit Kommas/Punkten, Betonung durch Formatierung
5. **Länge beachten**: Zu lange Texte können monoton wirken - besser in Abschnitte aufteilen

## Kostenberechnung

### Bilder:
- 1K/2K: $0.15 pro Bild
- 4K: $0.30 pro Bild

**Beispiel**: 4 Bilder in 2K = 4 × $0.15 = $0.60

### Videos:
- 5s mit Audio: 5 × $0.14 = $0.70
- 5s ohne Audio: 5 × $0.07 = $0.35
- 10s mit Audio: 10 × $0.14 = $1.40
- 10s ohne Audio: 10 × $0.07 = $0.70

**Beispiel**: 10s Video mit Audio in 16:9 = $1.40

### Voice:
- ~$0.15 pro 1000 Zeichen mit Turbo v2.5
- Durchschnittlicher Satz (50-100 Zeichen): ~$0.01-0.02
- Voiceover für 10s Video (ca. 150 Zeichen): ~$0.02-0.05

**Beispiel**: Narrator Text mit 200 Zeichen = ca. $0.03-0.05
