import { afterAll, describe, expect, it } from "vitest";
import { Prisma } from "../../backend/node_modules/@prisma/client/index.js";
import { prisma } from "@/lib/prisma";

describe("Integration: Transaksi Stok Anti-Minus (Sprint 2)", () => {
  const createdMaterialIds: string[] = [];

  afterAll(async () => {
    if (createdMaterialIds.length > 0) {
      await prisma.stockMovement.deleteMany({
        where: { materialId: { in: createdMaterialIds } },
      });
      await prisma.material.deleteMany({
        where: { id: { in: createdMaterialIds } },
      });
    }
    await prisma.$disconnect();
  });

  it("US-07: dua request stok keluar bersamaan tidak membuat stok minus", async () => {
    const actor = await prisma.user.findFirstOrThrow({
      where: { role: "ADMIN" },
    });

    const mat = await prisma.material.create({
      data: {
        name: "Test Concurrency Ink",
        category: "Tinta",
        unit: "Liter",
        currentStock: new Prisma.Decimal(5),
        minStock: new Prisma.Decimal(1),
      },
    });
    createdMaterialIds.push(mat.id);

    const attemptStockOut = async (qty: number) => {
      const qtyDec = new Prisma.Decimal(qty);
      return prisma.$transaction(async (tx) => {
        const res = await tx.material.updateMany({
          where: { id: mat.id, deletedAt: null, currentStock: { gte: qtyDec } },
          data: { currentStock: { decrement: qtyDec } },
        });
        if (res.count === 0) {
          throw new Error("Stok tidak cukup");
        }
        const updated = await tx.material.findUniqueOrThrow({ where: { id: mat.id } });
        await tx.stockMovement.create({
          data: {
            materialId: mat.id,
            type: "OUT",
            qty: qtyDec,
            beforeStock: updated.currentStock.plus(qtyDec),
            afterStock: updated.currentStock,
            reason: "Concurrent test",
            createdById: actor.id,
          },
        });
        return Number(updated.currentStock);
      });
    };

    const results = await Promise.allSettled([attemptStockOut(4), attemptStockOut(4)]);
    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    const finalMat = await prisma.material.findUniqueOrThrow({ where: { id: mat.id } });
    expect(Number(finalMat.currentStock)).toBe(1);
  });
});
