const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  radars: {
    getAll: () => fetchJson<{ id: number; name: string }[]>("/api/radars"),

    get: (id: number) => fetchJson<RadarData>(`/api/radars/${id}`),

    updateBlip: (radarId: number, techId: number, ring: number) =>
      fetchJson<RadarData>(`/api/radars/${radarId}/blips`, {
        method: "POST",
        body: JSON.stringify({ techId, ring }),
      }),
  },

  techs: {
    getAll: () => fetchJson<Tech[]>("/api/techs"),

    get: (id: number) => fetchJson<Tech>(`/api/techs/${id}`),

    getRadars: (id: number) =>
      fetchJson<{ id: number; name: string; ring: number }[]>(`/api/techs/${id}/radars`),

    create: (name: string, quadrant: number) =>
      fetchJson<Tech[]>("/api/techs", {
        method: "POST",
        body: JSON.stringify({ name, quadrant }),
      }),
  },

  labels: {
    quadrants: () => fetchJson<{ id: number; name: string }[]>("/api/labels/quadrants"),

    rings: () => fetchJson<{ id: number; name: string; color: string }[]>("/api/labels/rings"),
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
