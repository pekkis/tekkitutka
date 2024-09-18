import RadarChart from "@/components/radar/RadarChart";
import { db } from "@/services/kysely";
import { createRadar } from "@/services/radar";

type Props = {
  params: {
    id: string;
  };
};

export default async function RadarPage({ params }: Props) {
  const radar = await createRadar(parseInt(params.id, 10));

  return (
    <main>
      <RadarChart data={radar} />
    </main>
  );
}
