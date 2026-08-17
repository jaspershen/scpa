#!/usr/bin/env node

import { createRequire } from 'node:module';
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const scriptDir = dirname(new URL(import.meta.url).pathname);
const projectRoot = resolve(scriptDir, '..');
const sourceRootArgument = process.argv[2];
if (!sourceRootArgument) {
  throw new Error('Usage: npm run build -- /absolute/path/to/SCPA_Gallery_Originals_20260817');
}
const sourceRoot = resolve(sourceRootArgument);
const sourceManifestPath = join(scriptDir, 'gallery_drive_source.json');
const publicMediaRoot = join(projectRoot, 'public/assets/media/events/gallery/drive');
const publicManifestPath = join(projectRoot, 'public/assets/data/gallery.json');

const GROUPS = {
  root: {
    slug: 'community',
    order: 0,
    titleEn: 'SCPA Community Moments',
    titleZh: 'SCPA 社区活动瞬间',
    altEn: 'SCPA community gathering',
    altZh: 'SCPA 社区活动现场'
  },
  '2025.11 K99': {
    slug: 'k99-2025-11',
    order: 1,
    titleEn: 'K99 Research Sharing · November 2025',
    titleZh: 'K99 科研分享 · 2025年11月',
    altEn: 'SCPA K99 research sharing event',
    altZh: 'SCPA K99 科研分享活动'
  },
  '2025.9 中秋': {
    slug: 'mid-autumn-2025-09',
    order: 2,
    titleEn: 'Mid-Autumn Gathering · September 2025',
    titleZh: '中秋团聚 · 2025年9月',
    altEn: 'SCPA Mid-Autumn community gathering',
    altZh: 'SCPA 中秋社区活动'
  }
};

const MANUAL_ROTATIONS = {
  '2025.9 中秋/IMG_0017.JPG': 0
};

