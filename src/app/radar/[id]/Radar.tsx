"use client";

import RadarChart from "@/components/radar/RadarChart";
import { RadarData } from "@/services/radar";
import { FC } from "react";

import { useFormState } from "react-dom";
import styles from "./Radar.module.css";
import { Tech } from "@/services/tech";
import { groupBy } from "ramda";

type Props = {
  radar: RadarData;
  techs: Tech[];
  updateBlip: (prevState: RadarData, formData: FormData) => Promise<RadarData>;
  createTech: (prevState: Tech[], formData: FormData) => Promise<Tech[]>;
};

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
          {currentRadar.quadrants.map((q, i) => (
            <option key={i} value={i}>
              {q.name}
            </option>
          ))}
        </select>
        <button>add tech</button>
      </form>
      Position blip
      <form className={styles.form} action={updateBlipAction}>
        <input type="hidden" name="radar" value={radar.id} />
        <select name="tech">
          <option value="">Select a tech</option>

          {currentRadar.quadrants.map((q, quadrant) => {
            return (
              <optgroup key={quadrant} label={q.name}>
                {(grouped[quadrant.toString()] as Tech[])?.map((tech) => {
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
          {currentRadar.rings.map((ring, i) => {
            return (
              <option key={i} value={i}>
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
