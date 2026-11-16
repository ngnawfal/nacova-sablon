import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.js";
import { customerSchema, updateCustomerSchema } from "../lib/validations/customer.js";

export const customersRouter = Router();

customersRouter.get("/", requireAuth(["OWNER", "ADMIN"]), async (req, res) => {
  const trimmed = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const list = await prisma.customer.findMany({
    where: {
      deletedAt: null,
      ...(trimmed
        ? {
            OR: [
              { name: { contains: trimmed } },
              { phone: { contains: trimmed } },
              { company: { contains: trimmed } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
  });

  res.json({
    customers: list.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      company: c.company,
      address: c.address,
      notes: c.notes,
    })),
  });
});

customersRouter.post("/", requireAuth(["OWNER", "ADMIN"]), async (req, res) => {
  const parsed = customerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" });
    return;
  }

  const created = await prisma.customer.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      company: parsed.data.company || null,
      address: parsed.data.address || null,
      notes: parsed.data.notes || null,
    },
    select: { id: true },
  });

  res.status(201).json({ ok: true, id: created.id, message: "Pelanggan berhasil ditambahkan." });
});

customersRouter.put("/:id", requireAuth(["OWNER", "ADMIN"]), async (req, res) => {
  const id = String(req.params.id);
  const parsed = updateCustomerSchema.safeParse({ ...req.body, id });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" });
    return;
  }

  await prisma.customer.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      company: parsed.data.company || null,
      address: parsed.data.address || null,
      notes: parsed.data.notes || null,
    },
  });

  res.json({ ok: true, message: "Data pelanggan diperbarui." });
});

customersRouter.delete("/:id", requireAuth(["OWNER", "ADMIN"]), async (req, res) => {
  const id = String(req.params.id);
  await prisma.customer.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  res.json({ ok: true, message: "Pelanggan berhasil dihapus." });
});
