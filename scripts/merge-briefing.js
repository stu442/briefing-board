#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { upsertBriefing } = require('../app/db');

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node scripts/merge-briefing.js /absolute/path/to/patch.json');
  process.exit(1);
}

const canonicalDir = path.join(__dirname, '..', 'content', 'briefings');
fs.mkdirSync(canonicalDir, { recursive: true });

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge(base, patch) {
  if (Array.isArray(patch)) return patch;
  if (!isPlainObject(patch)) return patch;

  const result = { ...(isPlainObject(base) ? base : {}) };
  for (const [key, value] of Object.entries(patch)) {
    if (Array.isArray(value)) {
      result[key] = value;
    } else if (isPlainObject(value)) {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

const patchDoc = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const slug = patchDoc.slug || String(patchDoc.date || '').slice(0, 10);
if (!slug) {
  console.error('Patch must include slug or date.');
  process.exit(1);
}

const canonicalPath = path.join(canonicalDir, `${slug}.json`);
const existing = fs.existsSync(canonicalPath)
  ? JSON.parse(fs.readFileSync(canonicalPath, 'utf8'))
  : {};

const merged = deepMerge(existing, patchDoc);
if (!merged.slug) merged.slug = slug;
if (!merged.date && /^\d{4}-\d{2}-\d{2}$/.test(slug)) merged.date = slug;
if (!merged.title) merged.title = `${slug} 브리핑`;
if (!merged.summary) merged.summary = '브리핑이 업데이트되었습니다.';
if (!merged.tags) merged.tags = ['calendar', 'mail', 'news', 'market'];
if (!merged.createdAt) merged.createdAt = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
if (!merged.sections) merged.sections = {};

fs.writeFileSync(canonicalPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');

const htmlPath = `briefings/${slug}.html`;
upsertBriefing({
  briefingDate: String(merged.date).slice(0, 10),
  slug,
  title: merged.title,
  summary: merged.summary,
  htmlPath,
  tags: merged.tags || [],
  nowIso: new Date().toISOString(),
});

console.log(JSON.stringify({ ok: true, slug, canonicalPath, htmlPath }, null, 2));
