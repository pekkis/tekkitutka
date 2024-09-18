import { getAllRadars } from "@/services/radar";
import Link from "next/link";

export default async function Home() {
  const radars = await getAllRadars();

  return (
    <>
      <h1>All tech radars</h1>
      <ul>
        {radars.map((radar) => {
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
