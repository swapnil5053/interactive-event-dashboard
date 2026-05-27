import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const url = process.env.DATABASE_URL || "file:local.db";

const client = createClient({
  url: url,
});

export const db = drizzle(client, { schema });
export type DatabaseType = typeof db;
export type SchemaType = typeof schema;
