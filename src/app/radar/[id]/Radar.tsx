"use client";

import RadarChart from "@/components/radar/RadarChart";
import { RadarData } from "@/services/radar";
import { FC } from "react";

import { useFormState } from "react-dom";
import styles from "./Radar.module.css";
import { Tech } from "@/services/tech";
import { quadrantName } from "@/services/labels";
import { groupBy } from "ramda";

type Props = {
  radar: RadarData;
  techs: Tech[];
  updateBlip: (prevState: RadarData, formData: FormData) => Promise<RadarData>;
  createTech: (prevState: Tech[], formData: FormData) => Promise<Tech[]>;
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

const Radar: FC<Props> = ({ radar, techs, updateBlip, createTech }) => {
  const [currentTechs, createTechAction] = useFormState(createTech, techs);
  const [currentRadar, updateBlipAction] = useFormState(updateBlip, radar);

  const grouped = groupBy<Tech>(
    (tech: Tech) => tech.quadrant.toString(),
    currentTechs
  );

  return (
    <>
      Create tech
      <form className={styles.form} action={createTechAction}>
        <input type="text" name="name" placeholder="Tech name" />
        <select name="quadrant">
          <option value="">Select a quadrant</option>
          <option value="0">{quadrantName(0)}</option>
          <option value="1">{quadrantName(1)}</option>
          <option value="2">{quadrantName(2)}</option>
          <option value="3">{quadrantName(3)}</option>
        </select>
        <button>add tech</button>
      </form>
      Position blip
      <form className={styles.form} action={updateBlipAction}>
        <input type="hidden" name="radar" value={radar.id} />
        <select name="tech">
          <option value="">Select a tech</option>

          {[0, 1, 2, 3].map((quadrant) => {
            return (
              <optgroup key={quadrant} label={quadrantName(quadrant)}>
                {(grouped[quadrant.toString()] as Tech[]).map((tech) => {
                  return (
                    <option key={tech.id} value={tech.id}>
                      {tech.name}
                    </option>
                  );
                })}
              </optgroup>
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
      <RadarChart data={currentRadar} />
    </>
  );
};

export default Radar;
