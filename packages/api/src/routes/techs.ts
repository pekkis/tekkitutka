import { Hono } from "hono";
import * as techs from "../services/tech.js";

const app = new Hono();

app.get("/", async c => {
  const allTechs = await techs.getAllTechs();
  return c.json(allTechs);
});

app.get("/:publicId", async c => {
  const publicId = c.req.param("publicId");
  const tech = await techs.getTech(publicId);
  return c.json(tech);
});

app.get("/:publicId/radars", async c => {
  const publicId = c.req.param("publicId");
  const radarList = await techs.getRadarsUsing(publicId);
  return c.json(radarList);
});

app.post("/", async c => {
  const body = await c.req.json<{ name: string; quadrant: number }>();
  await techs.createTech(body);
  const allTechs = await techs.getAllTechs();
  return c.json(allTechs);
});

export default app;
