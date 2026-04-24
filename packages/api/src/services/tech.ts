import { db } from "./kysely.js";

export type Tech = {
  id: number;
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
  await db.insertInto("tech").values(tech).execute();
}

export async function getRadarsUsing(id: number): Promise<
  {
    id: number;
    name: string;
    ring: number;
    version: number;
  }[]
> {
  const teams = await db
    .selectFrom("tech")
    .innerJoin("blip", "tech.id", "blip.tech_id")
    .innerJoin("radar_version", "blip.radar_version_id", "radar_version.id")
    .innerJoin("radar", "radar_version.radar_id", "radar.id")
    .select(["radar.name", "radar.id", "blip.ring", "radar_version.version"])
    .where("tech.id", "=", id)
    .execute();

  return teams;
}

export async function getAllTechs(): Promise<Tech[]> {
  const techs = await db
    .selectFrom("tech")
    .select(["id", "name", "quadrant", "url", "description"])
    .orderBy("quadrant", "asc")
    .orderBy("name", "asc")
    .execute();

  return techs;
}

export async function getTech(id: number): Promise<Tech> {
  const techs = await db
    .selectFrom("tech")
    .select(["id", "name", "quadrant", "url", "description"])
    .where("id", "=", id)
    .executeTakeFirstOrThrow();

  return techs;
}
