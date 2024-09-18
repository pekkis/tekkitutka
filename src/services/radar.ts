import * as R from "ramda";
import { DateTime } from "luxon";
import { db } from "@/services/kysely";

type ResultSetRow = {
  id: number;
  quadrant: number;
  ring: number;
  name: string;
  // active: boolean;
  // moved: number;
  url: string | null;
  description: string | null;
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
};

export type Quadrant = {
  name: string;
};

export type Ring = {
  name: string;
  color: string;
};

export type RadarConfiguration = {
  entries: RadarEntry[];
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
  const radars = await db.selectFrom("radar").select(["id", "name"]).execute();
  return radars;
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
      "tech.quadrant",
      "tech.url",
      "tech.description",
      "blip.ring",
    ])
    .where("radar.id", "=", id)
    .execute();

  const techs = rows.map((row) => rowMapper(row));

  const inversed = R.reverse(techs);
  const deduped = R.uniqBy(R.prop("id"), inversed);
  const filtered = deduped.filter((tech) => tech);

  const now = DateTime.fromJSDate(radar.created_at as Date);

  const ret = {
    id: 1,
    date: now.toISO(),
    name: radar.name,
    quadrants: [
      { name: "Languages & Frameworks" },
      { name: "Datastores" },
      { name: "Tools & Techniques" },
      { name: "Platforms" },
    ],
    rings: [
      { name: "ADOPT", color: "#5ba300" },
      { name: "TRIAL", color: "#009eb0" },
      { name: "ASSESS", color: "#c7ba00" },
      { name: "HOLD", color: "#e09b96" },
    ],
    entries: filtered,
    url: "https://dr-kobros.com",
  } satisfies RadarData;

  return ret;
}
