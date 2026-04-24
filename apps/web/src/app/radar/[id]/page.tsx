import Radar from "@/app/radar/[id]/Radar";
import { api } from "@/services/api";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const getRadar = cache(async (id: string) => {
  const radar = await api.radars.get(parseInt(id, 10));
  return radar;
});

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  try {
    const { id } = await params;
    const radar = await getRadar(id);

    return {
      title: radar.name,
    };
  } catch {
    notFound();
  }
};

export default async function RadarPage({ params }: Props) {
  const { id } = await params;
  const radar = await getRadar(id);
  const techs = await api.techs.getAll();

  return (
    <main>
      <Radar radar={radar} techs={techs} />
    </main>
  );
}
