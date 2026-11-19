import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../lib/auth.js";
import { evaluateStockLevel } from "../lib/utils/business-rules.js";
import {
  materialSchema,
  stockMutationSchema,
  stockOpnameSchema,
  supplierSchema,
  updateMaterialSchema,
} from "../lib/validations/material.js";

export const materialsRouter = Router();

materialsRouter.get("/", requireAuth(), async (req, res) => {
  const onlyLow = req.query.low === "1";
  const rows = await prisma.material.findMany({
    where: { deletedAt: null },
    include: { supplier: { select: { id: true, name: true } } },
    orderBy: [{ name: "asc" }],
  });

  const mapped = rows.map((m) => {
    const currentStock = Number(m.currentStock);
    const minStock = Number(m.minStock);
    return {
      ...m,
      currentStock,
      minStock,
      alertStatus: evaluateStockLevel(currentStock, minStock),
    };
  });

  res.json({
    materials: onlyLow
      ? mapped.filter((m) => m.alertStatus === "HABIS" || m.alertStatus === "MENIPIS")
      : mapped,
  });
});

materialsRouter.get("/suppliers", requireAuth(), async (_req, res) => {
  const suppliers = await prisma.supplier.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true, phone: true, address: true },
  });
  res.json({ suppliers });
});

materialsRouter.post("/suppliers", requireAuth(["OWNER", "ADMIN"]), async (req, res) => {
  const parsed = supplierSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" });
    return;
  }

  const created = await prisma.supplier.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      notes: parsed.data.notes || null,
    },
    select: { id: true },
  });

  res.status(201).json({ ok: true, id: created.id, message: "Supplier ditambahkan." });
});

materialsRouter.post("/stock-in", requireAuth(["OWNER", "ADMIN"]), async (req: AuthedRequest, res) => {
  const parsed = stockMutationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" });
    return;
  }

  const qtyDec = new Prisma.Decimal(parsed.data.qty);
  try {
    const afterStock = await prisma.$transaction(async (tx) => {
      const material = await tx.material.findFirst({
        where: { id: parsed.data.materialId, deletedAt: null },
      });
      if (!material) throw new Error("Bahan tidak ditemukan.");

      const beforeStock = material.currentStock;
      const updated = await tx.material.update({
        where: { id: material.id },
        data: { currentStock: { increment: qtyDec } },
      });

      await tx.stockMovement.create({
        data: {
          materialId: material.id,
          type: "IN",
          qty: qtyDec,
          beforeStock,
          afterStock: updated.currentStock,
          reason: parsed.data.reason || "Stok masuk",
          reference: parsed.data.reference || null,
          createdById: req.user!.id,
        },
      });

      return Number(updated.currentStock);
    });

    res.json({ ok: true, afterStock, message: "Stok masuk berhasil dicatat." });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Gagal mencatat stok masuk." });
  }
});

materialsRouter.post("/stock-out", requireAuth(["OWNER", "ADMIN"]), async (req: AuthedRequest, res) => {
  const parsed = stockMutationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" });
    return;
  }

  const qtyDec = new Prisma.Decimal(parsed.data.qty);
  try {
    const afterStock = await prisma.$transaction(async (tx) => {
      const updatedCount = await tx.material.updateMany({
        where: {
          id: parsed.data.materialId,
          deletedAt: null,
          currentStock: { gte: qtyDec },
        },
        data: { currentStock: { decrement: qtyDec } },
      });

      if (updatedCount.count === 0) {
        const exists = await tx.material.findFirst({
          where: { id: parsed.data.materialId, deletedAt: null },
          select: { currentStock: true, unit: true },
        });
        if (!exists) throw new Error("Bahan tidak ditemukan.");
        throw new Error(`Stok tidak cukup (tersedia ${Number(exists.currentStock)} ${exists.unit}).`);
      }

      const updated = await tx.material.findUniqueOrThrow({
        where: { id: parsed.data.materialId },
      });
      const currentAfter = updated.currentStock;
      const beforeStock = currentAfter.plus(qtyDec);

      await tx.stockMovement.create({
        data: {
          materialId: updated.id,
          type: "OUT",
          qty: qtyDec,
          beforeStock,
          afterStock: currentAfter,
          reason: parsed.data.reason || "Pemakaian produksi",
          reference: parsed.data.reference || null,
          createdById: req.user!.id,
        },
      });

      return Number(currentAfter);
    });

    res.json({ ok: true, afterStock, message: "Stok keluar berhasil dicatat." });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Gagal mencatat stok keluar." });
  }
});

