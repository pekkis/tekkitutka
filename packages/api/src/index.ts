import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import radars from "./routes/radars.js";
import techs from "./routes/techs.js";
import labels from "./routes/labels.js";

const app = new Hono();

app.use("/*", cors());

app.route("/api/radars", radars);
app.route("/api/techs", techs);
app.route("/api/labels", labels);

const port = parseInt(process.env.PORT || "3001", 10);

serve({ fetch: app.fetch, port }, info => {
  console.log(`API server running on http://localhost:${info.port}`);
});
