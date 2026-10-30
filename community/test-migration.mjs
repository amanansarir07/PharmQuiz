import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "../recovery/test-deps/node_modules/@electric-sql/pglite/dist/index.js";

const db = new PGlite();
const admin = "11111111-1111-4111-8111-111111111111";
const student = "22222222-2222-4222-8222-222222222222";
const teacher = "33333333-3333-4333-8333-333333333333";
const question = "44444444-4444-4444-8444-444444444444";
await db.exec(`
  create role anon;
  create role authenticated;
  create schema auth;
  create function auth.uid() returns uuid language sql stable as
    $$select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid$$;
  create table public.profiles (id uuid primary key, name text not null,
    email text not null, avatar_url text, role text not null);
  create table public.published_questions (id uuid primary key);
  insert into public.profiles values
    ('${admin}','Admin','admin@example.test',null,'admin'),
    ('${student}','Student','student@example.test',null,'user'),
    ('${teacher}','Teacher','teacher@example.test',null,'user');
  insert into public.published_questions values ('${question}');
  create function public.is_admin() returns boolean language sql stable security definer set search_path = '' as
    $$select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')$$;
  grant usage on schema public to anon, authenticated;
  grant execute on function auth.uid(), public.is_admin() to anon, authenticated;
`);
await db.exec(readFileSync("supabase/migrations/017_community.sql", "utf8"));
const setActor = async (role, id = "") => {
  await db.exec("reset role");
  await db.exec(`set request.jwt.claim.sub = '${id}'`);
  await db.exec(`set role ${role}`);
};
const expectDenied = async (sql) => {
  let denied = false;
  try { await db.exec(sql); } catch { denied = true; }
  assert.equal(denied, true, `Expected rejection: ${sql}`);
};
await setActor("anon");
await expectDenied(`insert into public.community_posts(author_id,title,body)
  values ('${student}','A clear question title','A detailed question for the community to answer.')`);
await setActor("authenticated", student);
const created = await db.query(`insert into public.community_posts(author_id,title,body,question_id)
  values ('${student}','How should I interpret a pain score?','I am comparing repeated pain assessments after analgesia and need the clinical reasoning.','${question}')
  returning id`);
const postId = created.rows[0].id;
await expectDenied(`insert into public.community_teacher_verifications(user_id,verified_by)
  values ('${teacher}','${student}')`);
await expectDenied(`insert into public.community_posts(author_id,title,body)
  values ('${student}','How should I interpret a pain score?','A duplicate question from the same account.')`);
await setActor("authenticated", teacher);
const replied = await db.query(`insert into public.community_replies(post_id,author_id,body)
  values ('${postId}','${teacher}','Repeat the score after treatment to measure response and catch worsening pain.') returning id`);
const replyId = replied.rows[0].id;
const stolen = await db.query(`update public.community_posts set title = 'A stolen title here' where id = '${postId}' returning id`);
assert.equal(stolen.rows.length, 0);
await expectDenied(`update public.community_members set is_teacher = true where user_id = '${teacher}'`);
await expectDenied(`insert into public.community_votes(voter_id,reply_id) values ('${teacher}','${replyId}')`);
await db.exec(`insert into public.community_reports(reporter_id,post_id,reason,detail)
  values ('${teacher}','${postId}','incorrect','The reasoning needs a source.')`);
await expectDenied(`select public.community_accept_reply('${postId}','${replyId}')`);
await setActor("authenticated", admin);
await db.exec(`insert into public.community_teacher_verifications(user_id,verified_by) values ('${teacher}','${admin}')`);
await db.exec(`insert into public.community_votes(voter_id,reply_id) values ('${admin}','${replyId}')`);
await expectDenied(`insert into public.community_votes(voter_id,reply_id) values ('${admin}','${replyId}')`);
const votes = await db.query(`select helpful_count from public.community_replies where id='${replyId}'`);
assert.equal(votes.rows[0].helpful_count, 1);
await db.exec(`select public.community_accept_reply('${postId}','${replyId}')`);
await db.exec(`select public.community_accept_reply('${postId}','${replyId}')`);
const after = await db.query(`select p.reply_count,p.accepted_reply_id,m.is_teacher
  from public.community_posts p join public.community_members m on m.user_id = '${teacher}' where p.id = '${postId}'`);
assert.equal(after.rows[0].reply_count, 1);
assert.equal(after.rows[0].accepted_reply_id, replyId);
assert.equal(after.rows[0].is_teacher, true);
await db.exec(`select public.community_moderate('reply','${replyId}','hide')`);
const hidden = await db.query(`select reply_count,accepted_reply_id from public.community_posts where id='${postId}'`);
assert.equal(hidden.rows[0].reply_count, 0);
assert.equal(hidden.rows[0].accepted_reply_id, null);
await db.exec("reset role");
const notice = await db.query(`select kind,recipient_id from public.community_notifications order by created_at`);
assert.equal(notice.rows.length, 2);
const reportId = (await db.query(`select id from public.community_reports limit 1`)).rows[0].id;
await db.exec(`select public.community_review_report('${reportId}','dismiss')`);
const reviewed = await db.query(`select state,reviewed_by from public.community_reports where id='${reportId}'`);
assert.equal(reviewed.rows[0].state, "dismissed");
assert.equal(reviewed.rows[0].reviewed_by, admin);
await db.exec(`select public.community_moderate('reply','${replyId}','restore')`);
await db.exec(`delete from public.profiles where id='${teacher}'`);
const afterAccountDeletion = await db.query(`select reply_count,accepted_reply_id from public.community_posts where id='${postId}'`);
assert.equal(afterAccountDeletion.rows[0].reply_count, 0);
assert.equal(afterAccountDeletion.rows[0].accepted_reply_id, null);
const originalQuestion = await db.query(`select id from public.published_questions where id='${question}'`);
assert.equal(originalQuestion.rows.length, 1);
await db.close();
console.log("Community migration: guest write denied; ownership, badges, spam, votes, replies, reports, notifications and moderation passed. Existing MCQ preserved.");
