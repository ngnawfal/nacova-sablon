import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import {
  COOKIE_NAME,
  extractToken,
  signSessionToken,
  verifySessionToken,
} from "../lib/auth.js";
import type { RoleType } from "../lib/utils/business-rules.js";

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Email dan password wajib diisi." });
    return;
  }

  const user = await prisma.user.findFirst({
    where: { email: parsed.data.email, deletedAt: null },
  });
  if (!user || !user.isActive) {
    res.status(401).json({ error: "Email atau password salah, atau akun tidak aktif." });
    return;
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Email atau password salah, atau akun tidak aktif." });
    return;
  }

  const sessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as RoleType,
  };
  const token = await signSessionToken(sessionUser);

  const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.json({ ok: true, user: sessionUser });
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ ok: true });
});

authRouter.get("/me", async (req, res) => {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await verifySessionToken(token);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({ user });
});
