import { api } from "@/services/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const radars = await api.radars.getAll();

  return (
    <>
      <h1>All tech radars</h1>
      <ul>
        {radars.map(radar => {
          return (
            <li key={radar.id}>
              <Link href={`/radar/${radar.id}`}>{radar.name}</Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
