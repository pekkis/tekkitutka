import { Hono } from "hono";
import * as radars from "../services/radar.js";

const app = new Hono();

app.get("/", async c => {
  const allRadars = await radars.getAllRadars();
  return c.json(allRadars);
});

app.get("/:id", async c => {
  const id = parseInt(c.req.param("id"), 10);
  const versionParam = c.req.query("version");
  const version = versionParam ? parseInt(versionParam, 10) : undefined;
  const radar = await radars.getRadar(id, version);
  return c.json(radar);
});

app.get("/:id/versions/:version", async c => {
  const id = parseInt(c.req.param("id"), 10);
  const version = parseInt(c.req.param("version"), 10);
  const radar = await radars.getRadar(id, version);
  return c.json(radar);
});

app.post("/:id/versions", async c => {
  const id = parseInt(c.req.param("id"), 10);
  const body = await c.req.json<{
    releaseDate: string;
    label?: string | null;
    copyBlips?: boolean;
  }>();
  const newVersion = await radars.releaseNewVersion(
    id,
    body.releaseDate,
    body.label ?? null,
    body.copyBlips ?? true,
  );
  return c.json(newVersion);
});

app.post("/:id/blips", async c => {
  const id = parseInt(c.req.param("id"), 10);
  const body = await c.req.json<{ techId: number; ring: number; versionId?: number }>();
  const versionId = body.versionId ?? (await radars.getLatestVersionId(id));
  await radars.updateBlip(versionId, body.techId, body.ring);
  const radar = await radars.getRadar(id);
  return c.json(radar);
});

export default app;
