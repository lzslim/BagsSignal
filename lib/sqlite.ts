import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

declare global {
  var __bagssignalDb: DatabaseSync | undefined;
}

function resolveDbPath() {
  const configured = process.env.LEADERBOARD_SQLITE_PATH?.trim();
  return configured
    ? path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured)
    : path.join(process.cwd(), "data", "bagssignal.sqlite");
}

export function getDb() {
  if (!global.__bagssignalDb) {
    const dbPath = resolveDbPath();
    mkdirSync(path.dirname(dbPath), { recursive: true });
    const db = new DatabaseSync(dbPath);
    db.exec("PRAGMA journal_mode = WAL;");
    db.exec("PRAGMA synchronous = NORMAL;");
    db.exec(`
      CREATE TABLE IF NOT EXISTS leaderboard_entries (
        mint TEXT PRIMARY KEY,
        symbol TEXT NOT NULL,
        name TEXT,
        image_url TEXT,
        creator_wallet TEXT NOT NULL,
        creator_wallet_short TEXT NOT NULL,
        creator_username TEXT,
        creator_provider TEXT,
        creator_url TEXT,
        creator_pfp TEXT,
        lifetime_total_sol REAL NOT NULL DEFAULT 0,
        lifetime_earned_sol REAL NOT NULL DEFAULT 0,
        claimable_sol REAL NOT NULL DEFAULT 0,
        royalty_bps INTEGER NOT NULL DEFAULT 0,
        royalty_pct REAL NOT NULL DEFAULT 0,
        is_graduated INTEGER NOT NULL DEFAULT 1,
        bags_url TEXT,
        discovery_source TEXT,
        volume_24h_usd REAL NOT NULL DEFAULT 0,
        volume_1h_usd REAL NOT NULL DEFAULT 0,
        volume_6h_usd REAL NOT NULL DEFAULT 0,
        volume_7d_usd REAL NOT NULL DEFAULT 0,
        trade_count_1h INTEGER NOT NULL DEFAULT 0,
        trade_count_6h INTEGER NOT NULL DEFAULT 0,
        trade_count_24h INTEGER NOT NULL DEFAULT 0,
        trade_count_7d INTEGER NOT NULL DEFAULT 0,
        launch_created_at TEXT,
        rank_score REAL NOT NULL DEFAULT 0,
        momentum_score REAL NOT NULL DEFAULT 0,
        ai_readiness_score REAL NOT NULL DEFAULT 0,
        last_trade_at TEXT,
        source TEXT NOT NULL DEFAULT 'bitquery',
        synced_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS token_ai_features (
        mint TEXT PRIMARY KEY,
        age_hours REAL NOT NULL DEFAULT 0,
        volume_growth_1h_vs_24h REAL NOT NULL DEFAULT 0,
        volume_growth_24h_vs_7d REAL NOT NULL DEFAULT 0,
        trade_velocity_1h REAL NOT NULL DEFAULT 0,
        revenue_velocity_sol REAL NOT NULL DEFAULT 0,
        has_metadata_image INTEGER NOT NULL DEFAULT 0,
        has_social_creator INTEGER NOT NULL DEFAULT 0,
        low_liquidity_risk INTEGER NOT NULL DEFAULT 0,
        high_momentum INTEGER NOT NULL DEFAULT 0,
        ai_summary_input_json TEXT NOT NULL,
        rank_reason TEXT,
        growth_reason TEXT,
        risk_reason TEXT,
        recommended_action TEXT,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS token_ai_recommendations (
        mint TEXT PRIMARY KEY,
        symbol TEXT NOT NULL,
        recommendation_type TEXT NOT NULL,
        stance TEXT NOT NULL,
        confidence TEXT NOT NULL,
        title TEXT NOT NULL,
        insight TEXT NOT NULL,
        action TEXT NOT NULL,
        evidence_json TEXT NOT NULL,
        model_provider TEXT,
        model_name TEXT,
        generated_at TEXT NOT NULL,
        source_snapshot_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS leaderboard_sync_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        status TEXT NOT NULL,
        source TEXT NOT NULL,
        message TEXT,
        tokens_seen INTEGER NOT NULL DEFAULT 0,
        synced_entries INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS app_state (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    global.__bagssignalDb = db;
  }

  ensureLeaderboardSchema(global.__bagssignalDb);
  return global.__bagssignalDb;
}

function ensureLeaderboardSchema(db: DatabaseSync) {
  try {
    db.exec("ALTER TABLE leaderboard_entries ADD COLUMN image_url TEXT;");
  } catch {}
  try {
    db.exec("ALTER TABLE leaderboard_entries ADD COLUMN creator_url TEXT;");
  } catch {}
  try {
    db.exec("ALTER TABLE leaderboard_entries ADD COLUMN launch_created_at TEXT;");
  } catch {}
  try {
    db.exec("ALTER TABLE leaderboard_entries ADD COLUMN rank_score REAL NOT NULL DEFAULT 0;");
  } catch {}
  try {
    db.exec("ALTER TABLE leaderboard_entries ADD COLUMN momentum_score REAL NOT NULL DEFAULT 0;");
  } catch {}
  try {
    db.exec("ALTER TABLE leaderboard_entries ADD COLUMN discovery_source TEXT;");
  } catch {}
  try {
    db.exec("ALTER TABLE leaderboard_entries ADD COLUMN volume_1h_usd REAL NOT NULL DEFAULT 0;");
  } catch {}
  try {
    db.exec("ALTER TABLE leaderboard_entries ADD COLUMN volume_6h_usd REAL NOT NULL DEFAULT 0;");
  } catch {}
  try {
    db.exec("ALTER TABLE leaderboard_entries ADD COLUMN volume_7d_usd REAL NOT NULL DEFAULT 0;");
  } catch {}
  try {
    db.exec("ALTER TABLE leaderboard_entries ADD COLUMN trade_count_1h INTEGER NOT NULL DEFAULT 0;");
  } catch {}
  try {
    db.exec("ALTER TABLE leaderboard_entries ADD COLUMN trade_count_6h INTEGER NOT NULL DEFAULT 0;");
  } catch {}
  try {
    db.exec("ALTER TABLE leaderboard_entries ADD COLUMN trade_count_7d INTEGER NOT NULL DEFAULT 0;");
  } catch {}
  try {
    db.exec("ALTER TABLE leaderboard_entries ADD COLUMN ai_readiness_score REAL NOT NULL DEFAULT 0;");
  } catch {}
  db.exec(`
    CREATE TABLE IF NOT EXISTS token_ai_features (
      mint TEXT PRIMARY KEY,
      age_hours REAL NOT NULL DEFAULT 0,
      volume_growth_1h_vs_24h REAL NOT NULL DEFAULT 0,
      volume_growth_24h_vs_7d REAL NOT NULL DEFAULT 0,
      trade_velocity_1h REAL NOT NULL DEFAULT 0,
      revenue_velocity_sol REAL NOT NULL DEFAULT 0,
      has_metadata_image INTEGER NOT NULL DEFAULT 0,
      has_social_creator INTEGER NOT NULL DEFAULT 0,
      low_liquidity_risk INTEGER NOT NULL DEFAULT 0,
      high_momentum INTEGER NOT NULL DEFAULT 0,
      ai_summary_input_json TEXT NOT NULL,
      rank_reason TEXT,
      growth_reason TEXT,
      risk_reason TEXT,
      recommended_action TEXT,
      updated_at TEXT NOT NULL
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS token_ai_recommendations (
      mint TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      recommendation_type TEXT NOT NULL,
      stance TEXT NOT NULL,
      confidence TEXT NOT NULL,
      title TEXT NOT NULL,
      insight TEXT NOT NULL,
      action TEXT NOT NULL,
      evidence_json TEXT NOT NULL,
      model_provider TEXT,
      model_name TEXT,
      generated_at TEXT NOT NULL,
      source_snapshot_at TEXT NOT NULL
    );
  `);
}
