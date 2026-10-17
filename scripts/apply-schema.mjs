// Script para aplicar o schema no banco Supabase.
// Uso: node scripts/apply-schema.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carrega variáveis do .env.local manualmente
const envPath = path.join(__dirname, "..", ".env.local");
const env = {};
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const ref = env.SUPABASE_PROJECT_REF;
const password = env.SUPABASE_DB_PASSWORD;

// Pooler do Supabase (suporta IPv4). Porta 6543 = transaction, 5432 = session.
// Usamos a session pooler para rodar DDL.
const connectionString = process.env.DATABASE_URL
  ? process.env.DATABASE_URL
  : `postgresql://postgres.${ref}:${encodeURIComponent(
      password
    )}@aws-1-us-west-2.pooler.supabase.com:5432/postgres`;

const sql = fs.readFileSync(path.join(__dirname, "..", "supabase", "schema.sql"), "utf8");

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("Conectado ao banco. Aplicando schema...");
  await client.query(sql);
  console.log("Schema aplicado com sucesso!");
} catch (err) {
  console.error("Falha ao aplicar o schema:");
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
