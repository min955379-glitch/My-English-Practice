import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

test("migrations enforce cross-user RLS and session ownership", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;`,
    );
    for (const file of readdirSync("drizzle")
      .filter((f) => f.endsWith(".sql"))
      .sort())
      await db.exec(
        readFileSync(`drizzle/${file}`, "utf8").replaceAll(
          "--> statement-breakpoint",
          "",
        ),
      );
    const a = "00000000-0000-4000-8000-000000000001";
    const b = "00000000-0000-4000-8000-000000000002";
    await db.exec(
      `insert into auth.users values ('${a}'),('${b}'); insert into public.levels(id,name,description) values (1,'Short words','Short words'); insert into public.users(id) values ('${a}'),('${b}'); insert into profiles(user_id,display_name) values ('${a}','Learner A'),('${b}','Learner B');`,
    );
    await db.exec(`insert into phonics_patterns(category,description,example_words,order_index) values ('short_cvc','Short vowels','["cat"]',0);
      insert into words(id,text,phonetic,syllables,syllable_count,syllable_split,stress_pattern,level,pattern_category,word_family,meaning,example) values (1,'cat','/kæt/','["cat"]',1,'cat','1',1,'short_cvc','-at','A domestic animal.','The cat is outside.');`);
    await db.exec(
      `set role authenticated; select set_config('request.jwt.claim.sub','${a}',false);`,
    );
    const rows = await db.query<{ display_name: string }>(
      "select display_name from profiles",
    );
    assert.deepEqual(
      rows.rows.map((r) => r.display_name),
      ["Learner A"],
    );
    await assert.rejects(
      db.exec(
        `insert into profiles(user_id,display_name) values ('${b}','Not permitted');`,
      ),
    );
    await db.exec(
      `insert into sessions(id,user_id,level_reached) values ('00000000-0000-4000-8000-000000000010','${a}',1);`,
    );
    await db.exec(`select set_config('request.jwt.claim.sub','${b}',false);`);
    assert.equal((await db.query("select * from sessions")).rows.length, 0);
    await assert.rejects(
      db.exec(
        `insert into attempts(user_id,word_id,session_id,typed_answer,is_correct,is_first_try,attempt_number,result) values ('${b}',1,'00000000-0000-4000-8000-000000000010','x',false,false,1,'mistake');`,
      ),
      (error: unknown) => (error as { code: string }).code === "23503",
    );
    await db.exec(`select set_config('request.jwt.claim.sub','${a}',false);
      insert into attempts(user_id,word_id,session_id,typed_answer,is_correct,is_first_try,attempt_number,result) values ('${a}',1,'00000000-0000-4000-8000-000000000010','x',false,false,1,'mistake');`);
    await assert.rejects(
      db.exec(`update attempts set typed_answer='cat' where user_id='${a}';`),
    );

    await db.exec("reset role");
    assert.equal((await db.query("select * from profiles")).rows.length, 2);
    await db.exec(`delete from auth.users where id='${a}';`);
    assert.equal((await db.query("select * from profiles")).rows.length, 1);
    assert.equal((await db.query("select * from sessions")).rows.length, 0);
    assert.equal((await db.query("select * from attempts")).rows.length, 0);
  } finally {
    await db.close();
  }
});
