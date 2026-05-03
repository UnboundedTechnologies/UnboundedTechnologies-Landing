.import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';

const IN_BANNER = resolve('public/ut-banner-transparent.png');

const OUT_LOGO_BLACK = resolve('public/ut-logo-black.png');
const OUT_ICON_SQUARE = resolve('public/ut-icon-square.png');

// Empirically measured from the banner's transparent column gaps:
// icon spans x = 0..425, gap from 426..491, wordmark from 492..1265.
const ICON_END_X = 426;
const WORDMARK_START_X = 492;

async function buildSquareLogo(inputPath, outputPath) {
  const meta = await sharp(inputPath).metadata();

  const iconBuf = await sharp(inputPath)
    .extract({ left: 0, top: 0, width: ICON_END_X, height: meta.height })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 0 })
    .toBuffer();
  const wordmarkBuf = await sharp(inputPath)
    .extract({
      left: WORDMARK_START_X,
      top: 0,
      width: meta.width - WORDMARK_START_X,
      height: meta.height,
    })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 0 })
    .toBuffer();

  const iconMeta = await sharp(iconBuf).metadata();
  const wordMeta = await sharp(wordmarkBuf).metadata();

  // Scale wordmark to match icon visual weight: target ~75% of icon width.
  const targetWordmarkWidth = Math.round(iconMeta.width * 0.75);
  const wordmarkScaled = await sharp(wordmarkBuf)
    .resize({ width: targetWordmarkWidth })
    .toBuffer();
  const wordScaledMeta = await sharp(wordmarkScaled).metadata();

  const gap = Math.round(iconMeta.height * 0.08);
  const padding = Math.round(iconMeta.height * 0.1);
  const innerWidth = Math.max(iconMeta.width, wordScaledMeta.width);
  const innerHeight = iconMeta.height + gap + wordScaledMeta.height;
  const canvas = Math.max(innerWidth, innerHeight) + padding * 2;

  const iconLeft = Math.round((canvas - iconMeta.width) / 2);
  const iconTop = Math.round((canvas - innerHeight) / 2);
  const wordLeft = Math.round((canvas - wordScaledMeta.width) / 2);
  const wordTop = iconTop + iconMeta.height + gap;

  await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: iconBuf, left: iconLeft, top: iconTop },
      { input: wordmarkScaled, left: wordLeft, top: wordTop },
    ])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}

async function extractIconSquare(inputPath, outputPath) {
  // Slice the icon-only region of the banner (no wordmark bleed-in possible
  // because we cut at the empirically-measured transparent gap), then trim
  // and pad into a centered square with breathing room.
  const meta = await sharp(inputPath).metadata();
  const cropped = await sharp(inputPath)
    .extract({ left: 0, top: 0, width: ICON_END_X, height: meta.height })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 0 })
    .toBuffer();

  const trimmedMeta = await sharp(cropped).metadata();
  const target = Math.max(trimmedMeta.width, trimmedMeta.height);
  // 12% breathing room so the icon doesn't touch the avatar circle edge.
  const canvas = Math.round(target * 1.12);
  const left = Math.round((canvas - trimmedMeta.width) / 2);
  const top = Math.round((canvas - trimmedMeta.height) / 2);

  await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: cropped, left, top }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}

async function report(label, path) {
  const meta = await sharp(path).metadata();
  const kb = Math.round(statSync(path).size / 1024);
  console.log(`${label}: ${path}`);
  console.log(`  ${meta.width}x${meta.height}  ${kb} KB`);
}

await buildSquareLogo(IN_BANNER, OUT_LOGO_BLACK);
await extractIconSquare(IN_BANNER, OUT_ICON_SQUARE);

await report('ut-logo-black', OUT_LOGO_BLACK);
await report('ut-icon-square', OUT_ICON_SQUARE);
