import { db } from "./kysely.js";
import { generatePublicId } from "./publicId.js";

export type Tech = {
  publicId: string;
  name: string;
  quadrant: number;
  url: string | null;
  description: string | null;
};

type NewTech = {
  name: string;
  quadrant: number;
};

export async function createTech(tech: NewTech): Promise<void> {
  await db
    .insertInto("tech")
    .values({ ...tech, public_id: generatePublicId() })
    .execute();
}

export async function getRadarsUsing(techPublicId: string): Promise<
  {
    publicId: string;
    name: string;
    ring: number;
    version: number;
  }[]
> {
  const rows = await db
    .selectFrom("tech")
    .innerJoin("blip", "tech.id", "blip.tech_id")
    .innerJoin("radar_version", "blip.radar_version_id", "radar_version.id")
    .innerJoin("radar", "radar_version.radar_id", "radar.id")
    .select([
      "radar.name",
      "radar.public_id as radar_public_id",
      "blip.ring",
      "radar_version.version",
    ])
    .where("tech.public_id", "=", techPublicId)
    .execute();

  return rows.map(r => ({
    publicId: r.radar_public_id,
    name: r.name,
    ring: r.ring,
    version: r.version,
  }));
}

export async function getAllTechs(): Promise<Tech[]> {
  const techs = await db
    .selectFrom("tech")
    .select(["public_id", "name", "quadrant", "url", "description"])
    .orderBy("quadrant", "asc")
    .orderBy("name", "asc")
    .execute();

  return techs.map(t => ({
    publicId: t.public_id,
    name: t.name,
    quadrant: t.quadrant,
    url: t.url,
    description: t.description,
  }));
}

export async function getTech(publicId: string): Promise<Tech> {
  const t = await db
    .selectFrom("tech")
    .select(["public_id", "name", "quadrant", "url", "description"])
    .where("public_id", "=", publicId)
    .executeTakeFirstOrThrow();

  return {
    publicId: t.public_id,
    name: t.name,
    quadrant: t.quadrant,
    url: t.url,
    description: t.description,
  };
}
