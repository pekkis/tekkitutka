import { api } from "@/services/api";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const getTech = cache(async (id: string) => {
  const tech = await api.techs.get(parseInt(id, 10));
  return tech;
});

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  try {
    const { id } = await params;
    const tech = await getTech(id);

    return {
      title: tech.name,
    };
  } catch {
    notFound();
  }
};

export default async function TechPage({ params }: Props) {
  const { id } = await params;
  const tech = await getTech(id);
  const radars = await api.techs.getRadars(parseInt(id, 10));
  const rings = await api.labels.rings();

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
        {radars.map(radar => (
          <li key={radar.id}>
            <Link href={`/radar/${radar.id}`}>{radar.name}</Link> - {rings[radar.ring].name}
          </li>
        ))}
      </ul>
    </section>
  );
}
