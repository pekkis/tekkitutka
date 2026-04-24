import { Hono } from "hono";
import * as labels from "../services/labels.js";

const app = new Hono();

app.get("/quadrants", async c => {
  const quadrants = await labels.getAllQuadrants();
  return c.json(quadrants);
});

app.get("/rings", async c => {
  const rings = await labels.getAllRings();
  return c.json(rings);
});

export default app;
