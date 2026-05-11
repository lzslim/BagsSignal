import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const root = process.cwd();
const env = loadEnv(path.join(root, ".env.local"));
const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "");
const secretKey = requiredEnv("SUPABASE_SECRET_KEY");
const sqlitePath = path.resolve(env.LEADERBOARD_SQLITE_PATH || "data/bagssignal.sqlite");

const tables = [
  { name: "leaderboard_entries", pk: "mint", deleteFilter: "mint=not.is.null" },
  { name: "token_ai_features", pk: "mint", deleteFilter: "mint=not.is.null" },
  { name: "token_ai_recommendations", pk: "mint", deleteFilter: "mint=not.is.null" },
  { name: "leaderboard_sync_runs", pk: "id", deleteFilter: "id=not.is.null" },
  { name: "app_state", pk: "key", deleteFilter: "key=not.is.null" }
];

if (!fs.existsSync(sqlitePath)) {
  throw new Error(`SQLite database not found: ${sqlitePath}`);
}

const db = new DatabaseSync(sqlitePath);

for (const table of tables) {
  const rows = db.prepare(`SELECT * FROM ${table.name}`).all();
  await deleteAll(table.name, table.deleteFilter);
  await upsertRows(table.name, table.pk, rows);
  console.log(`${table.name}: migrated ${rows.length} row(s)`);
}

console.log("SQLite to Supabase migration completed.");

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const parsed = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    parsed[key] = value;
    process.env[key] = process.env[key] || value;
  }
  return parsed;
}

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

async function deleteAll(table, filter) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${filter}`, {
    method: "DELETE",
    headers: headers({ Prefer: "return=minimal" })
  });
  await assertOk(response, `delete ${table}`);
}

async function upsertRows(table, pk, rows) {
  if (rows.length === 0) return;

  for (let index = 0; index < rows.length; index += 100) {
    const chunk = rows.slice(index, index + 100);
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}?on_conflict=${encodeURIComponent(pk)}`, {
      method: "POST",
      headers: headers({ Prefer: "resolution=merge-duplicates,return=minimal" }),
      body: JSON.stringify(chunk)
    });
    await assertOk(response, `upsert ${table}`);
  }
}

function headers(extra = {}) {
  return {
    apikey: secretKey,
    authorization: `Bearer ${secretKey}`,
    "content-type": "application/json",
    "user-agent": "BagsSignal-server-migration/1.0",
    ...extra
  };
}

async function assertOk(response, label) {
  if (response.ok) return;
  const body = await response.text().catch(() => "");
  throw new Error(`${label} failed (${response.status}): ${body || response.statusText}`);
}
