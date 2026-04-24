import { type Kysely, sql } from "kysely";
import { generatePublicId } from "../../services/publicId.js";

export async function up(db: Kysely<unknown>): Promise<void> {
  // Add nullable public_id columns
  await db.schema.alterTable("radar").addColumn("public_id", "varchar(12)").execute();

  await db.schema.alterTable("tech").addColumn("public_id", "varchar(12)").execute();

  // Backfill radar.public_id
  const radars = await sql<{ id: number }>`SELECT id FROM radar WHERE public_id IS NULL`.execute(
    db,
  );
  for (const r of radars.rows) {
    await sql`UPDATE radar SET public_id = ${generatePublicId()} WHERE id = ${r.id}`.execute(db);
  }

  // Backfill tech.public_id
  const techs = await sql<{ id: number }>`SELECT id FROM tech WHERE public_id IS NULL`.execute(db);
  for (const t of techs.rows) {
    await sql`UPDATE tech SET public_id = ${generatePublicId()} WHERE id = ${t.id}`.execute(db);
  }

  // Enforce NOT NULL + UNIQUE + indexes
  await db.schema
    .alterTable("radar")
    .alterColumn("public_id", col => col.setNotNull())
    .execute();
  await db.schema
    .alterTable("radar")
    .addUniqueConstraint("radar_public_id_unique", ["public_id"])
    .execute();

  await db.schema
    .alterTable("tech")
    .alterColumn("public_id", col => col.setNotNull())
    .execute();
  await db.schema
    .alterTable("tech")
    .addUniqueConstraint("tech_public_id_unique", ["public_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable("radar").dropConstraint("radar_public_id_unique").execute();
  await db.schema.alterTable("radar").dropColumn("public_id").execute();
  await db.schema.alterTable("tech").dropConstraint("tech_public_id_unique").execute();
  await db.schema.alterTable("tech").dropColumn("public_id").execute();
}
