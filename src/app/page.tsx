import { db } from "@/services/kysely";
import Link from "next/link";

export default async function Home() {
  const radars = await db.selectFrom("radar").select(["id", "name"]).execute();

  return (
    <div>
      <h1>Tekkitutkat!</h1>
      <main>
        <ul>
          {radars.map((radar) => {
            return (
              <li key={radar.id}>
                <Link href={`/radar/${radar.id}`}>{radar.name}</Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
