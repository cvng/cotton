# Cotton

![ci](https://github.com/rahmanfadhil/cotton/workflows/ci/badge.svg?branch=master) ![GitHub release (latest by date)](https://img.shields.io/github/v/release/rahmanfadhil/cotton)

**SQL Database Toolkit for Deno.**

- Well-tested
- Type-safe
- Supports **MySQL**, **SQLite**, and **PostgreSQL**
- Semantic versioning

## How to use

Currently, Cotton supports SQLite3, MySQL, and PostgreSQL. To create a connection, use `connect` and pass the connection configurations.

```ts
import { connect } from "https://deno.land/x/cotton/mod.ts";

const db = await connect({
  type: "sqlite", // available type: 'mysql', 'postgres', and 'sqlite'
  database: "db.sqlite",
  // other...
});
```

You can run an SQL statement using the `execute` method.

```ts
await db.execute(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255),
  );
`);
```

Cotton provides an easy-to-use query builder which allows you to perform queries without writing raw SQL.

```ts
// Execute "SELECT * FROM users;"
const users = await db.queryBuilder("users").execute();

for (const user in users) {
  console.log(user.email);
}
```

However, you can still use raw SQL via `query` method.

```ts
const users = await db.query("SELECT * FROM users;");

for (const user of users) {
  console.log(user.email);
}
```

Once, you've finished using the database, disconnect it.

```ts
await db.disconnect();
```

## Model

A model is nothing more than a class that extends `Model`.

```ts
import { Model } from "https://deno.land/x/cotton/mod.ts";

class User extends Model {
  static tableName = "users";
  static primaryKey = "id"; // optional

  email!: string;
}
```

To do CRUD operations to our model, we can use the provided method in our model:

```ts
const user = await User.findOne(1); // find user by id
console.log(user instanceof User); // true
```

```ts
const users = await User.find(); // find all users

for (const user in users) {
  console.log(user.email);
}
```

## Query Builder

### Basic query

```ts
await db
  .queryBuilder("users")
  .where("email", "a@b.com")
  .where("name", "john")
  .execute();
// SELECT * FROM users WHERE email = 'a@b.com' AND name = 'john';
```

### Select columns

```ts
await db.queryBuilder("users").select("email").execute();
// SELECT (email) FROM users;

await db.queryBuilder("users").select("id", "email").execute();
// SELECT (id, email) FROM users;

await db.queryBuilder("users").select("id").select("email").execute();
// SELECT (id, email) FROM users;
```

### Pagination

```ts
await db.queryBuilder("users").limit(5).offset(5).execute(); // Skip 5 row and take 5
// SELECT * FROM users LIMIT 5 OFFSET 5;
```

### Insert data

```ts
await db.queryBuilder("users").insert({ email: "a@b.com", age: 16 }).execute();
// INSERT INTO users (email, age) VALUES ('a@b.com', 16);
```

### Delete data

```ts
await db.queryBuilder("users").where("email", "a@b.com").delete().execute();
// DELETE FROM users WHERE email = 'a@b.com';
```