function descriptionFor(file, groupCount) {
  const numberMatch = file.title.match(/IMG_(\d+)/i);
  const number = numberMatch ? Number(numberMatch[1]) : null;

  if (file.folder === 'root') {
    if (number === 323) return { captionEn: 'Community Game Night · Card Table', captionZh: '社区桌游夜 · 卡牌游戏', altEn: 'Participants playing a card game together at SCPA game night', altZh: '参与者在 SCPA 桌游夜一起玩卡牌游戏' };
    if (number >= 324 && number <= 327) return { captionEn: 'Community Game Night · Around the Table', captionZh: '社区桌游夜 · 围桌互动', altEn: 'SCPA community members playing tabletop games around a table', altZh: 'SCPA 社区成员围桌参加桌游活动' };
    if (number >= 328 && number <= 330) return { captionEn: 'Community Game Night · Full House', captionZh: '社区桌游夜 · 欢乐满场', altEn: 'A full room of SCPA participants enjoying community game night', altZh: '众多 SCPA 参与者共同参加社区桌游夜' };
    if (number === 3273 || number === 3274) return { captionEn: 'Lunar New Year · Volunteer Preparation', captionZh: '春节活动 · 志愿者筹备', altEn: 'SCPA volunteers preparing gifts and supplies for a Lunar New Year event', altZh: 'SCPA 志愿者为春节活动整理礼物和物资' };
    if (number === 3670) return { captionEn: 'Community Dinner · Grilled Specialties', captionZh: '社区聚餐 · 烧烤美食', altEn: 'Freshly grilled skewers served at an SCPA community dinner', altZh: 'SCPA 社区聚餐现场供应的烧烤美食' };
    if (number === 3696) return { captionEn: 'Community Dinner · Group Photo', captionZh: '社区聚餐 · 欢乐合影', altEn: 'SCPA community members taking a group photo at dinner', altZh: 'SCPA 社区成员在聚餐活动中合影' };
    if (number >= 6801 && number <= 6806) return { captionEn: 'Technology Talk · Research Exchange', captionZh: '科技分享 · 研究交流', altEn: 'A speaker and audience exchanging ideas during an SCPA technology talk', altZh: '讲者与听众在 SCPA 科技分享活动中交流' };
    if (number === 6922) return { captionEn: 'Community Fair · Outdoor Gathering', captionZh: '社区活动 · 户外相聚', altEn: 'SCPA participants gathering under the trees at an outdoor community fair', altZh: 'SCPA 参与者在树荫下参加户外社区活动' };
    if (number === 6925 || number === 6926) return { captionEn: 'Community Fair · Booth Visits', captionZh: '社区活动 · 摊位交流', altEn: 'Participants visiting activity booths at an SCPA community fair', altZh: '参与者在 SCPA 社区活动中参观互动摊位' };
    if (number >= 6930 && number <= 6936) return { captionEn: 'Outdoor Recreation · Badminton', captionZh: '户外活动 · 羽毛球互动', altEn: 'SCPA participants playing badminton during an outdoor gathering', altZh: 'SCPA 参与者在户外活动中打羽毛球' };
    if (number >= 6937 && number <= 6941) return { captionEn: 'Outdoor Recreation · Group Celebration', captionZh: '户外活动 · 欢乐合影', altEn: 'SCPA participants celebrating together after outdoor games', altZh: 'SCPA 参与者在户外游戏后共同庆祝合影' };
    if (number === 6942 || number === 6943) return { captionEn: 'Outdoor Recreation · Community Moments', captionZh: '户外活动 · 社区瞬间', altEn: 'SCPA community members sharing a lighthearted moment outdoors', altZh: 'SCPA 社区成员在户外分享轻松欢乐的时刻' };
  }

  if (file.folder === '2025.11 K99') {
    if (!number) return { captionEn: 'K99 Career Development · Sharing Session', captionZh: 'K99 职业发展 · 分享会现场', altEn: 'Audience attending an SCPA K99 career development sharing session', altZh: '听众参加 SCPA K99 职业发展分享会' };
    if (number >= 708 && number <= 714) return { captionEn: 'K99 Research Sharing · Guest Presentation', captionZh: 'K99 科研分享 · 嘉宾报告', altEn: 'A guest speaker presenting research during the SCPA K99 sharing session', altZh: '嘉宾在 SCPA K99 分享会上进行科研报告' };
    if (number === 715 || number === 716) return { captionEn: 'K99 Research Sharing · Career Pathways', captionZh: 'K99 科研分享 · 职业路径', altEn: 'A speaker discussing research and career pathways at the SCPA K99 event', altZh: '讲者在 SCPA K99 活动中分享科研与职业路径' };
  }

  if (file.folder === '2025.9 中秋') {
    if (number === 17) return { captionEn: 'Mid-Autumn Festival · Courtyard Gathering', captionZh: '中秋活动 · 庭院相聚', altEn: 'SCPA families and community members gathering in a decorated courtyard', altZh: 'SCPA 家庭与社区成员在节日装饰的庭院中相聚' };
    if (number === 18) return { captionEn: 'Mid-Autumn Festival · Community Celebration', captionZh: '中秋活动 · 社区欢聚', altEn: 'SCPA community members enjoying the Mid-Autumn celebration outdoors', altZh: 'SCPA 社区成员在户外参加中秋庆祝活动' };
    if (number === 21) return { captionEn: 'Mid-Autumn Festival · Welcome Booth', captionZh: '中秋活动 · 欢迎摊位', altEn: 'Volunteers welcoming guests at an SCPA Mid-Autumn activity booth', altZh: '志愿者在 SCPA 中秋活动摊位欢迎来宾' };
    if (number === 34) return { captionEn: 'Mid-Autumn Festival · Courtyard Activities', captionZh: '中秋活动 · 庭院互动', altEn: 'Families taking part in courtyard activities at the SCPA Mid-Autumn festival', altZh: '家庭参与 SCPA 中秋活动的庭院互动项目' };
    if (number === 36) return { captionEn: 'Mid-Autumn Festival · Refreshment Booth', captionZh: '中秋活动 · 美食摊位', altEn: 'A volunteer serving refreshments at the SCPA Mid-Autumn festival', altZh: '志愿者在 SCPA 中秋活动中供应饮品和点心' };
    if (number === 46) return { captionEn: 'Mid-Autumn Festival · Group Game', captionZh: '中秋活动 · 团体游戏', altEn: 'Participants playing a group game at the SCPA Mid-Autumn celebration', altZh: '参与者在 SCPA 中秋活动中参加团体游戏' };
    if (number === 50) return { captionEn: 'Mid-Autumn Festival · Badminton', captionZh: '中秋活动 · 羽毛球互动', altEn: 'Participants playing badminton at the SCPA Mid-Autumn festival', altZh: '参与者在 SCPA 中秋活动中打羽毛球' };
    if (number === 58) return { captionEn: 'Mid-Autumn Festival · Winners', captionZh: '中秋活动 · 获奖合影', altEn: 'Prize winners celebrating together at the SCPA Mid-Autumn festival', altZh: '获奖者在 SCPA 中秋活动中共同庆祝合影' };
  }

  const group = GROUPS[file.folder];
  return {
    captionEn: `${group.titleEn} · Photo ${groupCount}`,
    captionZh: `${group.titleZh} · 照片 ${groupCount}`,
    altEn: `${group.altEn}, photo ${groupCount}`,
    altZh: `${group.altZh}，照片 ${groupCount}`
  };
}

