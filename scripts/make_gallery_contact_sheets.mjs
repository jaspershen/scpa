#!/usr/bin/env node

import { createRequire } from 'node:module';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const scriptDir = dirname(new URL(import.meta.url).pathname);
const projectRoot = resolve(scriptDir, '..');
const manifest = JSON.parse(await readFile(join(projectRoot, 'public/assets/data/gallery.json'), 'utf8'));
const outputDir = process.argv[2] || join(projectRoot, '.gallery-qa');
const columns = 4;
const rows = 3;
const cellWidth = 340;
const cellHeight = 290;
const imageWidth = 320;
const imageHeight = 240;
const pageSize = columns * rows;

await mkdir(outputDir, { recursive: true });

for (let page = 0; page < Math.ceil(manifest.items.length / pageSize); page += 1) {
  const items = manifest.items.slice(page * pageSize, (page + 1) * pageSize);
  const composites = [];

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const x = 10 + (index % columns) * cellWidth;
    const y = 10 + Math.floor(index / columns) * cellHeight;
    const image = await sharp(join(projectRoot, 'public', item.src))
      .resize(imageWidth, imageHeight, { fit: 'cover' })
      .toBuffer();
    const label = Buffer.from(`<svg width="${imageWidth}" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#fafaf8"/><text x="4" y="16" font-family="Arial, sans-serif" font-size="12" fill="#2e2d29">${item.source_title}</text><text x="4" y="32" font-family="Arial, sans-serif" font-size="10" fill="#666">${item.event} · ${page * pageSize + index + 1}</text></svg>`);
    composites.push({ input: image, left: x, top: y });
    composites.push({ input: label, left: x, top: y + imageHeight });
  }

  const output = join(outputDir, `gallery-contact-${String(page + 1).padStart(2, '0')}.jpg`);
  await sharp({ create: { width: columns * cellWidth + 10, height: rows * cellHeight + 10, channels: 3, background: '#f5f2ea' } })
    .composite(composites)
    .jpeg({ quality: 88 })
    .toFile(output);
  process.stdout.write(`${output}\n`);
}
