import RadarChart from "@/components/radar/RadarChart";
import { api } from "@/services/api";
import type { RadarData, Tech } from "@/services/api";
import { useState, type FC } from "react";

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

  const handleCreateTech = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const quadrant = parseInt(formData.get("quadrant") as string, 10);
    const updatedTechs = await api.techs.create(name, quadrant);
    setCurrentTechs(updatedTechs);
  };

  const handleUpdateBlip = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const techId = parseInt(formData.get("tech") as string, 10);
    const ring = parseInt(formData.get("ring") as string, 10);
    const updatedRadar = await api.radars.updateBlip(
      currentRadar.id,
      techId,
      ring,
      currentRadar.versionId,
    );
    setCurrentRadar(updatedRadar);
  };

  const handleSwitchVersion = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const version = parseInt(event.target.value, 10);
    const updated = await api.radars.get(currentRadar.id, version);
    setCurrentRadar(updated);
  };

  const handleReleaseVersion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const releaseDate = formData.get("releaseDate") as string;
    const label = (formData.get("label") as string) || null;
    await api.radars.releaseVersion(currentRadar.id, releaseDate, label, true);
    const updated = await api.radars.get(currentRadar.id);
    setCurrentRadar(updated);
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className={styles.versionHeader}>
        <h2>
          {currentRadar.name} — v{currentRadar.version}
          {currentRadar.label ? ` (${currentRadar.label})` : ""}
        </h2>
        <p>Release date: {currentRadar.releaseDate}</p>
        {currentRadar.versions.length > 1 && (
          <label>
            View version:{" "}
            <select value={currentRadar.version} onChange={handleSwitchVersion}>
              {currentRadar.versions.map(v => (
                <option key={v.versionId} value={v.version}>
                  v{v.version}
                  {v.label ? ` — ${v.label}` : ""} ({v.releaseDate})
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      Create tech
      <form className={styles.form} onSubmit={handleCreateTech}>
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
      <form className={styles.form} onSubmit={handleUpdateBlip}>
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
      Release new version
      <form className={styles.form} onSubmit={handleReleaseVersion}>
        <input type="date" name="releaseDate" defaultValue={today} required />
        <input type="text" name="label" placeholder="Label (optional, e.g. 2026-Q2)" />
        <button>release</button>
      </form>
      <RadarChart data={currentRadar} />
    </>
  );
};

export default Radar;
