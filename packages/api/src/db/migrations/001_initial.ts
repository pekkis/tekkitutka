import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("quadrant")
    .addColumn("id", "integer", col => col.primaryKey())
    .addColumn("name", "varchar(255)", col => col.notNull())
    .execute();

  await db.schema
    .createTable("ring")
    .addColumn("id", "integer", col => col.primaryKey())
    .addColumn("name", "varchar(255)", col => col.notNull())
    .addColumn("color", "varchar(7)", col => col.notNull())
    .execute();

  await db.schema
    .createTable("tech")
    .addColumn("id", "serial", col => col.primaryKey())
    .addColumn("name", "varchar(255)", col => col.notNull().unique())
    .addColumn("description", "text")
    .addColumn("url", "varchar(255)")
    .addColumn("quadrant", "integer", col => col.notNull().references("quadrant.id"))
    .addColumn("created_at", "timestamptz", col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updated_at", "timestamp", col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await db.schema
    .createTable("radar")
    .addColumn("id", "serial", col => col.primaryKey())
    .addColumn("name", "varchar(255)", col => col.notNull().unique())
    .addColumn("created_at", "timestamptz", col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute();

  await db.schema
    .createTable("blip")
    .addColumn("id", "serial", col => col.primaryKey())
    .addColumn("tech_id", "integer", col => col.notNull().references("tech.id"))
    .addColumn("radar_id", "integer", col => col.notNull().references("radar.id"))
    .addColumn("ring", "integer", col => col.notNull().references("ring.id"))
    .addUniqueConstraint("blip_tech_radar_unique", ["tech_id", "radar_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("blip").execute();
  await db.schema.dropTable("radar").execute();
  await db.schema.dropTable("tech").execute();
  await db.schema.dropTable("ring").execute();
  await db.schema.dropTable("quadrant").execute();
}
