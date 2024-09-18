import { FC } from "react";
import RadarChart from "./RadarChart";
import { useQuery } from "@tanstack/react-query";
import { getRadarData } from "../services/radar";
import Spinner from "../Spinner";

type Props = {
  id: string;
};

const Radar: FC<Props> = ({ id }) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["radars", id],
    queryFn: async () => {
      return getRadarData(id);
    },
  });

  if (isLoading) {
    return (
      <>
        <Spinner />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Spinner /> Error loading radar data. Open developer tools and try to
        debug. On failure, utter an inhumane curse in frustration and then call
        the teacher to help you debug.
      </>
    );
  }

  if (!data) {
    return <>No data for some reason...</>;
  }

  return (
    <section>
      <h2>Radar: {data.name}</h2>
      <RadarChart data={data} />
    </section>
  );
};

export default Radar;
