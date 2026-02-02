#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fal.ai Media Generator
Generiert Bilder mit Nano Banana Pro und Videos mit Kling 2.6 Pro
"""

import os
import sys
import json
import argparse
from pathlib import Path
from typing import Optional, Dict, Any

# Fix Windows console encoding for emojis
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# API Key - kann auch als Umgebungsvariable FAL_KEY gesetzt werden
DEFAULT_API_KEY = "bddf0e3f-c8da-450c-8d61-cf2164502bf7:316c21b87ee89f5988d7f6ae8cd1864d"

def setup_fal_client():
    """Initialisiert den fal.ai Client"""
    try:
        # Versuche fal zu importieren
        import fal_client

        # Setze API Key
        api_key = os.environ.get("FAL_KEY", DEFAULT_API_KEY)
        os.environ["FAL_KEY"] = api_key

        return fal_client
    except ImportError:
        print("❌ fal_client nicht installiert!")
        print("Installiere mit: pip install fal-client")
        sys.exit(1)

def download_file(url: str, output_dir: Path, filename: str) -> Path:
    """Lädt eine Datei von einer URL herunter"""
    import urllib.request

    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / filename

    print(f"📥 Downloading {filename}...")
    urllib.request.urlretrieve(url, output_path)
    print(f"✅ Saved to: {output_path}")

    return output_path

def generate_image(fal, prompt: str, **kwargs) -> Dict[str, Any]:
    """
    Generiert ein Bild mit Nano Banana Pro

    Args:
        prompt: Text-Beschreibung des Bildes
        aspect_ratio: 1:1, 16:9, 9:16, 4:3, 3:2, 21:9 (default: 1:1)
        resolution: 1K, 2K, 4K (default: 2K)
        num_images: 1-4 (default: 1)
        output_format: jpeg, png, webp (default: png)
        seed: Optional random seed
    """

    # Default-Werte
    params = {
        "prompt": prompt,
        "aspect_ratio": kwargs.get("aspect_ratio", "1:1"),
        "resolution": kwargs.get("resolution", "2K"),
        "num_images": int(kwargs.get("num_images", 1)),
        "output_format": kwargs.get("output_format", "png"),
    }

    if "seed" in kwargs:
        params["seed"] = int(kwargs["seed"])

    print("🎨 Generating image with Nano Banana Pro...")
    print(f"📝 Prompt: {prompt}")
    print(f"⚙️  Settings: {params['aspect_ratio']} @ {params['resolution']}, {params['num_images']} image(s)")

    try:
        result = fal.subscribe(
            "fal-ai/nano-banana-pro",
            arguments=params
        )

        print(f"✅ Generated {len(result['images'])} image(s)!")

        # Download images
        output_dir = Path("./fal-outputs/images")
        downloaded_files = []

        for idx, image in enumerate(result['images']):
            filename = f"nano_banana_{idx+1}.{params['output_format']}"
            file_path = download_file(image['url'], output_dir, filename)
            downloaded_files.append(str(file_path))
            print(f"🔗 URL: {image['url']}")

        return {
            "success": True,
            "type": "image",
            "count": len(result['images']),
            "files": downloaded_files,
            "urls": [img['url'] for img in result['images']],
            "params": params
        }

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {"success": False, "error": str(e)}

def generate_video(fal, prompt: str, **kwargs) -> Dict[str, Any]:
    """
    Generiert ein Video mit Kling 2.6 Pro

    Args:
        prompt: Text-Beschreibung des Videos
        duration: "5" oder "10" Sekunden (default: "5")
        aspect_ratio: 16:9, 9:16, 1:1 (default: 16:9)
        generate_audio: true/false (default: true)
        cfg_scale: 0.0-1.0 (default: 0.5)
    """

    # Default-Werte
    params = {
        "prompt": prompt,
        "duration": str(kwargs.get("duration", "5")),
        "aspect_ratio": kwargs.get("aspect_ratio", "16:9"),
        "generate_audio": kwargs.get("generate_audio", "true").lower() == "true",
        "cfg_scale": float(kwargs.get("cfg_scale", 0.5)),
    }

    if "negative_prompt" in kwargs:
        params["negative_prompt"] = kwargs["negative_prompt"]

    print("🎬 Generating video with Kling 2.6 Pro...")
    print(f"📝 Prompt: {prompt}")
    print(f"⚙️  Settings: {params['duration']}s, {params['aspect_ratio']}, Audio: {params['generate_audio']}")

    try:
        result = fal.subscribe(
            "fal-ai/kling-video/v2.6/pro/text-to-video",
            arguments=params,
            with_logs=True
        )

        print("✅ Video generated!")

        # Download video
        output_dir = Path("./fal-outputs/videos")
        video_url = result['video']['url']
        filename = f"kling_{params['duration']}s.mp4"
        file_path = download_file(video_url, output_dir, filename)

        file_size_mb = result['video']['file_size'] / (1024 * 1024)
        print(f"📊 Size: {file_size_mb:.2f} MB")
        print(f"🔗 URL: {video_url}")

        return {
            "success": True,
            "type": "video",
            "file": str(file_path),
            "url": video_url,
            "size_mb": file_size_mb,
            "params": params
        }

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {"success": False, "error": str(e)}

def generate_voice(fal, text: str, **kwargs) -> Dict[str, Any]:
    """
    Generiert Voice/Audio mit ElevenLabs 2.5 Turbo

    Args:
        text: Text der gesprochen werden soll
        voice: Voice ID oder Name (default: "Rachel" - weiblich, amerikanisch)
        model_id: "eleven_turbo_v2_5" (default)
        stability: 0.0-1.0 (default: 0.5)
        similarity_boost: 0.0-1.0 (default: 0.75)
        style: 0.0-1.0 - Expressiveness (default: 0.0)
        use_speaker_boost: true/false (default: true)
    """

    # Default-Werte
    params = {
        "text": text,
        "voice": kwargs.get("voice", "Rachel"),
        "model_id": kwargs.get("model_id", "eleven_turbo_v2_5"),
    }

    # Voice Settings
    voice_settings = {
        "stability": float(kwargs.get("stability", 0.5)),
        "similarity_boost": float(kwargs.get("similarity_boost", 0.75)),
        "style": float(kwargs.get("style", 0.0)),
        "use_speaker_boost": kwargs.get("use_speaker_boost", "true").lower() == "true",
    }
    params["voice_settings"] = voice_settings

    print("🎙️  Generating voice with ElevenLabs 2.5 Turbo...")
    print(f"📝 Text: {text[:100]}{'...' if len(text) > 100 else ''}")
    print(f"⚙️  Voice: {params['voice']}, Model: {params['model_id']}")

    try:
        result = fal.subscribe(
            "fal-ai/elevenlabs/text-to-speech",
            arguments=params
        )

        print("✅ Voice generated!")

        # Download audio
        output_dir = Path("./fal-outputs/audio")
        audio_url = result['audio_file']['url']

        # Generate filename from text (first 30 chars, sanitized)
        safe_text = "".join(c for c in text[:30] if c.isalnum() or c in (' ', '-', '_')).strip()
        safe_text = safe_text.replace(' ', '_')
        filename = f"voice_{safe_text}.mp3"

        file_path = download_file(audio_url, output_dir, filename)

        file_size_kb = result['audio_file'].get('file_size', 0) / 1024
        print(f"📊 Size: {file_size_kb:.2f} KB")
        print(f"🔗 URL: {audio_url}")

        return {
            "success": True,
            "type": "voice",
            "file": str(file_path),
            "url": audio_url,
            "size_kb": file_size_kb,
            "params": params
        }

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return {"success": False, "error": str(e)}

def main():
    parser = argparse.ArgumentParser(description="Generate images, videos, or voice with fal.ai")
    parser.add_argument("type", choices=["image", "video", "voice"], help="Type of media to generate")
    parser.add_argument("prompt", help="Text description (for image/video) or text to speak (for voice)")

    # Image parameters
    parser.add_argument("--aspect_ratio", help="Aspect ratio (e.g., 16:9, 1:1)")
    parser.add_argument("--resolution", choices=["1K", "2K", "4K"], help="Image resolution")
    parser.add_argument("--num_images", type=int, help="Number of images (1-4)")
    parser.add_argument("--output_format", choices=["jpeg", "png", "webp"], help="Output format")
    parser.add_argument("--seed", type=int, help="Random seed for reproducibility")

    # Video parameters
    parser.add_argument("--duration", choices=["5", "10"], help="Video duration in seconds")
    parser.add_argument("--generate_audio", help="Generate audio (true/false)")
    parser.add_argument("--cfg_scale", type=float, help="Guidance scale (0.0-1.0)")
    parser.add_argument("--negative_prompt", help="Negative prompt for video")

    # Voice parameters
    parser.add_argument("--voice", help="Voice name or ID (e.g., Rachel, Adam, Bella)")
    parser.add_argument("--model_id", help="ElevenLabs model (default: eleven_turbo_v2_5)")
    parser.add_argument("--stability", type=float, help="Voice stability (0.0-1.0)")
    parser.add_argument("--similarity_boost", type=float, help="Voice similarity boost (0.0-1.0)")
    parser.add_argument("--style", type=float, help="Voice style/expressiveness (0.0-1.0)")
    parser.add_argument("--use_speaker_boost", help="Use speaker boost (true/false)")

    args = parser.parse_args()

    # Setup fal client
    fal = setup_fal_client()

    # Prepare kwargs
    kwargs = {k: v for k, v in vars(args).items() if v is not None and k not in ['type', 'prompt']}

    # Generate media
    if args.type == "image":
        result = generate_image(fal, args.prompt, **kwargs)
    elif args.type == "video":
        result = generate_video(fal, args.prompt, **kwargs)
    else:  # voice
        result = generate_voice(fal, args.prompt, **kwargs)

    # Print result summary
    print("\n" + "="*50)
    print("📊 SUMMARY")
    print("="*50)
    print(json.dumps(result, indent=2))

    return 0 if result.get("success") else 1

if __name__ == "__main__":
    sys.exit(main())
