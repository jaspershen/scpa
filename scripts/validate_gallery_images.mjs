#!/usr/bin/env node

import { createRequire } from 'node:module';
import { access, readFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const scriptDir = dirname(new URL(import.meta.url).pathname);
const projectRoot = resolve(scriptDir, '..');
const manifest = JSON.parse(await readFile(join(projectRoot, 'public/assets/data/gallery.json'), 'utf8'));
const errors = [];
const seenSources = new Set();

if (manifest.count !== 51 || manifest.items.length !== 51) {
  errors.push(`expected 51 items, found count=${manifest.count}, items=${manifest.items.length}`);
}

for (const item of manifest.items) {
  const path = join(projectRoot, 'public', item.src);
  try {
    await access(path);
  } catch {
    errors.push(`missing ${item.src}`);
    continue;
  }

  if (seenSources.has(item.src)) errors.push(`duplicate source ${item.src}`);
  seenSources.add(item.src);

  const metadata = await sharp(path).metadata();
  const stats = await stat(path);
  if (metadata.format !== 'webp') errors.push(`${item.src} is ${metadata.format}, not webp`);
  if (metadata.width !== item.width || metadata.height !== item.height) errors.push(`${item.src} dimensions do not match manifest`);
  if (Math.max(metadata.width || 0, metadata.height || 0) > 1600) errors.push(`${item.src} exceeds 1600px`);
  if (stats.size !== item.output_bytes) errors.push(`${item.src} byte size does not match manifest`);
  if (metadata.exif || metadata.icc || metadata.xmp || metadata.iptc) errors.push(`${item.src} retains metadata`);
  for (const field of ['alt_en', 'alt_zh', 'caption_en', 'caption_zh', 'event_en', 'event_zh']) {
    if (!item[field] || typeof item[field] !== 'string') errors.push(`${item.src} is missing ${field}`);
  }
}

const result = {
  valid: errors.length === 0,
  count: manifest.items.length,
  source_bytes: manifest.source_bytes,
  output_bytes: manifest.output_bytes,
  reduction_percent: Number((100 - (manifest.output_bytes / manifest.source_bytes) * 100).toFixed(1)),
  errors
};

console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(1);
