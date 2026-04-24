import { Hono } from "hono";
import * as radars from "../services/radar.js";

const app = new Hono();

app.get("/", async c => {
  const allRadars = await radars.getAllRadars();
  return c.json(allRadars);
});

app.get("/:publicId", async c => {
  const publicId = c.req.param("publicId");
  const radar = await radars.getRadar(publicId);
  return c.json(radar);
});

app.get("/:publicId/versions/:version", async c => {
  const publicId = c.req.param("publicId");
  const version = parseInt(c.req.param("version"), 10);
  const radar = await radars.getRadar(publicId, version);
  return c.json(radar);
});

app.post("/:publicId/versions", async c => {
  const publicId = c.req.param("publicId");
  const body = await c.req.json<{
    releaseDate: string;
    label?: string | null;
    copyBlips?: boolean;
  }>();
  const newVersion = await radars.releaseNewVersion(
    publicId,
    body.releaseDate,
    body.label ?? null,
    body.copyBlips ?? true,
  );
  return c.json(newVersion);
});

app.post("/:publicId/blips", async c => {
  const publicId = c.req.param("publicId");
  const body = await c.req.json<{
    techPublicId: string;
    ring: number;
    version?: number;
  }>();
  await radars.updateBlip(publicId, body.techPublicId, body.ring, body.version);
  const radar = await radars.getRadar(publicId, body.version);
  return c.json(radar);
});

export default app;
