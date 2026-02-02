@echo off
echo ================================================
echo fal.ai Media Generator Skill - Installation
echo ================================================
echo.

echo [1/2] Installing Python dependencies...
pip install fal-client
if %errorlevel% neq 0 (
    echo ERROR: Failed to install fal-client
    exit /b 1
)

echo.
echo [2/2] Testing installation...
python scripts\generate.py --help
if %errorlevel% neq 0 (
    echo ERROR: Script test failed
    exit /b 1
)

echo.
echo ================================================
echo ✅ Installation successful!
echo ================================================
echo.
echo You can now use the skill by asking Claude:
echo   "Erstelle ein Bild von einem Sonnenuntergang"
echo   "Erstelle ein Video von einer Katze"
echo.
echo Or run directly:
echo   python scripts\generate.py image "your prompt"
echo   python scripts\generate.py video "your prompt"
echo.
pause
