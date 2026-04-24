import pg from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { DB } from "./types.js";
import { generatePublicId } from "../services/publicId.js";

async function seed() {
  const db = new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new pg.Pool({
        connectionString: process.env.DATABASE_URL,
      }),
    }),
  });

  // Seed quadrants
  await db
    .insertInto("quadrant")
    .values([
      { id: 0, name: "Languages & Frameworks" },
      { id: 1, name: "Datastores" },
      { id: 2, name: "Tools & Techniques" },
      { id: 3, name: "Platforms" },
    ])
    .onConflict(oc => oc.column("id").doNothing())
    .execute();

  // Seed rings
  await db
    .insertInto("ring")
    .values([
      { id: 0, name: "Adopt", color: "#5ba300" },
      { id: 1, name: "Trial", color: "#009eb0" },
      { id: 2, name: "Assess", color: "#c7ba00" },
      { id: 3, name: "Hold", color: "#e09b96" },
    ])
    .onConflict(oc => oc.column("id").doNothing())
    .execute();

  // Seed tech entries
  const techRows: { name: string; quadrant: number; url: string; description: string }[] = [
    {
      name: "React",
      quadrant: 0,
      url: "https://reactjs.org/",
      description: "A JavaScript library for building user interfaces.",
    },
    {
      name: "TypeScript",
      quadrant: 0,
      url: "https://www.typescriptlang.org/",
      description: "A typed superset of JavaScript that compiles to plain JavaScript.",
    },
    {
      name: "CSS",
      quadrant: 0,
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS",
      description:
        "A style sheet language used for describing the presentation of a document written in HTML or XML.",
    },
    {
      name: "HTML",
      quadrant: 0,
      url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
      description:
        "The standard markup language for documents designed to be displayed in a web browser.",
    },
    {
      name: "JavaScript",
      quadrant: 0,
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
      description: "A programming language that conforms to the ECMAScript specification.",
    },
    {
      name: "Angular",
      quadrant: 0,
      url: "https://angular.io/",
      description: "A platform for building mobile and desktop web applications.",
    },
    {
      name: "Svelte",
      quadrant: 0,
      url: "https://svelte.dev/",
      description: "A radical new approach to building user interfaces.",
    },
    {
      name: "Solid.JS",
      quadrant: 0,
      url: "https://solidjs.com/",
      description: "A declarative JavaScript library for building user interfaces.",
    },
    {
      name: "Next.js",
      quadrant: 0,
      url: "https://nextjs.org/",
      description: "A React framework for production.",
    },
    {
      name: "GitHub",
      quadrant: 3,
      url: "https://github.com/",
      description: "A platform for version control and collaboration.",
    },
    {
      name: "AWS",
      quadrant: 3,
      url: "https://aws.amazon.com/",
      description: "A comprehensive and broadly adopted cloud platform.",
    },
    {
      name: "Google Cloud",
      quadrant: 3,
      url: "https://cloud.google.com/",
      description: "A suite of cloud computing services.",
    },
    {
      name: "ChatGPT",
      quadrant: 2,
      url: "https://openai.com/chatgpt",
      description: "An AI language model developed by OpenAI.",
    },
    {
      name: "Suno",
      quadrant: 2,
      url: "https://www.suno.ai/",
      description: "A platform for AI-powered audio and video transcription.",
    },
    {
      name: "Git",
      quadrant: 2,
      url: "https://git-scm.com/",
      description: "A free and open source distributed version control system.",
    },
    {
      name: "Linux",
      quadrant: 2,
      url: "https://www.linux.org/",
      description: "An open-source Unix-like operating system.",
    },
    {
      name: "Unix",
      quadrant: 2,
      url: "https://www.unix.org/",
      description: "A family of multitasking, multiuser computer operating systems.",
    },
    {
      name: "PostgreSQL",
      quadrant: 1,
      url: "https://www.postgresql.org/",
      description: "A powerful, open source object-relational database system.",
    },
    {
      name: "MongoDB",
      quadrant: 1,
      url: "https://www.mongodb.com/",
      description: "A source-available cross-platform document-oriented database program.",
    },
    {
      name: "MariaDB",
      quadrant: 1,
      url: "https://mariadb.org/",
      description:
        "A community-developed, commercially supported fork of the MySQL relational database management system.",
    },
    {
      name: "SQLite",
      quadrant: 1,
      url: "https://www.sqlite.org/",
      description:
        "A C-language library that implements a small, fast, self-contained, high-reliability, full-featured, SQL database engine.",
    },
    {
      name: "Oracle",
      quadrant: 1,
      url: "https://www.oracle.com/database/",
      description:
        "A multi-model database management system produced and marketed by Oracle Corporation.",
    },
    {
      name: "MS SQL Server",
      quadrant: 1,
      url: "https://www.microsoft.com/en-us/sql-server",
      description: "A relational database management system developed by Microsoft.",
    },
  ];

  await db
    .insertInto("tech")
    .values(techRows.map(t => ({ ...t, public_id: generatePublicId() })))
    .onConflict(oc => oc.column("name").doNothing())
    .execute();

  // Seed radar
  await db
    .insertInto("radar")
    .values([{ name: "Pekkis", public_id: generatePublicId() }])
    .onConflict(oc => oc.column("name").doNothing())
    .execute();

  // Seed initial version (v1) for each radar that has none
  const radarsWithoutVersion = await db
    .selectFrom("radar")
    .leftJoin("radar_version", "radar.id", "radar_version.radar_id")
    .select(["radar.id"])
    .where("radar_version.id", "is", null)
    .execute();

  if (radarsWithoutVersion.length > 0) {
    await db
      .insertInto("radar_version")
      .values(
        radarsWithoutVersion.map(r => ({
          radar_id: r.id,
          version: 1,
          release_date: new Date().toISOString().slice(0, 10),
        })),
      )
      .execute();
  }

  console.log("seed data inserted successfully");

  await db.destroy();
}

seed();
