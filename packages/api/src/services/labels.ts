import { db } from "./kysely.js";

export type QuadrantLabel = {
  id: number;
  name: string;
};

export type RingLabel = {
  id: number;
  name: string;
  color: string;
};

export async function getAllQuadrants(): Promise<QuadrantLabel[]> {
  return db.selectFrom("quadrant").select(["id", "name"]).orderBy("id", "asc").execute();
}

export async function getAllRings(): Promise<RingLabel[]> {
  return db.selectFrom("ring").select(["id", "name", "color"]).orderBy("id", "asc").execute();
}

export async function quadrantName(quadrant: number): Promise<string> {
  const row = await db
    .selectFrom("quadrant")
    .select("name")
    .where("id", "=", quadrant)
    .executeTakeFirstOrThrow();
  return row.name;
}

export async function ringName(ring: number): Promise<string> {
  const row = await db
    .selectFrom("ring")
    .select("name")
    .where("id", "=", ring)
    .executeTakeFirstOrThrow();
  return row.name;
}
