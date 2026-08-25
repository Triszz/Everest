// Apply missing schema column directly via pg client
// Usage: node scripts/apply-city-column.js
require("dotenv/config");
const { Client } = require("pg");

(async () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    console.log("[apply] connecting to Supabase pooler...");
    await client.connect();
    console.log("[apply] connected");

    const sql = `ALTER TABLE branches ADD COLUMN IF NOT EXISTS city VARCHAR(100);`;
    console.log("[apply] executing:", sql);
    await client.query(sql);
    console.log("[apply] ✓ city column added (or already exists)");

    const verify = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'branches' AND column_name = 'city'`
    );
    console.log("[apply] verify columns:", verify.rows);
  } catch (e) {
    console.error("[apply] error:", e.message);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
