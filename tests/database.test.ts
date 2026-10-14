import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { drizzle } from "drizzle-orm/pglite";
import { levels, words, phonicsPatterns } from "../src/db/schema";
import { levelSeed, patternSeed, wordSeed } from "../src/db/seed";
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
      `insert into auth.users values ('${a}'),('${b}'); insert into public.users(id) values ('${a}'),('${b}'); insert into profiles(user_id,display_name) values ('${a}','Learner A'),('${b}','Learner B');`,
    );
    const orm = drizzle(db);
    await orm.insert(levels).values(levelSeed);
    await orm.insert(phonicsPatterns).values(patternSeed);
    await orm.insert(words).values(wordSeed);
    assert.equal((await db.query("select * from levels")).rows.length, 13);
    assert.equal((await db.query("select * from words")).rows.length, 408);
    await assert.rejects(
      db.exec("insert into levels(id,name,description) values (14,'No','No');"),
    );
    await db.exec(
      `insert into user_settings(user_id,theme,voice_gender) values ('${a}','dark','male');`,
    );
    assert.equal(
      (await db.query<{ theme: string }>("select theme from user_settings"))
        .rows[0].theme,
      "dark",
    );
    await assert.rejects(db.exec(`update user_settings set theme='invalid';`));
    assert.equal(
      (
        await db.query<{ voice_gender: string }>(
          "select voice_gender from user_settings",
        )
      ).rows[0].voice_gender,
      "male",
    );
    await assert.rejects(
      db.exec(`update user_settings set voice_gender='unknown';`),
    );
    assert.equal(
      (
        await db.query<{ audio_source: string }>(
          "select audio_source from user_settings",
        )
      ).rows[0].audio_source,
      "device",
    );
    await db.exec("update user_settings set audio_source='enhanced';");
    assert.equal(
      (
        await db.query<{ audio_source: string }>(
          "select audio_source from user_settings",
        )
      ).rows[0].audio_source,
      "enhanced",
    );
    await assert.rejects(
      db.exec("update user_settings set audio_source='invalid';"),
    );
    // Re-running the same JSON-derived seed is idempotent and preserves identities.
    for (const word of wordSeed)
      await orm
        .insert(words)
        .values(word)
        .onConflictDoUpdate({ target: [words.level, words.text], set: word });
    assert.equal((await db.query("select * from words")).rows.length, 408);
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
