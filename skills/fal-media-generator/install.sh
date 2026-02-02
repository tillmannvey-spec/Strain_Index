#!/bin/bash

echo "================================================"
echo "fal.ai Media Generator Skill - Installation"
echo "================================================"
echo ""

echo "[1/2] Installing Python dependencies..."
pip install fal-client
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install fal-client"
    exit 1
fi

echo ""
echo "[2/2] Making script executable..."
chmod +x scripts/generate.py

echo ""
echo "[3/3] Testing installation..."
python3 scripts/generate.py --help
if [ $? -ne 0 ]; then
    echo "ERROR: Script test failed"
    exit 1
fi

echo ""
echo "================================================"
echo "✅ Installation successful!"
echo "================================================"
echo ""
echo "You can now use the skill by asking Claude:"
echo '  "Erstelle ein Bild von einem Sonnenuntergang"'
echo '  "Erstelle ein Video von einer Katze"'
echo ""
echo "Or run directly:"
echo '  python3 scripts/generate.py image "your prompt"'
echo '  python3 scripts/generate.py video "your prompt"'
echo ""
