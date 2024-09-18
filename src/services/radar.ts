import * as R from "ramda";
import { DateTime } from "luxon";
import { db } from "@/services/kysely";

function rowMapper(row) {
  return {
    id: row.id,
    quadrant: row.quadrant,
    ring: row.ring,
    name: row.name,
    active: true,
    moved: 0,
    url: row.url || `#`,
    description: row.description,
    // moved: random.pick([-1, 0, 1, 2]),
  };
}

export async function createRadar(id: number) {
  const radar = await db
    .selectFrom("radar")
    .select(["id", "name", "created_at"])
    .where("id", "=", id)
    .executeTakeFirstOrThrow();

  const rows = await db
    .selectFrom("blip")
    .innerJoin("tech", "blip.tech_id", "tech.id")
    .select([
      "blip.id",
      "tech.name",
      "tech.quadrant",
      "tech.url",
      "tech.description",
      "blip.ring",
    ])
    .execute();

  /* eslint-disable-next-line no-console -- because we want to see. */
  console.log("techs from db", rows);

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
  };

  return ret;
}
