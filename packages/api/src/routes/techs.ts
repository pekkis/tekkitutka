import { Hono } from "hono";
import * as techs from "../services/tech.js";

const app = new Hono();

app.get("/", async c => {
  const allTechs = await techs.getAllTechs();
  return c.json(allTechs);
});

app.get("/:id", async c => {
  const id = parseInt(c.req.param("id"), 10);
  const tech = await techs.getTech(id);
  return c.json(tech);
});

app.get("/:id/radars", async c => {
  const id = parseInt(c.req.param("id"), 10);
  const radarList = await techs.getRadarsUsing(id);
  return c.json(radarList);
});

app.post("/", async c => {
  const body = await c.req.json<{ name: string; quadrant: number }>();
  await techs.createTech(body);
  const allTechs = await techs.getAllTechs();
  return c.json(allTechs);
});

export default app;
