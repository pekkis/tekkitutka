import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // Create radar_version table
  await db.schema
    .createTable("radar_version")
    .addColumn("id", "serial", col => col.primaryKey())
    .addColumn("radar_id", "integer", col => col.notNull().references("radar.id"))
    .addColumn("version", "integer", col => col.notNull())
    .addColumn("label", "varchar(255)")
    .addColumn("release_date", "date", col => col.notNull())
    .addColumn("created_at", "timestamptz", col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn("updated_at", "timestamptz", col => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addUniqueConstraint("radar_version_radar_version_unique", ["radar_id", "version"])
    .execute();

  // Backfill: create v1 for every existing radar using its created_at as release_date
  await sql`
    INSERT INTO radar_version (radar_id, version, release_date, created_at, updated_at)
    SELECT id, 1, COALESCE(created_at::date, CURRENT_DATE), COALESCE(created_at, CURRENT_TIMESTAMP), COALESCE(created_at, CURRENT_TIMESTAMP)
    FROM radar
  `.execute(db);

  // Add radar_version_id to blip (nullable for backfill)
  await db.schema
    .alterTable("blip")
    .addColumn("radar_version_id", "integer", col => col.references("radar_version.id"))
    .execute();

  // Backfill blip.radar_version_id from blip.radar_id (linked to v1)
  await sql`
    UPDATE blip
    SET radar_version_id = rv.id
    FROM radar_version rv
    WHERE rv.radar_id = blip.radar_id AND rv.version = 1
  `.execute(db);

  // Drop old unique constraint, then drop radar_id
  await db.schema.alterTable("blip").dropConstraint("blip_tech_radar_unique").execute();
  await db.schema.alterTable("blip").dropColumn("radar_id").execute();

  // Enforce NOT NULL + new unique constraint
  await db.schema
    .alterTable("blip")
    .alterColumn("radar_version_id", col => col.setNotNull())
    .execute();

  await db.schema
    .alterTable("blip")
    .addUniqueConstraint("blip_tech_radar_version_unique", ["tech_id", "radar_version_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("blip")
    .addColumn("radar_id", "integer", col => col.references("radar.id"))
    .execute();

  await sql`
    UPDATE blip
    SET radar_id = rv.radar_id
    FROM radar_version rv
    WHERE rv.id = blip.radar_version_id
  `.execute(db);

  await db.schema.alterTable("blip").dropConstraint("blip_tech_radar_version_unique").execute();
  await db.schema.alterTable("blip").dropColumn("radar_version_id").execute();
  await db.schema
    .alterTable("blip")
    .alterColumn("radar_id", col => col.setNotNull())
    .execute();
  await db.schema
    .alterTable("blip")
    .addUniqueConstraint("blip_tech_radar_unique", ["tech_id", "radar_id"])
    .execute();

  await db.schema.dropTable("radar_version").execute();
}
