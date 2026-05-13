import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

export type BriefingRow = {
  id: number;
  briefing_date: string;
  slug: string;
  title: string;
  summary: string;
  html_path: string;
  tags_json: string;
  created_at: string;
  updated_at: string;
};

export type BriefingMeta = Omit<BriefingRow, 'tags_json'> & {
  tags: string[];
};

export type MarketPriceRow = {
  symbol: string;
  display_name: string;
  asset_type: string;
  market_date: string;
  close_price: number;
  currency: string;
  change_pct: number | null;
  rsi14: number | null;
  rsi_state: string | null;
  ma20: number | null;
  ma60: number | null;
  ma120: number | null;
  recorded_at: string;
};

const dataDir = path.join(process.cwd(), 'data');
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

function hydrate(row: BriefingRow): BriefingMeta {
  return {
    ...row,
    tags: JSON.parse(row.tags_json || '[]'),
  };
}

export function listBriefings(limit = 60): BriefingMeta[] {
  const stmt = db.prepare(`
    SELECT id, briefing_date, slug, title, summary, html_path, tags_json, created_at, updated_at
    FROM briefings
    ORDER BY briefing_date DESC, id DESC
    LIMIT ?
  `);

  return stmt.all(limit).map((row) => hydrate(row as BriefingRow));
}

export function getBriefingMetaBySlug(slug: string): BriefingMeta | null {
  const stmt = db.prepare(`
    SELECT id, briefing_date, slug, title, summary, html_path, tags_json, created_at, updated_at
    FROM briefings
    WHERE slug = ?
  `);
  const row = stmt.get(slug) as BriefingRow | undefined;
  return row ? hydrate(row) : null;
}

export function getAdjacentBriefings(slug: string): { previous: BriefingMeta | null; next: BriefingMeta | null } {
  const current = getBriefingMetaBySlug(slug);
  if (!current) return { previous: null, next: null };

  const previousStmt = db.prepare(`
    SELECT id, briefing_date, slug, title, summary, html_path, tags_json, created_at, updated_at
    FROM briefings
    WHERE briefing_date > ?
    ORDER BY briefing_date ASC
    LIMIT 1
  `);
  const nextStmt = db.prepare(`
    SELECT id, briefing_date, slug, title, summary, html_path, tags_json, created_at, updated_at
    FROM briefings
    WHERE briefing_date < ?
    ORDER BY briefing_date DESC
    LIMIT 1
  `);

  const previousRow = previousStmt.get(current.briefing_date) as BriefingRow | undefined;
  const nextRow = nextStmt.get(current.briefing_date) as BriefingRow | undefined;

  return {
    previous: previousRow ? hydrate(previousRow) : null,
    next: nextRow ? hydrate(nextRow) : null,
  };
}

export function getMarketHistory(symbol: string, limit = 30): MarketPriceRow[] {
  const stmt = db.prepare(`
    SELECT symbol, display_name, asset_type, market_date, close_price, currency, change_pct, rsi14, rsi_state, ma20, ma60, ma120, recorded_at
    FROM market_prices
    WHERE symbol = ?
    ORDER BY market_date DESC
    LIMIT ?
  `);

  return (stmt.all(symbol, limit) as MarketPriceRow[]).reverse();
}

export function getLatestMarketPrice(symbol: string): MarketPriceRow | null {
  const stmt = db.prepare(`
    SELECT symbol, display_name, asset_type, market_date, close_price, currency, change_pct, rsi14, rsi_state, ma20, ma60, ma120, recorded_at
    FROM market_prices
    WHERE symbol = ?
    ORDER BY market_date DESC
    LIMIT 1
  `);

  return (stmt.get(symbol) as MarketPriceRow | undefined) ?? null;
}
