#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { upsertBriefing } = require('../app/db');

const inputPath = process.argv[2] || path.join(__dirname, '..', 'seeds', '2026-05-13.json');
const source = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const canonicalDir = path.join(__dirname, '..', 'content', 'briefings');
fs.mkdirSync(canonicalDir, { recursive: true });

const slug = source.slug || String(source.date).slice(0, 10);
const htmlPath = `briefings/${slug}.html`;
const canonicalPath = path.join(canonicalDir, `${slug}.json`);

fs.writeFileSync(canonicalPath, `${JSON.stringify(source, null, 2)}\n`, 'utf8');

upsertBriefing({
  briefingDate: String(source.date).slice(0, 10),
  slug,
  title: source.title,
  summary: source.summary,
  htmlPath,
  tags: source.tags || [],
  nowIso: new Date().toISOString(),
});

console.log(JSON.stringify({
  ok: true,
  source: inputPath,
  htmlPath,
  canonicalPath,
  slug,
}, null, 2));
