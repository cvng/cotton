import { assertEquals } from "../deps.ts";

import { connect } from "./connect.ts";
import { SqliteAdapter } from "./adapter/sqlite.ts";
// import { PostgresAdapter } from "./adapter/postgres.ts";
// import { MysqlAdapter } from "./adapter/mysql.ts";

Deno.test("connect: sqlite", async () => {
  const db = await connect({
    type: "sqlite",
    database: Deno.env.get("TEST_SQLITE_DATABASE"),
  });
  assertEquals(db instanceof SqliteAdapter, true);
  await db.disconnect();
});

// Deno.test("connect: postgres", async () => {
//   const db = await connect({
//     type: "postgres",
//     database: env.TEST_POSTGRES_DATABASE,
//     hostname: env.TEST_POSTGRES_HOSTNAME,
//     username: env.TEST_POSTGRES_USERNAME,
//     password: env.TEST_POSTGRES_PASSWORD,
//   });
//   assertEquals(db instanceof PostgresAdapter, true);
//   await db.disconnect();
// });

// Deno.test("connect: mysql", async () => {
//   const db = await connect({
//     type: "mysql",
//     database: env.TEST_MYSQL_DATABASE,
//     hostname: env.TEST_MYSQL_HOSTNAME,
//     username: env.TEST_MYSQL_USERNAME,
//     password: env.TEST_MYSQL_PASSWORD,
//   });
//   assertEquals(db instanceof MysqlAdapter, true);
//   await db.disconnect();
// });
