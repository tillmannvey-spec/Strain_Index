/**
 * Create PNG Icons from SVG using sharp
 * 
 * Usage: node scripts/create-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ sharp is not installed. Please run: npm install sharp --save-dev');
  process.exit(1);
}

const svgBuffer = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#166534;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#052e16;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#grad)" rx="100" ry="100"/>
  <text x="256" y="340" font-family="Arial, sans-serif" font-size="260" text-anchor="middle" fill="#4ade80">🌿</text>
</svg>`);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

async function createIcons() {
  // Ensure directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log('🎨 Generating icons...\n');

  // Generate standard icons
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(svgBuffer)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Created: icon-${size}x${size}.png`);
    } catch (err) {
      console.error(`❌ Failed to create icon-${size}x${size}.png:`, err.message);
    }
  }

  // Generate Apple Touch Icon (180x180)
  try {
    const appleIconPath = path.join(iconsDir, 'apple-touch-icon.png');
    await sharp(svgBuffer)
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(appleIconPath);
    console.log(`✅ Created: apple-touch-icon.png (180x180)`);
  } catch (err) {
    console.error(`❌ Failed to create apple-touch-icon.png:`, err.message);
  }

  console.log('\n🎉 All icons generated successfully!');
  console.log(`📁 Location: ${iconsDir}\n`);
}

createIcons().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});