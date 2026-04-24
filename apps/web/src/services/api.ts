import ky from "ky";

const apiUrl = import.meta.env.SSR
  ? process.env.API_URL || import.meta.env.PUBLIC_API_URL || "http://localhost:3001"
  : import.meta.env.PUBLIC_API_URL || "http://localhost:3001";

const client = ky.create({
  prefix: apiUrl,
});

export const api = {
  radars: {
    getAll: () => client.get("api/radars").json<RadarListItem[]>(),

    get: (publicId: string) => client.get(`api/radars/${publicId}`).json<RadarData>(),

    getVersion: (publicId: string, version: number) =>
      client.get(`api/radars/${publicId}/versions/${version}`).json<RadarData>(),

    releaseVersion: (
      publicId: string,
      releaseDate: string,
      label?: string | null,
      copyBlips = true,
    ) =>
      client
        .post(`api/radars/${publicId}/versions`, {
          json: { releaseDate, label: label ?? null, copyBlips },
        })
        .json<RadarVersionInfo>(),

    updateBlip: (radarPublicId: string, techPublicId: string, ring: number, version?: number) =>
      client
        .post(`api/radars/${radarPublicId}/blips`, {
          json: { techPublicId, ring, ...(version === undefined ? {} : { version }) },
        })
        .json<RadarData>(),
  },

  techs: {
    getAll: () => client.get("api/techs").json<Tech[]>(),

    get: (publicId: string) => client.get(`api/techs/${publicId}`).json<Tech>(),

    getRadars: (publicId: string) =>
      client
        .get(`api/techs/${publicId}/radars`)
        .json<{ publicId: string; name: string; ring: number; version: number }[]>(),

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
  techPublicId: string;
};

export type Quadrant = {
  name: string;
};

export type Ring = {
  name: string;
  color: string;
};

export type RadarVersionInfo = {
  version: number;
  label: string | null;
  releaseDate: string;
  createdAt: string;
  updatedAt: string;
};

export type RadarListItem = {
  publicId: string;
  name: string;
  latestVersion: RadarVersionInfo | null;
};

export type RadarData = {
  publicId: string;
  name: string;
  date: string | null;
  quadrants: Quadrant[];
  rings: Ring[];
  entries: RadarEntry[];
  url: string;
  version: number;
  label: string | null;
  releaseDate: string;
  versions: RadarVersionInfo[];
};

export type Tech = {
  publicId: string;
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
