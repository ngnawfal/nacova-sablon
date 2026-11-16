import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../lib/auth.js";
import {
  createUserSchema,
  resetPasswordSchema,
  updateUserSchema,
} from "../lib/validations/user.js";

export const usersRouter = Router();

usersRouter.get("/", requireAuth(["OWNER"]), async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
      createdAt: true,
    },
  });
  res.json({ users });
});

usersRouter.post("/", requireAuth(["OWNER"]), async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" });
    return;
  }

  const exists = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (exists) {
    res.status(409).json({ error: "Email sudah terdaftar." });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const created = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      phone: parsed.data.phone || null,
      isActive: true,
    },
    select: { id: true },
  });

  res.status(201).json({ ok: true, id: created.id, message: "Akun karyawan berhasil dibuat." });
});

usersRouter.patch("/:id", requireAuth(["OWNER"]), async (req: AuthedRequest, res) => {
  const id = String(req.params.id);
  const parsed = updateUserSchema.safeParse({ ...req.body, id });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" });
    return;
  }

  if (req.user?.id === parsed.data.id && !parsed.data.isActive) {
    res.status(400).json({ error: "Tidak dapat menonaktifkan akun sendiri." });
    return;
  }

  const conflict = await prisma.user.findFirst({
    where: { email: parsed.data.email, id: { not: parsed.data.id } },
    select: { id: true },
  });
  if (conflict) {
    res.status(409).json({ error: "Email sudah digunakan akun lain." });
    return;
  }

  await prisma.user.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      phone: parsed.data.phone || null,
      isActive: parsed.data.isActive,
    },
  });

  res.json({ ok: true, message: "Data karyawan diperbarui." });
});

usersRouter.post("/:id/reset-password", requireAuth(["OWNER"]), async (req, res) => {
  const id = String(req.params.id);
  const parsed = resetPasswordSchema.safeParse({ ...req.body, id });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({
    where: { id: parsed.data.id },
    data: { passwordHash },
  });

  res.json({ ok: true, message: "Password berhasil direset." });
});

usersRouter.delete("/:id", requireAuth(["OWNER"]), async (req: AuthedRequest, res) => {
  const id = String(req.params.id);
  if (req.user?.id === id) {
    res.status(400).json({ error: "Tidak dapat menghapus akun yang sedang login." });
    return;
  }

  await prisma.user.update({
    where: { id },
    data: { isActive: false, deletedAt: new Date() },
  });

  res.json({ ok: true, message: "Akun karyawan dinonaktifkan." });
});
