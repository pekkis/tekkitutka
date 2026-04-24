import { Hono } from "hono";
import * as radars from "../services/radar.js";

const app = new Hono();

app.get("/", async c => {
  const allRadars = await radars.getAllRadars();
  return c.json(allRadars);
});

app.get("/:id", async c => {
  const id = parseInt(c.req.param("id"), 10);
  const radar = await radars.createRadar(id);
  return c.json(radar);
});

app.post("/:id/blips", async c => {
  const id = parseInt(c.req.param("id"), 10);
  const body = await c.req.json<{ techId: number; ring: number }>();
  await radars.updateBlip(id, body.techId, body.ring);
  const radar = await radars.createRadar(id);
  return c.json(radar);
});

export default app;
