import { ringName } from "@/services/labels";
import * as techs from "@/services/tech";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

type Props = {
  params: {
    id: string;
  };
};

const getTech = cache(async (id: string) => {
  const radar = await techs.getTech(parseInt(id, 10));
  return radar;
});

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  try {
    const radar = await getTech(params.id);

    return {
      title: radar.name,
    };
  } catch {
    notFound();
  }
};

export default async function TechPage({ params }: Props) {
  const tech = await getTech(params.id);
  const radars = await techs.getRadarsUsing(parseInt(params.id, 10));

  return (
    <section>
      <h1>{tech.name}</h1>

      <p>{tech.description}</p>

      {tech.url && (
        <p>
          <Link href={tech.url} target="_blank" />
        </p>
      )}

      <h2>Radars containing this tech</h2>

      <ul>
        {radars.map((radar) => (
          <li key={radar.id}>
            <Link href={`/radar/${radar.id}`}>{radar.name}</Link> -{" "}
            {ringName(radar.ring)}
          </li>
        ))}
      </ul>
    </section>
  );
}
