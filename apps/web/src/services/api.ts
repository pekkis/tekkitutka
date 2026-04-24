import ky from "ky";

const apiUrl = import.meta.env.SSR
  ? process.env.API_URL || import.meta.env.PUBLIC_API_URL || "http://localhost:3001"
  : import.meta.env.PUBLIC_API_URL || "http://localhost:3001";

const client = ky.create({
  prefix: apiUrl,
});

export const api = {
  radars: {
    getAll: () => client.get("api/radars").json<{ id: number; name: string }[]>(),

    get: (id: number) => client.get(`api/radars/${id}`).json<RadarData>(),

    updateBlip: (radarId: number, techId: number, ring: number) =>
      client.post(`api/radars/${radarId}/blips`, { json: { techId, ring } }).json<RadarData>(),
  },

  techs: {
    getAll: () => client.get("api/techs").json<Tech[]>(),

    get: (id: number) => client.get(`api/techs/${id}`).json<Tech>(),

    getRadars: (id: number) =>
      client.get(`api/techs/${id}/radars`).json<{ id: number; name: string; ring: number }[]>(),

    create: (name: string, quadrant: number) =>
      client.post("api/techs", { json: { name, quadrant } }).json<Tech[]>(),
  },

  labels: {
    quadrants: () => client.get("api/labels/quadrants").json<{ id: number; name: string }[]>(),

    rings: () =>
      client.get("api/labels/rings").json<{ id: number; name: string; color: string }[]>(),
  },
};

// Re-export types that the frontend needs
export type RadarEntry = {
  id: number;
  quadrant: 0 | 1 | 2 | 3;
  ring: 0 | 1 | 2 | 3;
  name: string;
  active: boolean;
  moved: 0 | -1 | 1 | 2;
  url: string;
  description: string | null;
  techId: number;
};

export type Quadrant = {
  name: string;
};

export type Ring = {
  name: string;
  color: string;
};

export type RadarData = {
  id: number;
  name: string;
  date: string | null;
  quadrants: Quadrant[];
  rings: Ring[];
  entries: RadarEntry[];
  url: string;
};

export type Tech = {
  id: number;
  name: string;
  quadrant: number;
  url: string | null;
  description: string | null;
};

export type RadarChartEntry = {
  quadrant: number;
  ring: number;
  label: string;
  active: boolean;
  link: string;
  moved: number;
  description: string | null;
};

export type RadarConfiguration = {
  entries: RadarChartEntry[];
  width?: number;
  height?: number;
  svg_id: string;
  colors?: {
    background: string;
    grid: string;
    inactive: string;
  };
  print_layout?: boolean;
  links_in_new_tabs?: boolean;
  repo_url?: string;
  print_ring_descriptions_table?: boolean;
  scale: number;
  title: string;
  date: string;
  quadrants: Quadrant[];
  rings: Ring[];
};
