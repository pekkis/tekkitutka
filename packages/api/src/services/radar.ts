import { DateTime } from "luxon";
import { db } from "./kysely.js";
import { getAllQuadrants, getAllRings } from "./labels.js";

type ResultSetRow = {
  id: number;
  quadrant: number;
  ring: number;
  name: string;
  url: string | null;
  description: string | null;
  tech_id: number;
  tech_public_id: string;
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
  techPublicId: string;
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

export type RadarVersionInfo = {
  version: number;
  label: string | null;
  releaseDate: string;
  createdAt: string;
  updatedAt: string;
};

export type BasicRadarInfo = {
  publicId: string;
  name: string;
  latestVersion: RadarVersionInfo | null;
};

export type BasicRadarData = {
  publicId: string;
  name: string;
  date: string | null;
};

export type RadarData = BasicRadarData & {
  quadrants: Quadrant[];
  rings: Ring[];
  entries: RadarEntry[];
  url: string;
  version: number;
  label: string | null;
  releaseDate: string;
  versions: RadarVersionInfo[];
};

function toIsoDate(value: Date | string): string {
  if (value instanceof Date) {
    return DateTime.fromJSDate(value).toISODate() ?? value.toISOString().slice(0, 10);
  }
  return value;
}

function toIsoDateTime(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return new Date(value).toISOString();
}

function mapVersionInfo(v: {
  version: number;
  label: string | null;
  release_date: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
}): RadarVersionInfo {
  return {
    version: v.version,
    label: v.label,
    releaseDate: toIsoDate(v.release_date),
    createdAt: toIsoDateTime(v.created_at),
    updatedAt: toIsoDateTime(v.updated_at),
  };
}

async function resolveRadarId(publicId: string): Promise<number> {
  const row = await db
    .selectFrom("radar")
    .select(["id"])
    .where("public_id", "=", publicId)
    .executeTakeFirstOrThrow();
  return row.id;
}

export async function getAllRadars(): Promise<BasicRadarInfo[]> {
  const radars = await db
    .selectFrom("radar")
    .select(["id", "public_id", "name"])
    .orderBy("name asc")
    .orderBy("id asc")
    .execute();

  const result: BasicRadarInfo[] = [];
  for (const r of radars) {
    const latest = await db
      .selectFrom("radar_version")
      .select(["version", "label", "release_date", "created_at", "updated_at"])
      .where("radar_id", "=", r.id)
      .orderBy("version", "desc")
      .limit(1)
      .executeTakeFirst();
    result.push({
      publicId: r.public_id,
      name: r.name,
      latestVersion: latest ? mapVersionInfo(latest) : null,
    });
  }
  return result;
}

async function getVersionRow(
  radarId: number,
  version: number,
): Promise<{
  id: number;
  version: number;
  label: string | null;
  release_date: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
}> {
  return db
    .selectFrom("radar_version")
    .select(["id", "version", "label", "release_date", "created_at", "updated_at"])
    .where("radar_id", "=", radarId)
    .where("version", "=", version)
    .executeTakeFirstOrThrow();
}

async function getLatestVersionRow(radarId: number): Promise<{
  id: number;
  version: number;
  label: string | null;
  release_date: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
}> {
  return db
    .selectFrom("radar_version")
    .select(["id", "version", "label", "release_date", "created_at", "updated_at"])
    .where("radar_id", "=", radarId)
    .orderBy("version", "desc")
    .limit(1)
    .executeTakeFirstOrThrow();
}

export async function updateBlip(
  publicId: string,
  techPublicId: string,
  ring: number,
  version?: number,
): Promise<void> {
  const radarId = await resolveRadarId(publicId);
  const radarVersion =
    version === undefined
      ? await getLatestVersionRow(radarId)
      : await getVersionRow(radarId, version);

  const tech = await db
    .selectFrom("tech")
    .select(["id"])
    .where("public_id", "=", techPublicId)
    .executeTakeFirstOrThrow();

  if (isNaN(ring)) {
    await db
      .deleteFrom("blip")
      .where("radar_version_id", "=", radarVersion.id)
      .where("tech_id", "=", tech.id)
      .execute();
  } else {
    try {
      await db
        .insertInto("blip")
        .values({
          radar_version_id: radarVersion.id,
          tech_id: tech.id,
          ring,
        })
        .execute();
    } catch {
      await db
        .updateTable("blip")
        .set({ ring })
        .where("radar_version_id", "=", radarVersion.id)
        .where("tech_id", "=", tech.id)
        .execute();
    }
  }

  await db
    .updateTable("radar_version")
    .set({ updated_at: new Date() })
    .where("id", "=", radarVersion.id)
    .execute();
}

export async function releaseNewVersion(
  publicId: string,
  releaseDate: string,
  label: string | null = null,
  copyBlips = true,
): Promise<RadarVersionInfo> {
  const radarId = await resolveRadarId(publicId);

  const previous = await db
    .selectFrom("radar_version")
    .select(["id", "version"])
    .where("radar_id", "=", radarId)
    .orderBy("version", "desc")
    .limit(1)
    .executeTakeFirst();

  const nextVersion = (previous?.version ?? 0) + 1;

  const inserted = await db
    .insertInto("radar_version")
    .values({
      radar_id: radarId,
      version: nextVersion,
      label,
      release_date: releaseDate,
    })
    .returning(["id", "version", "label", "release_date", "created_at", "updated_at"])
    .executeTakeFirstOrThrow();

  if (copyBlips && previous) {
    const previousBlips = await db
      .selectFrom("blip")
      .select(["tech_id", "ring"])
      .where("radar_version_id", "=", previous.id)
      .execute();

    if (previousBlips.length > 0) {
      await db
        .insertInto("blip")
        .values(
          previousBlips.map(b => ({
            radar_version_id: inserted.id,
            tech_id: b.tech_id,
            ring: b.ring,
          })),
        )
        .execute();
    }
  }

  return mapVersionInfo(inserted);
}

function rowMapper(row: ResultSetRow, prevRingByTech: Map<number, number>): RadarEntry {
  let moved: 0 | -1 | 1 | 2 = 0;
  if (prevRingByTech.size === 0) {
    moved = 0;
  } else if (!prevRingByTech.has(row.tech_id)) {
    moved = 2;
  } else {
    const prev = prevRingByTech.get(row.tech_id)!;
    if (row.ring < prev) moved = 1;
    else if (row.ring > prev) moved = -1;
  }

  return {
    id: row.id,
    quadrant: row.quadrant as QuadrantId,
    ring: row.ring as RingId,
    name: row.name,
    active: true,
    moved,
    url: row.url || `#`,
    description: row.description,
    techPublicId: row.tech_public_id,
  };
}

export async function getRadar(publicId: string, version?: number): Promise<RadarData> {
  const radar = await db
    .selectFrom("radar")
    .select(["id", "public_id", "name"])
    .where("public_id", "=", publicId)
    .executeTakeFirstOrThrow();

  const radarVersion =
    version === undefined
      ? await getLatestVersionRow(radar.id)
      : await getVersionRow(radar.id, version);

  // Previous version (one lower) for moved diff
  const prevVersion = await db
    .selectFrom("radar_version")
    .select(["id"])
    .where("radar_id", "=", radar.id)
    .where("version", "<", radarVersion.version)
    .orderBy("version", "desc")
    .limit(1)
    .executeTakeFirst();

  const prevRingByTech = new Map<number, number>();
  if (prevVersion) {
    const prevBlips = await db
      .selectFrom("blip")
      .select(["tech_id", "ring"])
      .where("radar_version_id", "=", prevVersion.id)
      .execute();
    for (const b of prevBlips) prevRingByTech.set(b.tech_id, b.ring);
  }

  const rows = await db
    .selectFrom("blip")
    .innerJoin("tech", "blip.tech_id", "tech.id")
    .select([
      "blip.id",
      "tech.name",
      "tech.id as tech_id",
      "tech.public_id as tech_public_id",
      "tech.quadrant",
      "tech.url",
      "tech.description",
      "blip.ring",
    ])
    .where("blip.radar_version_id", "=", radarVersion.id)
    .orderBy("tech.quadrant asc")
    .orderBy("blip.ring asc")
    .orderBy("tech.name asc")
    .execute();

  const techs = rows.map(row => rowMapper(row, prevRingByTech));

  const allVersionsRows = await db
    .selectFrom("radar_version")
    .select(["version", "label", "release_date", "created_at", "updated_at"])
    .where("radar_id", "=", radar.id)
    .orderBy("version", "desc")
    .execute();

  const quadrants = await getAllQuadrants();
  const rings = await getAllRings();

  return {
    publicId: radar.public_id,
    name: radar.name,
    date: toIsoDate(radarVersion.release_date),
    quadrants: quadrants.map(q => ({ name: q.name })),
    rings: rings.map(r => ({ name: r.name, color: r.color })),
    entries: techs,
    url: "https://dr-kobros.com",
    version: radarVersion.version,
    label: radarVersion.label,
    releaseDate: toIsoDate(radarVersion.release_date),
    versions: allVersionsRows.map(mapVersionInfo),
  } satisfies RadarData;
}
