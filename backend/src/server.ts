import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { attendancesRouter } from "./routes/attendances.js";
import { customersRouter } from "./routes/customers.js";
import { materialsRouter } from "./routes/materials.js";
import { reportsRouter } from "./routes/reports.js";

const app = express();
app.set("trust proxy", 1);
const PORT = Number(process.env.PORT) || 4000;
const FRONTEND_ORIGINS = (
  process.env.FRONTEND_ORIGIN || "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: FRONTEND_ORIGINS,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "nacova-backend", sprint: 2 });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/attendances", attendancesRouter);
app.use("/api/customers", customersRouter);
app.use("/api/materials", materialsRouter);
app.use("/api/reports", reportsRouter);

if (process.env.SERVE_FRONTEND === "true") {
  const frontendDist = path.resolve(
    process.env.FRONTEND_DIST_DIR || path.join(import.meta.dirname, "../../frontend/dist")
  );
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if ((req.method === "GET" || req.method === "HEAD") && !req.path.startsWith("/api")) {
      res.sendFile(path.join(frontendDist, "index.html"));
      return;
    }
    next();
  });
}

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    void _next;
    res.status(500).json({ error: err.message || "Terjadi kesalahan pada server." });
  }
);

app.listen(PORT, () => {
  console.log(`Nacova Backend API (Sprint 2) listening on http://127.0.0.1:${PORT}`);
});
