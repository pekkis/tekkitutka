import RadarChart from "@/components/radar/RadarChart";
import { createRadar, getAllTechs, updateBlip } from "@/services/radar";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import styles from "./page.module.css";
import { useFormState } from "react-dom";
import Radar from "@/app/radar/[id]/Radar";

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

const blipper = async (prevState, formData: FormData) => {
  "use server";
  const tech = {
    id: parseInt(formData.get("radar") as string, 10),
    tech: parseInt(formData.get("tech") as string, 10),
    ring: parseInt(formData.get("ring") as string, 10),
  };

  console.log(tech, "TECH");

  await updateBlip(tech.id, tech.tech, tech.ring);

  const radar = await createRadar(tech.id);

  return radar;
};

export default async function RadarPage({ params }: Props) {
  const radar = await getRadar(params.id);
  const techs = await getAllTechs();

  return (
    <main>
      <Radar radar={radar} techs={techs} blipper={blipper} />
    </main>
  );
}
