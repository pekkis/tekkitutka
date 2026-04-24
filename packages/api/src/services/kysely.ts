import { Kysely, PostgresDialect } from "kysely";
import { DB } from "../db/types.js";
import pg from "pg";

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});