function run(command, args) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', rejectPromise);
    child.on('close', code => {
      if (code === 0) resolvePromise({ stdout, stderr });
      else rejectPromise(new Error(`${command} exited ${code}: ${stderr || stdout}`));
    });
  });
}

function outputName(index, title) {
  const stem = basename(title, extname(title))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'photo';
  return `${String(index + 1).padStart(2, '0')}-${stem}.webp`;
}

async function prepareReadableSource(sourcePath, mimeType, tempDirectory) {
  if (mimeType !== 'image/heif') return sourcePath;
  const pngPath = join(tempDirectory, `${basename(sourcePath, extname(sourcePath))}.png`);
  await run('heif-convert', ['--quiet', sourcePath, pngPath]);
  return pngPath;
}

const sourceManifest = JSON.parse(await readFile(sourceManifestPath, 'utf8'));
const orderedFiles = [...sourceManifest.files].sort((left, right) => {
  const groupDifference = GROUPS[left.folder].order - GROUPS[right.folder].order;
  if (groupDifference) return groupDifference;
  return left.title.localeCompare(right.title, 'en', { numeric: true, sensitivity: 'base' });
});
const groupTotals = orderedFiles.reduce((totals, file) => {
  totals.set(file.folder, (totals.get(file.folder) || 0) + 1);
  return totals;
}, new Map());

await mkdir(publicMediaRoot, { recursive: true });
await mkdir(dirname(publicManifestPath), { recursive: true });

const tempDirectory = await mkdtemp(join(tmpdir(), 'scpa-gallery-'));
const groupCounters = new Map();
const generated = [];

try {
  for (let index = 0; index < orderedFiles.length; index += 1) {
    const file = orderedFiles[index];
    const group = GROUPS[file.folder];
    const groupCount = (groupCounters.get(file.folder) || 0) + 1;
    groupCounters.set(file.folder, groupCount);

    const sourcePath = join(sourceRoot, file.folder.replaceAll('/', '_'), `${file.id}__${file.title}`);
    const destinationDirectory = join(publicMediaRoot, group.slug);
    const destinationName = outputName(groupCount - 1, file.title);
    const destinationPath = join(destinationDirectory, destinationName);
    const readableSource = await prepareReadableSource(sourcePath, file.mime_type, tempDirectory);
    const description = descriptionFor(file, groupCount);
    const groupTotal = groupTotals.get(file.folder);
    const manualRotation = MANUAL_ROTATIONS[`${file.folder}/${file.title}`];

    await mkdir(destinationDirectory, { recursive: true });
    const image = sharp(readableSource, { failOn: 'error' });
    if (manualRotation !== undefined) image.rotate(manualRotation);
    else image.rotate();
    await image
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .toColourspace('srgb')
      .webp({ quality: 76, effort: 5, smartSubsample: true })
      .toFile(destinationPath);

    const metadata = await sharp(destinationPath).metadata();
    const outputStats = await stat(destinationPath);
    generated.push({
      src: `assets/media/events/gallery/drive/${group.slug}/${destinationName}`,
      width: metadata.width,
      height: metadata.height,
      alt_en: `${description.altEn}; photo ${groupCount} of ${groupTotal}`,
      alt_zh: `${description.altZh}；第 ${groupCount} / ${groupTotal} 张`,
      caption_en: description.captionEn,
      caption_zh: description.captionZh,
      event: group.slug,
      event_en: group.titleEn,
      event_zh: group.titleZh,
      source_title: file.title,
      source_folder: file.folder,
      source_bytes: file.size,
      output_bytes: outputStats.size
    });
    process.stdout.write(`built ${index + 1}/${orderedFiles.length} ${destinationName}\n`);
  }
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}

const outputManifest = {
  generated_at: '2026-08-17',
  source_folder: sourceManifest.source_folder,
  count: generated.length,
  source_bytes: generated.reduce((sum, item) => sum + item.source_bytes, 0),
  output_bytes: generated.reduce((sum, item) => sum + item.output_bytes, 0),
  items: generated
};

await writeFile(publicManifestPath, `${JSON.stringify(outputManifest, null, 2)}\n`);
process.stdout.write(`Wrote ${generated.length} images and ${publicManifestPath}\n`);
