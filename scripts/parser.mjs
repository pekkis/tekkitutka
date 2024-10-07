import "dotenv/config";
import { parse } from "csv-parse/sync";
import fs from "node:fs";
import * as R from "ramda";

import { createKysely } from "@vercel/postgres-kysely";

export const db = createKysely();

console.log("WRITING RADAR CONFIG...");

const quadrantMap = {
  Framework: 0,
  Infrastructure: 1,
  "Datastores & DataManagement": 2,
  "Programming Language": 3,
};

const ringMap = {
  Adopt: 0,
  Trial: 1,
  Assess: 2,
  Hold: 3,
};

const input = fs.readFileSync("radar.csv", "utf8");

const records = parse(input, {
  columns: true,
  skip_empty_lines: true,
  delimiter: [";", ","],
});

const set = new Set();

records.forEach((record) => {
  set.add(record.Quadrant);
});

await db.deleteFrom("blip").execute();
await db.deleteFrom("tech").execute();

for (const record of records) {
  const quadrantNumber = quadrantMap[record.Quadrant];

  console.log(quadrantNumber);

  const data = {
    name: record.Tech,
    quadrant: quadrantNumber,
  };

  console.log("DATA", data);

  const ret = await db
    .insertInto("tech")
    .values(data)
    .returning("id")
    .execute();

  console.log(ret);

  const ret2 = await db
    .insertInto("blip")
    .values({
      tech_id: ret[0].id,
      ring: ringMap[record.Ring],
      radar_id: 4,
    })
    .returning("id")
    .execute();

  console.log(ret2);
}

throw new Error("STOP");

/*
    {
      "quadrant": 3,
      "ring": 2,
      "label": "AWS Glue",
      "active": true,
      "moved": 0
    },
*/

const json = records.map((record) => {
  if (
    ringMap[record.Ring] === undefined ||
    quadrantMap[record.Quadrant] === undefined
  ) {
    console.log("ERROR: ", record);
    return;
  }

  return {
    quadrant: quadrantMap[record.Quadrant],
    ring: ringMap[record.Ring],
    label: record.Tech,
    active: true,
    moved: 0,
  };
});

const inversed = R.reverse(json);
const deduped = R.uniqBy(R.prop("label"), inversed);

const json2 = {
  date: "2024.08",
  entries: deduped,
};

console.log("WROTE RADAR CONFIG...");
fs.writeFileSync("./docs/config.json", JSON.stringify(json2, null, 2));
