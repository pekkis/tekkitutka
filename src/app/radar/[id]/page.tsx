import RadarChart from "@/components/radar/RadarChart";
import { db } from "@/services/kysely";
import { createRadar } from "@/services/radar";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

type Props = {
  params: {
    id: string;
  };
};

const getRadar = cache(async (id: string) => {
  const radar = await createRadar(parseInt(id, 10));

  return radar;
});

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  try {
    const radar = await getRadar(params.id);

    return {
      title: radar.name,
    };
  } catch {
    notFound();
  }
};

export default async function RadarPage({ params }: Props) {
  const radar = await getRadar(params.id);
  return (
    <main>
      <RadarChart data={radar} />
    </main>
  );
}
