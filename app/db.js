const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'briefings.db');

fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS briefings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    briefing_date TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT,
    html_path TEXT NOT NULL,
    tags_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_briefings_date
  ON briefings(briefing_date DESC);

  CREATE TABLE IF NOT EXISTS market_prices (
    symbol TEXT NOT NULL,
    display_name TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    market_date TEXT NOT NULL,
    close_price REAL NOT NULL,
    currency TEXT NOT NULL,
    change_pct REAL,
    rsi14 REAL,
    rsi_state TEXT,
    ma20 REAL,
    ma60 REAL,
    ma120 REAL,
    recorded_at TEXT NOT NULL,
    PRIMARY KEY(symbol, market_date)
  );

  CREATE INDEX IF NOT EXISTS idx_market_prices_symbol_date
  ON market_prices(symbol, market_date DESC);
`);

function listBriefings(limit = 30) {
  const stmt = db.prepare(`
    SELECT id, briefing_date, slug, title, summary, html_path, tags_json, created_at, updated_at
    FROM briefings
    ORDER BY briefing_date DESC, id DESC
    LIMIT ?
  `);

  return stmt.all(limit).map((row) => ({
    ...row,
    tags: JSON.parse(row.tags_json || '[]'),
  }));
}

function getBriefingBySlug(slug) {
  const stmt = db.prepare(`
    SELECT id, briefing_date, slug, title, summary, html_path, tags_json, created_at, updated_at
    FROM briefings
    WHERE slug = ?
  `);

  const row = stmt.get(slug);
  if (!row) return null;

  return {
    ...row,
    tags: JSON.parse(row.tags_json || '[]'),
  };
}

function upsertBriefing({ briefingDate, slug, title, summary, htmlPath, tags = [], nowIso }) {
  const stmt = db.prepare(`
    INSERT INTO briefings (briefing_date, slug, title, summary, html_path, tags_json, created_at, updated_at)
    VALUES (@briefingDate, @slug, @title, @summary, @htmlPath, @tagsJson, @nowIso, @nowIso)
    ON CONFLICT(slug) DO UPDATE SET
      briefing_date = excluded.briefing_date,
      title = excluded.title,
      summary = excluded.summary,
      html_path = excluded.html_path,
      tags_json = excluded.tags_json,
      updated_at = excluded.updated_at
  `);

  stmt.run({
    briefingDate,
    slug,
    title,
    summary,
    htmlPath,
    tagsJson: JSON.stringify(tags),
    nowIso,
  });
}

function upsertMarketPrices(rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) return { inserted: 0 };

  const stmt = db.prepare(`
    INSERT INTO market_prices (
      symbol,
      display_name,
      asset_type,
      market_date,
      close_price,
      currency,
      change_pct,
      rsi14,
      rsi_state,
      ma20,
      ma60,
      ma120,
      recorded_at
    ) VALUES (
      @symbol,
      @displayName,
      @assetType,
      @marketDate,
      @closePrice,
      @currency,
      @changePct,
      @rsi14,
      @rsiState,
      @ma20,
      @ma60,
      @ma120,
      @recordedAt
    )
    ON CONFLICT(symbol, market_date) DO UPDATE SET
      display_name = excluded.display_name,
      asset_type = excluded.asset_type,
      close_price = excluded.close_price,
      currency = excluded.currency,
      change_pct = excluded.change_pct,
      rsi14 = excluded.rsi14,
      rsi_state = excluded.rsi_state,
      ma20 = excluded.ma20,
      ma60 = excluded.ma60,
      ma120 = excluded.ma120,
      recorded_at = excluded.recorded_at
  `);

  const transaction = db.transaction((inputRows) => {
    for (const row of inputRows) stmt.run(row);
  });

  transaction(rows);
  return { inserted: rows.length };
}

module.exports = {
  dbPath,
  listBriefings,
  getBriefingBySlug,
  upsertBriefing,
  upsertMarketPrices,
};
