import Radar from "@/app/radar/[id]/Radar";
import * as radars from "@/services/radar";
import * as techs from "@/services/tech";
import { getAllTechs } from "@/services/tech";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

type Props = {
  params: {
    id: string;
  };
};

const getRadar = cache(async (id: string) => {
  const radar = await radars.createRadar(parseInt(id, 10));

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

const createTech = async (prevState: techs.Tech[], formData: FormData) => {
  "use server";
  const tech = {
    name: formData.get("name") as string,
    quadrant: parseInt(formData.get("quadrant") as string, 10),
    // url: formData.get("url") as string,
    // description: formData.get("description") as string,
  };

  await techs.createTech({
    name: tech.name,
    quadrant: tech.quadrant,
  });

  return techs.getAllTechs();
};

const updateBlip = async (prevState: radars.RadarData, formData: FormData) => {
  "use server";
  const tech = {
    id: parseInt(formData.get("radar") as string, 10),
    tech: parseInt(formData.get("tech") as string, 10),
    ring: parseInt(formData.get("ring") as string, 10),
  };

  console.log(tech, "TECH");

  await radars.updateBlip(tech.id, tech.tech, tech.ring);

  return radars.createRadar(tech.id);
};

export default async function RadarPage({ params }: Props) {
  const radar = await getRadar(params.id);
  const techs = await getAllTechs();

  return (
    <main>
      <Radar
        radar={radar}
        techs={techs}
        updateBlip={updateBlip}
        createTech={createTech}
      />
    </main>
  );
}
