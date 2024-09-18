"use client";

import { FC, useDeferredValue, useEffect, useId, useRef } from "react";
import { radar_visualization } from "@/services/client-radar";
import styles from "./RadarChart.module.css";
import { useResizeObserver } from "usehooks-ts";
import { RadarData } from "@/services/radar";

type Props = {
  data: RadarData;
};

const RadarChart: FC<Props> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { width } = useResizeObserver({
    ref: containerRef,
  });

  const debouncedWidth = useDeferredValue(width);

  const scale = Math.min((debouncedWidth as number) / 1500, 1);

  const id = useId();
  useEffect(() => {
    const currentSVG = svgRef.current;

    if (!scale) {
      return;
    }

    radar_visualization({
      svg_id: id,
      scale,
      repo_url: data.url,
      title: data.name,
      date: data.date,
      quadrants: data.quadrants,
      rings: data.rings,
      entries: data.entries.map((entry) => {
        return {
          quadrant: entry.quadrant,
          ring: entry.ring,
          label: entry.name,
          active: entry.active,
          link: entry.url,
          moved: entry.moved,
          description: entry.description,
        };
      }),
    });

    return () => {
      if (!currentSVG) {
        return;
      }

      currentSVG.innerHTML = "";
    };
  }, [id, data, scale]);

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.radar}>
        <svg className={styles.svg} ref={svgRef} id={id}></svg>
      </div>
    </div>
  );
};

export default RadarChart;
