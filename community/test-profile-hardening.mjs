import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "../recovery/test-deps/node_modules/@electric-sql/pglite/dist/index.js";

for (const hasProgram of [false, true]) {
  const db = new PGlite();
  await db.exec(`
    create role anon;
    create role authenticated;
    create table public.profiles (
      id uuid primary key, name text, avatar_url text,
      ${hasProgram ? "program_slug text," : ""} role text
    );
    grant update on public.profiles to anon, authenticated;
  `);
  const before = await db.query(`select has_column_privilege('authenticated',
    'public.profiles', 'role', 'UPDATE') as writable`);
  assert.equal(before.rows[0].writable, true);
  await db.exec(readFileSync("community/proposed-profile-role-hardening.sql", "utf8"));
  const after = await db.query(`select
    has_column_privilege('anon', 'public.profiles', 'role', 'UPDATE') as anon_role,
    has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE') as student_role,
    has_column_privilege('authenticated', 'public.profiles', 'name', 'UPDATE') as student_name,
    has_column_privilege('authenticated', 'public.profiles', 'avatar_url', 'UPDATE') as student_avatar,
    ${hasProgram ? "has_column_privilege('authenticated', 'public.profiles', 'program_slug', 'UPDATE')" : "true"} as student_program`);
  assert.deepEqual(after.rows[0], {
    anon_role: false, student_role: false, student_name: true,
    student_avatar: true, student_program: true,
  });
  const verification = await db.query(readFileSync("community/verify-profile-role-readonly.sql", "utf8"));
  assert.equal(verification.rows[0].community_profile_preflight_ready, true);
  assert.equal(verification.rows[0].program_column_present, hasProgram);
}
console.log("Profile role hardening passes with and without program_slug; ordinary profile edits retained.");
