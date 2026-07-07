#!/usr/bin/env node
/**
 * Seed script — creates a Supabase auth account + profile row for every
 * member of the roster, all with the same default password.
 *
 * Prerequisites:
 *   1. Run supabase/schema.sql in your Supabase project first.
 *   2. Set env vars (in .env.local or the shell):
 *        NEXT_PUBLIC_SUPABASE_URL
 *        SUPABASE_SERVICE_ROLE_KEY   (Project Settings → API → service_role)
 *        SEED_DEFAULT_PASSWORD       (optional, defaults to Hoet@2026)
 *
 * Usage:  npm run seed
 *
 * Safe to re-run: existing accounts are skipped, profiles are upserted.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually (no dependency on dotenv)
function loadEnv() {
  try {
    const raw = readFileSync(join(__dirname, "..", ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* no .env.local — rely on shell env */
  }
}
loadEnv();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PASSWORD = process.env.SEED_DEFAULT_PASSWORD || "Hoet@2026";
const DOMAIN = "hoet.local";

if (!URL || !SERVICE_KEY) {
  console.error(
    "\n✗ Missing env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY " +
      "in .env.local, then re-run `npm run seed`.\n"
  );
  process.exit(1);
}

const roster = JSON.parse(
  readFileSync(join(__dirname, "..", "lib", "roster.data.json"), "utf8")
);

const admin = createClient(URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(email) {
  // Page through users (fine for a small team)
  let page = 1;
  while (page < 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email === email);
    if (hit) return hit;
    if (data.users.length < 200) return null;
    page++;
  }
  return null;
}

async function run() {
  console.log(`\nSeeding ${roster.length} accounts into ${URL}\n`);
  let created = 0;
  let skipped = 0;

  for (const m of roster) {
    const email = `${m.username}@${DOMAIN}`;
    let user = await findUserByEmail(email);

    if (!user) {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: PASSWORD,
        email_confirm: true,
        app_metadata: { role: m.role },
      });
      if (error) {
        console.error(`  ✗ ${m.username}: ${error.message}`);
        continue;
      }
      user = data.user;
      created++;
      console.log(`  + created ${m.username} (${m.role})`);
    } else {
      skipped++;
      console.log(`  = exists  ${m.username}`);
    }

    const { error: pErr } = await admin.from("profiles").upsert({
      id: user.id,
      username: m.username,
      full_name: m.fullName,
      role: m.role,
      pod: m.pod ?? null,
      title: m.title ?? null,
      active: true,
    });
    if (pErr) console.error(`  ✗ profile ${m.username}: ${pErr.message}`);
  }

  console.log(
    `\n✓ Done. ${created} created, ${skipped} already existed.\n` +
      `  Everyone logs in with their username and password: ${PASSWORD}\n`
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