materialsRouter.post("/adjust", requireAuth(["OWNER", "ADMIN"]), async (req: AuthedRequest, res) => {
  const parsed = stockOpnameSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" });
    return;
  }

  const actualDec = new Prisma.Decimal(parsed.data.actualStock);
  try {
    const afterStock = await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<Array<{ id: string; current_stock: Prisma.Decimal }>>`
        SELECT id, current_stock FROM materials
        WHERE id = ${parsed.data.materialId} AND deleted_at IS NULL
        FOR UPDATE
      `;
      const locked = rows[0];
      if (!locked) throw new Error("Bahan tidak ditemukan.");

      const beforeStock = new Prisma.Decimal(locked.current_stock);
      const diff = actualDec.minus(beforeStock).abs();

      await tx.material.update({
        where: { id: parsed.data.materialId },
        data: { currentStock: actualDec },
      });

      await tx.stockMovement.create({
        data: {
          materialId: parsed.data.materialId,
          type: "ADJUST",
          qty: diff,
          beforeStock,
          afterStock: actualDec,
          reason: parsed.data.reason,
          createdById: req.user!.id,
        },
      });

      return Number(actualDec);
    });

    res.json({ ok: true, afterStock, message: "Stock opname berhasil dicatat." });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Gagal stock opname." });
  }
});

materialsRouter.get("/:id", requireAuth(), async (req, res) => {
  const id = String(req.params.id);
  const material = await prisma.material.findFirst({
    where: { id, deletedAt: null },
    include: {
      supplier: true,
      movements: {
        include: { createdBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      },
    },
  });
  if (!material) {
    res.status(404).json({ error: "Bahan tidak ditemukan." });
    return;
  }

  res.json({
    material: {
      ...material,
      currentStock: Number(material.currentStock),
      minStock: Number(material.minStock),
      alertStatus: evaluateStockLevel(Number(material.currentStock), Number(material.minStock)),
      movements: material.movements.map((mv) => ({
        ...mv,
        qty: Number(mv.qty),
        beforeStock: Number(mv.beforeStock),
        afterStock: Number(mv.afterStock),
      })),
    },
  });
});

materialsRouter.post("/", requireAuth(["OWNER", "ADMIN"]), async (req, res) => {
  const parsed = materialSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" });
    return;
  }

  const sku = parsed.data.sku || null;
  if (sku) {
    const exists = await prisma.material.findUnique({ where: { sku }, select: { id: true } });
    if (exists) {
      res.status(409).json({ error: "SKU bahan sudah terdaftar." });
      return;
    }
  }

  const created = await prisma.material.create({
    data: {
      name: parsed.data.name,
      sku,
      category: parsed.data.category,
      unit: parsed.data.unit,
      minStock: new Prisma.Decimal(parsed.data.minStock),
      currentStock: new Prisma.Decimal(0),
      supplierId: parsed.data.supplierId || null,
    },
    select: { id: true },
  });

  res.status(201).json({ ok: true, id: created.id, message: "Bahan berhasil ditambahkan." });
});

materialsRouter.put("/:id", requireAuth(["OWNER", "ADMIN"]), async (req, res) => {
  const id = String(req.params.id);
  const parsed = updateMaterialSchema.safeParse({ ...req.body, id });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" });
    return;
  }

  const sku = parsed.data.sku || null;
  if (sku) {
    const conflict = await prisma.material.findFirst({
      where: { sku, id: { not: parsed.data.id } },
      select: { id: true },
    });
    if (conflict) {
      res.status(409).json({ error: "SKU sudah dipakai bahan lain." });
      return;
    }
  }

  await prisma.material.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      sku,
      category: parsed.data.category,
      unit: parsed.data.unit,
      minStock: new Prisma.Decimal(parsed.data.minStock),
      supplierId: parsed.data.supplierId || null,
    },
  });

  res.json({ ok: true, message: "Data bahan diperbarui." });
});

materialsRouter.delete("/:id", requireAuth(["OWNER", "ADMIN"]), async (req, res) => {
  const id = String(req.params.id);
  await prisma.material.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  res.json({ ok: true, message: "Bahan berhasil dihapus." });
});
