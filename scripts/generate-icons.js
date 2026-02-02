/**
 * Icon Generator Script
 * 
 * Dieses Skript generiert PNG-Icons aus der SVG-Vorlage.
 * Es verwendet die Canvas API über node-canvas.
 * 
 * Installation: npm install canvas
 * Ausführung: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Create output directory
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG content for icon
const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#166534;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#052e16;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#grad)" rx="100" ry="100"/>
  <text x="256" y="340" font-family="Arial, sans-serif" font-size="260" text-anchor="middle" fill="#4ade80">🌿</text>
</svg>`;

// Alternative: Create simple HTML file that generates icons via Canvas API
// This can be opened in a browser to generate the PNG files

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generate Icons</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background: #1a1a1a;
            color: #fff;
        }
        h1 { color: #4ade80; }
        .icon-container {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin: 20px 0;
        }
        .icon-item {
            text-align: center;
            background: #2a2a2a;
            padding: 15px;
            border-radius: 10px;
        }
        canvas {
            background: #000;
            border-radius: 20px;
        }
        button {
            background: #4ade80;
            color: #000;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            margin-top: 10px;
        }
        button:hover {
            background: #22c55e;
        }
        .instructions {
            background: #2a2a2a;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        code {
            background: #1a1a1a;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <h1>🌿 Strain Index - Icon Generator</h1>
    
    <div class="instructions">
        <h3>Instructions:</h3>
        <ol>
            <li>Klicke auf jeden "Download PNG" Button unten</li>
            <li>Speichere die Dateien im Ordner <code>public/icons/</code></li>
            <li>Benenne sie entsprechend der Größe (z.B. <code>icon-192x192.png</code>)</li>
        </ol>
    </div>

    <div class="icon-container" id="icons"></div>

    <script>
        const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
        const container = document.getElementById('icons');

        function createIcon(size, isApple = false) {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, size, size);
            gradient.addColorStop(0, '#166534');
            gradient.addColorStop(1, '#052e16');
            
            // Rounded rect
            const radius = size * 0.2;
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(0, 0, size, size, radius);
            ctx.fill();

            // Emoji
            ctx.font = \`\${size * 0.5}px Arial\`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🌿', size / 2, size / 2 + size * 0.05);

            return canvas;
        }

        sizes.forEach(size => {
            const item = document.createElement('div');
            item.className = 'icon-item';
            
            const canvas = createIcon(size);
            
            const label = document.createElement('p');
            label.textContent = \`\${size}x\${size}px\`;
            
            const button = document.createElement('button');
            button.textContent = 'Download PNG';
            button.onclick = () => {
                const link = document.createElement('a');
                link.download = \`icon-\${size}x\${size}.png\`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            };
            
            item.appendChild(canvas);
            item.appendChild(label);
            item.appendChild(button);
            container.appendChild(item);
        });

        // Apple Touch Icon (180x180)
        const appleItem = document.createElement('div');
        appleItem.className = 'icon-item';
        
        const appleCanvas = createIcon(180);
        
        const appleLabel = document.createElement('p');
        appleLabel.textContent = 'apple-touch-icon.png (180x180)';
        
        const appleButton = document.createElement('button');
        appleButton.textContent = 'Download PNG';
        appleButton.onclick = () => {
            const link = document.createElement('a');
            link.download = 'apple-touch-icon.png';
            link.href = appleCanvas.toDataURL('image/png');
            link.click();
        };
        
        appleItem.appendChild(appleCanvas);
        appleItem.appendChild(appleLabel);
        appleItem.appendChild(appleButton);
        container.appendChild(appleItem);
    </script>
</body>
</html>`;

// Write HTML file
const htmlPath = path.join(__dirname, 'generate-icons.html');
fs.writeFileSync(htmlPath, htmlContent);

console.log('✅ Icon Generator HTML created!');
console.log('');
console.log('📋 Next steps:');
console.log('   1. Open scripts/generate-icons.html in a browser');
console.log('   2. Click "Download PNG" for each icon size');
console.log('   3. Save files to public/icons/ directory');
console.log('');
console.log('🎯 Required files:');
console.log('   - icon-72x72.png');
console.log('   - icon-96x96.png');
console.log('   - icon-128x128.png');
console.log('   - icon-144x144.png');
console.log('   - icon-152x152.png');
console.log('   - icon-192x192.png');
console.log('   - icon-384x384.png');
console.log('   - icon-512x512.png');
console.log('   - apple-touch-icon.png (180x180)');