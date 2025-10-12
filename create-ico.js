/**
 * Simple ICO Generator
 * Converts PNG to ICO format for maximum browser compatibility
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PNG_SOURCE = path.join(__dirname, 'public', 'favicon-32x32.png');
const ICO_OUTPUT = path.join(__dirname, 'public', 'favicon.ico');

async function createIco() {
  console.log('🎨 Creating favicon.ico...\n');

  try {
    // Read the 32x32 PNG
    const pngBuffer = fs.readFileSync(PNG_SOURCE);

    // For simplicity, we'll just copy the PNG as ICO
    // Modern browsers support PNG in ICO containers
    // A proper ICO would include multiple sizes, but this works for most cases

    // Create a simple ICO header + PNG data
    const iconDir = Buffer.alloc(6);
    iconDir.writeUInt16LE(0, 0); // Reserved
    iconDir.writeUInt16LE(1, 2); // Type: 1 = ICO
    iconDir.writeUInt16LE(1, 4); // Number of images

    const iconDirEntry = Buffer.alloc(16);
    iconDirEntry.writeUInt8(32, 0);  // Width (32px)
    iconDirEntry.writeUInt8(32, 1);  // Height (32px)
    iconDirEntry.writeUInt8(0, 2);   // Color palette (0 = no palette)
    iconDirEntry.writeUInt8(0, 3);   // Reserved
    iconDirEntry.writeUInt16LE(1, 4); // Color planes
    iconDirEntry.writeUInt16LE(32, 6); // Bits per pixel
    iconDirEntry.writeUInt32LE(pngBuffer.length, 8); // Image data size
    iconDirEntry.writeUInt32LE(22, 12); // Image data offset (6 + 16)

    const icoBuffer = Buffer.concat([iconDir, iconDirEntry, pngBuffer]);
    fs.writeFileSync(ICO_OUTPUT, icoBuffer);

    console.log('✅ Created: favicon.ico');
    console.log(`   Size: ${icoBuffer.length} bytes`);
    console.log(`   Location: ${ICO_OUTPUT}\n`);
    console.log('✨ ICO creation complete!\n');
  } catch (error) {
    console.error('❌ Error creating ICO:', error.message);
    process.exit(1);
  }
}

createIco();
