"use client";

import RadarChart from "@/components/radar/RadarChart";
import { RadarData, Tech, updateBlip } from "@/services/radar";
import { FC, useEffect } from "react";

import styles from "./Radar.module.css";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";

type Props = {
  radar: RadarData;
  techs: Tech[];
  blipper: (prevState: any, formData: FormData) => Promise<RadarData>;
};

const rings = [
  {
    value: 0,
    name: "ADOPT",
  },
  {
    value: 1,
    name: "TRIAL",
  },
  {
    value: 2,
    name: "ASSESS",
  },
  {
    value: 3,
    name: "HOLD",
  },
];

const Radar: FC<Props> = ({ radar, techs, blipper }) => {
  const [state, action] = useFormState(blipper, radar);

  return (
    <>
      <form className={styles.form} action={action}>
        <input type="hidden" name="radar" value={radar.id} />
        <select name="tech">
          <option value="">Select a tech</option>
          {techs.map((tech) => {
            return (
              <option key={tech.id} value={tech.id}>
                {tech.name}
              </option>
            );
          })}
        </select>
        <select name="ring">
          <option value="">Select ring</option>
          {rings.map((ring) => {
            return (
              <option key={ring.value} value={ring.value}>
                {ring.name}
              </option>
            );
          })}
        </select>
        <button>add tech</button>
      </form>

      <RadarChart data={state} />
    </>
  );
};

export default Radar;
