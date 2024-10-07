"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
require("dotenv/config");
var sync_1 = require("csv-parse/sync");
var node_fs_1 = require("node:fs");
var R = require("ramda");
var postgres_kysely_1 = require("@vercel/postgres-kysely");
exports.db = (0, postgres_kysely_1.createKysely)();
console.log("WRITING RADAR CONFIG...");
var quadrantMap = {
    Framework: 0,
    Infrastructure: 1,
    "Datastores & DataManagement": 2,
    "Programming Language": 3,
};
var ringMap = {
    Adopt: 0,
    Trial: 1,
    Assess: 2,
    Hold: 3,
};
var input = node_fs_1.default.readFileSync("radar.csv", "utf8");
var records = (0, sync_1.parse)(input, {
    columns: true,
    skip_empty_lines: true,
    delimiter: [";", ","],
});
var set = new Set();
records.forEach(function (record) {
    set.add(record.Quadrant);
});
console.log("RECORDS", records);
for (var _i = 0, records_1 = records; _i < records_1.length; _i++) {
    var record = records_1[_i];
    var quadrantNumber = quadrantMap[record.Quadrant];
    console.log(quadrantNumber);
    console.log(record);
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
var json = records.map(function (record) {
    if (ringMap[record.Ring] === undefined ||
        quadrantMap[record.Quadrant] === undefined) {
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
var inversed = R.reverse(json);
var deduped = R.uniqBy(R.prop("label"), inversed);
var json2 = {
    date: "2024.08",
    entries: deduped,
};
console.log("WROTE RADAR CONFIG...");
node_fs_1.default.writeFileSync("./docs/config.json", JSON.stringify(json2, null, 2));
