import * as R from "ramda";
import { DateTime } from "luxon";
import { db } from "@/services/kysely";
import { quadrantName, ringName } from "@/services/labels";

type ResultSetRow = {
  id: number;
  quadrant: number;
  ring: number;
  name: string;
  // active: boolean;
  // moved: number;
  url: string | null;
  description: string | null;
  tech_id: number;
};

function rowMapper(row: ResultSetRow): RadarEntry {
  return {
    id: row.id,
    quadrant: row.quadrant as QuadrantId,
    ring: row.ring as RingId,
    name: row.name,
    active: true,
    moved: 0,
    url: row.url || `#`,
    description: row.description,
    techId: row.tech_id,
    // moved: random.pick([-1, 0, 1, 2]),
  };
}

type BasicRadarInfo = {
  id: number;
  name: string;
};

type QuadrantId = 0 | 1 | 2 | 3;

type RingId = 0 | 1 | 2 | 3;

export type RadarEntry = {
  id: number;
  quadrant: QuadrantId;
  ring: RingId;
  name: string;
  active: boolean;
  moved: 0 | -1 | 1 | 2;
  url: string;
  description: string | null;
  techId: number;
};

export type Quadrant = {
  name: string;
};

export type Ring = {
  name: string;
  color: string;
};

export type RadarChartEntry = {
  quadrant: number;
  ring: number;
  label: string;
  active: boolean;
  link: string;
  moved: number;
  description: string | null;
};

export type RadarConfiguration = {
  entries: RadarChartEntry[];
  width?: number;
  height?: number;
  svg_id: string;
  colors?: {
    background: string;
    grid: string;
    inactive: string;
  };
  print_layout?: boolean;
  links_in_new_tabs?: boolean;
  repo_url?: string;
  print_ring_descriptions_table?: boolean;
  scale: number;
  title: string;
  date: string;
  quadrants: Quadrant[];
  rings: Ring[];
};

export type BasicRadarData = {
  id: number;
  name: string;
  date: string | null;
};

export type RadarData = BasicRadarData & {
  quadrants: Quadrant[];
  rings: Ring[];
  entries: RadarEntry[];
  url: string;
};

export async function getAllRadars(): Promise<BasicRadarInfo[]> {
  const radars = await db
    .selectFrom("radar")
    .select(["id", "name"])
    .orderBy("name asc")
    .orderBy("id asc")
    .execute();
  return radars;
}

export async function updateBlip(
  radarId: number,
  techId: number,
  ring: number
): Promise<void> {
  if (isNaN(ring)) {
    await db
      .deleteFrom("blip")
      .where("radar_id", "=", radarId)
      .where("tech_id", "=", techId)
      .execute();

    return;
  }

  try {
    await db
      .insertInto("blip")
      .values({
        radar_id: radarId,
        tech_id: techId,
        ring,
      })
      .execute();
  } catch {
    await db
      .updateTable("blip")
      .set({ ring })
      .where("radar_id", "=", radarId)
      .where("tech_id", "=", techId)
      .execute();
  }
}

export async function createRadar(id: number): Promise<RadarData> {
  const radar = await db
    .selectFrom("radar")
    .select(["id", "name", "created_at"])
    .where("id", "=", id)
    .executeTakeFirstOrThrow();

  const rows = await db
    .selectFrom("blip")
    .innerJoin("tech", "blip.tech_id", "tech.id")
    .innerJoin("radar", "blip.radar_id", "radar.id")
    .select([
      "blip.id",
      "tech.name",
      "tech.id as tech_id",
      "tech.quadrant",
      "tech.url",
      "tech.description",
      "blip.ring",
    ])
    .where("radar.id", "=", id)
    .orderBy("tech.quadrant asc")
    .orderBy("blip.ring asc")
    .orderBy("tech.name asc")
    .execute();

  const techs = rows.map((row) => rowMapper(row));

  const now = DateTime.fromJSDate(radar.created_at as Date);

  const ret = {
    id: radar.id,
    date: now.toISO(),
    name: radar.name,
    quadrants: [
      { name: quadrantName(0) },
      { name: quadrantName(1) },
      { name: quadrantName(2) },
      { name: quadrantName(3) },
    ],
    rings: [
      { name: ringName(0), color: "#5ba300" },
      { name: ringName(1), color: "#009eb0" },
      { name: ringName(2), color: "#c7ba00" },
      { name: ringName(3), color: "#e09b96" },
    ],
    entries: techs,
    url: "https://dr-kobros.com",
  } satisfies RadarData;

  return ret;
}
