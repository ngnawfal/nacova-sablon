import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../lib/auth.js";
import { evaluateStockLevel } from "../lib/utils/business-rules.js";
import { getJakartaDateOnly } from "../lib/utils/format.js";

export const reportsRouter = Router();

reportsRouter.get("/dashboard", requireAuth(), async (req: AuthedRequest, res) => {
  const user = req.user!;
  const today = getJakartaDateOnly();

  const [
    presentToday,
    lateToday,
    leaveToday,
    totalActiveEmployees,
    totalCustomers,
    materials,
    recentMovements,
    myAttendance,
    todayAttendances,
  ] = await Promise.all([
    prisma.attendance.count({ where: { date: today, status: "HADIR" } }),
    prisma.attendance.count({ where: { date: today, status: "TERLAMBAT" } }),
    prisma.attendance.count({ where: { date: today, status: { in: ["IZIN", "SAKIT", "CUTI"] } } }),
    prisma.user.count({ where: { deletedAt: null, isActive: true } }),
    prisma.customer.count({ where: { deletedAt: null } }),
    prisma.material.findMany({
      where: { deletedAt: null },
      include: { supplier: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.stockMovement.findMany({
      include: {
        material: { select: { id: true, name: true, unit: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.attendance.findUnique({ where: { userId_date: { userId: user.id, date: today } } }),
    prisma.attendance.findMany({
      where: { date: today },
      include: { user: { select: { name: true, role: true } } },
      orderBy: { checkInAt: "desc" },
      take: 6,
    }),
  ]);

  const mappedStock = materials.map((m) => {
    const currentStock = Number(m.currentStock);
    const minStock = Number(m.minStock);
    return {
      id: m.id,
      name: m.name,
      category: m.category,
      unit: m.unit,
      currentStock,
      minStock,
      supplierName: m.supplier?.name ?? null,
      alertStatus: evaluateStockLevel(currentStock, minStock),
    };
  });

  const lowStockItems = mappedStock
    .filter((m) => m.alertStatus !== "AMAN")
    .sort((a, b) => (a.alertStatus === "HABIS" ? -1 : b.alertStatus === "HABIS" ? 1 : a.currentStock - b.currentStock));

  const outOfStockCount = lowStockItems.filter((m) => m.alertStatus === "HABIS").length;
  const menipisCount = lowStockItems.filter((m) => m.alertStatus === "MENIPIS").length;
  const safeCount = mappedStock.length - lowStockItems.length;

  res.json({
    sprint: 2,
    attendance: {
      present: presentToday,
      late: lateToday,
      leave: leaveToday,
      total: totalActiveEmployees,
    },
    counts: {
      customers: totalCustomers,
      materials: mappedStock.length,
      safeStock: safeCount,
      lowStock: lowStockItems.length,
      outOfStock: outOfStockCount,
      menipis: menipisCount,
    },
    lowStockItems,
    recentMovements: recentMovements.map((mv) => ({
      id: mv.id,
      materialId: mv.material.id,
      materialName: mv.material.name,
      unit: mv.material.unit,
      type: mv.type,
      qty: Number(mv.qty),
      afterStock: Number(mv.afterStock),
      reason: mv.reason,
      createdByName: mv.createdBy.name,
      createdAt: mv.createdAt,
    })),
    myAttendance: myAttendance
      ? {
          status: myAttendance.status,
          checkInAt: myAttendance.checkInAt,
          checkOutAt: myAttendance.checkOutAt,
        }
      : null,
    todayAttendances: todayAttendances.map((a) => ({
      id: a.id,
      name: a.user.name,
      role: a.user.role,
      status: a.status,
      checkInAt: a.checkInAt,
      checkOutAt: a.checkOutAt,
    })),
  });
});
