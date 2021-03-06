import { TableBuilder } from "./tablebuilder.ts";
import { assertEquals } from "../../testdeps.ts";
import { DatabaseDialect } from "../connect.ts";
import { ColumnBuilder } from "./columnbuilder.ts";
import { ForeignActions } from "./foreign.ts";
import { quote } from "../utils/dialect.ts";

function createBasicTable(dialect: DatabaseDialect) {
  const builder = new TableBuilder("posts", { dialect } as any);

  builder.id();
  builder.varchar("title", 100);
  builder.varchar("description");
  builder.text("content");
  builder.integer("likes");
  builder.bigInteger("price");
  builder.boolean("is_published");
  builder.datetime("published_at");
  builder.date("date_approved");
  builder.timestamps();
  builder.custom("token VARCHAR(100)");
  builder.foreignId("user_id", "users", { onDelete: ForeignActions.Cascade });

  return builder;
}

Deno.test("TableBuilder: mysql basic table", () => {
  const builder = createBasicTable("mysql");
  assertEquals(
    builder.toSQL(),
    "CREATE TABLE `posts` (`id` BIGINT PRIMARY KEY AUTO_INCREMENT, `title` VARCHAR(100), `description` VARCHAR(255), `content` LONGTEXT, `likes` INTEGER, `price` BIGINT, `is_published` TINYINT, `published_at` DATETIME, `date_approved` DATE, `created_at` DATETIME, `updated_at` DATETIME, token VARCHAR(100), `user_id` BIGINT, FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE);",
  );
});

Deno.test("TableBuilder: postgres basic table", () => {
  const builder = createBasicTable("postgres");
  assertEquals(
    builder.toSQL(),
    'CREATE TABLE "posts" ("id" BIGSERIAL PRIMARY KEY, "title" VARCHAR(100), "description" VARCHAR(255), "content" TEXT, "likes" INTEGER, "price" BIGINT, "is_published" BOOLEAN, "published_at" TIMESTAMP, "date_approved" DATE, "created_at" TIMESTAMP, "updated_at" TIMESTAMP, token VARCHAR(100), "user_id" BIGINT, FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE);',
  );
});

Deno.test("TableBuilder: sqlite basic table", () => {
  const builder = createBasicTable("sqlite");
  assertEquals(
    builder.toSQL(),
    "CREATE TABLE `posts` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `title` VARCHAR(100), `description` VARCHAR(255), `content` TEXT, `likes` INTEGER, `price` BIGINT, `is_published` BOOLEAN, `published_at` DATETIME, `date_approved` DATE, `created_at` DATETIME, `updated_at` DATETIME, token VARCHAR(100), `user_id` INTEGER, FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE);",
  );
});

const methods: (keyof TableBuilder)[] = [
  "increments",
  "bigIncrements",
  "smallIncrements",
  "varchar",
  "text",
  "integer",
  "smallInteger",
  "bigInteger",
  "boolean",
  "datetime",
  "date",
];

for (const method of methods) {
  Deno.test(`TableBuilder: ${method}`, () => {
    ["sqlite", "postgres", "mysql"].forEach(() => {
      const builder = new TableBuilder("users", {} as any);

      const column = (builder as any)[method]("name");
      assertEquals(column instanceof ColumnBuilder, true);
      assertEquals((column as any).name, "name");
      assertEquals((column as any).type, method);
    });
  });
}

Deno.test("TableBuilder: id", () => {
  for (const dialect of ["sqlite", "postgres", "mysql"]) {
    const builder = new TableBuilder("users", { dialect } as any);
    const column = builder.id();
    assertEquals((column as any).type, "bigIncrements");
    assertEquals((builder as any).columns.length, 1);
    assertEquals((builder as any).columns[0], column);
  }
});

Deno.test("TableBuilder: varchar", () => {
  const builder = new TableBuilder("users", {} as any);

  let column = builder.varchar("name");
  assertEquals((column as any).type, "varchar");
  assertEquals((column as any).length, undefined);

  column = builder.varchar("name", 100);
  assertEquals((column as any).type, "varchar");
  assertEquals((column as any).length, 100);
});

Deno.test("TableBuilder: timestamps", () => {
  for (const dialect of ["sqlite", "postgres", "mysql"]) {
    const builder = new TableBuilder("users", { dialect } as any);
    let columns = builder.timestamps();
    assertEquals(columns.length, 2);
    assertEquals((columns[0] as any).name, "created_at");
    assertEquals((columns[0] as any).type, "datetime");
    assertEquals((columns[1] as any).name, "updated_at");
    assertEquals((columns[1] as any).type, "datetime");
    assertEquals((builder as any).columns.length, 2);
    assertEquals((builder as any).columns[0], columns[0]);
    assertEquals((builder as any).columns[1], columns[1]);
  }
});

Deno.test("TableBuilder: foreignId", () => {
  for (const dialect of ["sqlite", "postgres", "mysql"]) {
    const builder = new TableBuilder("users", { dialect } as any);
    const column = builder.foreignId("user_id", "users", {
      onDelete: ForeignActions.Cascade,
      onUpdate: ForeignActions.SetNull,
      constraint: "FK_MyConstraint",
    });
    if (dialect === "sqlite") {
      assertEquals((column as any).type, "integer");
    } else {
      assertEquals((column as any).type, "bigInteger");
    }
    assertEquals((column as any).name, "user_id");
    assertEquals((builder as any).extras.length, 1);
    assertEquals(
      (builder as any).extras[0],
      `CONSTRAINT ${quote("FK_MyConstraint", dialect as any)} FOREIGN KEY (${
        quote("user_id", dialect as any)
      }) REFERENCES ${quote("users", dialect as any)}(${
        quote("id", dialect as any)
      }) ON DELETE CASCADE ON UPDATE SET NULL`,
    );
  }
});
