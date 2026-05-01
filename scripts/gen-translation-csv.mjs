#!/usr/bin/env node
/*
 * Walks messages/en.json and messages/fr.json side-by-side and writes a
 * CSV (key,en,fr,status) to docs/translation-en-fr.csv. The owner uses
 * this for native-speaker review: review the FR column, mark "ok" in
 * status, edit if needed, then re-import (manual paste back into
 * messages/fr.json keeps the JSON authoritative; this CSV is a working
 * doc, gitignored).
 *
 * Run:  node scripts/gen-translation-csv.mjs
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const EN_PATH = resolve(ROOT, 'messages/en.json');
const FR_PATH = resolve(ROOT, 'messages/fr.json');
const OUT_PATH = resolve(ROOT, 'docs/translation-en-fr.csv');

// Flatten a nested object into dotted keys -> string values. Skip
// non-string leaves so we don't trip over numbers / arrays.
function flatten(obj, prefix = '', acc = new Map()) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      flatten(v, key, acc);
    } else if (typeof v === 'string') {
      acc.set(key, v);
    }
  }
  return acc;
}

// CSV-escape: wrap in quotes, double internal quotes.
function csvEsc(s) {
  if (s == null) return '';
  return `"${String(s).replace(/"/g, '""')}"`;
}

async function main() {
  const [enRaw, frRaw] = await Promise.all([
    readFile(EN_PATH, 'utf8'),
    readFile(FR_PATH, 'utf8'),
  ]);
  const en = flatten(JSON.parse(enRaw));
  const fr = flatten(JSON.parse(frRaw));

  // Union of keys, sorted for stable diffs across runs.
  const keys = [...new Set([...en.keys(), ...fr.keys()])].sort();

  const rows = ['key,en,fr,status'];
  let missing = 0;
  for (const k of keys) {
    const enVal = en.get(k) ?? '';
    const frVal = fr.get(k) ?? '';
    const status = !frVal ? 'MISSING' : enVal === frVal ? 'identical' : 'translated';
    if (!frVal) missing++;
    rows.push([csvEsc(k), csvEsc(enVal), csvEsc(frVal), csvEsc(status)].join(','));
  }

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, `${rows.join('\n')}\n`, 'utf8');

  console.log(`Wrote ${OUT_PATH}`);
  console.log(`  ${keys.length} keys total`);
  console.log(`  ${missing} missing FR translations`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
