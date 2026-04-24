"use client";

import RadarChart from "@/components/radar/RadarChart";
import { api, RadarData, Tech } from "@/services/api";
import { FC, useState } from "react";

import styles from "./Radar.module.css";
import { groupBy } from "ramda";

type Props = {
  radar: RadarData;
  techs: Tech[];
};

const Radar: FC<Props> = ({ radar, techs }) => {
  const [currentTechs, setCurrentTechs] = useState(techs);
  const [currentRadar, setCurrentRadar] = useState(radar);

  const grouped = groupBy<Tech>((tech: Tech) => tech.quadrant.toString(), currentTechs);

  const handleCreateTech = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const quadrant = parseInt(formData.get("quadrant") as string, 10);
    const updatedTechs = await api.techs.create(name, quadrant);
    setCurrentTechs(updatedTechs);
  };

  const handleUpdateBlip = async (formData: FormData) => {
    const techId = parseInt(formData.get("tech") as string, 10);
    const ring = parseInt(formData.get("ring") as string, 10);
    const updatedRadar = await api.radars.updateBlip(radar.id, techId, ring);
    setCurrentRadar(updatedRadar);
  };

  return (
    <>
      Create tech
      <form className={styles.form} action={handleCreateTech}>
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
      <form className={styles.form} action={handleUpdateBlip}>
        <select name="tech">
          <option value="">Select a tech</option>

          {currentRadar.quadrants.map((q, quadrant) => {
            return (
              <optgroup key={quadrant} label={q.name}>
                {(grouped[quadrant.toString()] as Tech[])?.map(tech => {
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
