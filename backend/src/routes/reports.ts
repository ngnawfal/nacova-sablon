import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../lib/auth.js";
import { getJakartaDateOnly } from "../lib/utils/format.js";

export const reportsRouter = Router();

reportsRouter.get("/dashboard", requireAuth(), async (req: AuthedRequest, res) => {
  const user = req.user!;
  const today = getJakartaDateOnly();

  const [presentToday, lateToday, totalActiveEmployees, totalCustomers, myAttendance, recentAttendances] =
    await Promise.all([
      prisma.attendance.count({ where: { date: today, status: "HADIR" } }),
      prisma.attendance.count({ where: { date: today, status: "TERLAMBAT" } }),
      prisma.user.count({ where: { deletedAt: null, isActive: true } }),
      prisma.customer.count({ where: { deletedAt: null } }),
      prisma.attendance.findUnique({ where: { userId_date: { userId: user.id, date: today } } }),
      prisma.attendance.findMany({
        where: { date: today },
        include: { user: { select: { name: true, role: true } } },
        orderBy: { checkInAt: "desc" },
        take: 8,
      }),
    ]);

  res.json({
    sprint: 1,
    attendance: {
      present: presentToday,
      late: lateToday,
      total: totalActiveEmployees,
    },
    counts: {
      customers: totalCustomers,
    },
    myAttendance: myAttendance
      ? {
          status: myAttendance.status,
          checkInAt: myAttendance.checkInAt,
          checkOutAt: myAttendance.checkOutAt,
        }
      : null,
    todayAttendances: recentAttendances.map((a) => ({
      id: a.id,
      name: a.user.name,
      role: a.user.role,
      status: a.status,
      checkInAt: a.checkInAt,
      checkOutAt: a.checkOutAt,
    })),
  });
});
