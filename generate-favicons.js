/**
 * Favicon Generator Script
 *
 * This script generates multiple favicon sizes from the source SVG.
 * Requires: sharp package (npm install sharp --save-dev)
 *
 * Usage: node generate-favicons.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SVG_SOURCE = path.join(__dirname, 'public', 'favicon.svg');
const OUTPUT_DIR = path.join(__dirname, 'public');

// Favicon sizes to generate
const SIZES = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
];

async function generateFavicons() {
  console.log('🏥 HospitalGuard Favicon Generator\n');

  // Check if source SVG exists
  if (!fs.existsSync(SVG_SOURCE)) {
    console.error(`❌ Error: Source SVG not found at ${SVG_SOURCE}`);
    process.exit(1);
  }

  console.log(`📁 Source: ${SVG_SOURCE}`);
  console.log(`📁 Output: ${OUTPUT_DIR}\n`);

  // Read SVG file
  const svgBuffer = fs.readFileSync(SVG_SOURCE);

  // Generate PNG files
  for (const { name, size } of SIZES) {
    const outputPath = path.join(OUTPUT_DIR, name);

    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated: ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message);
    }
  }

  // Generate ICO file (requires ico-convert or manual creation)
  console.log('\n📝 Note: favicon.ico should be created manually or with ico-convert');
  console.log('   You can use: npm install -g ico-endec');
  console.log('   Then run: ico-endec encode -i favicon-32x32.png -o favicon.ico\n');

  console.log('✨ Favicon generation complete!\n');
}

generateFavicons().catch(error => {
  console.error('❌ Error generating favicons:', error);
  process.exit(1);
});
