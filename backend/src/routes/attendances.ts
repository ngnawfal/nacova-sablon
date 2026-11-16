import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../lib/auth.js";
import {
  calculateWorkMinutes,
  countWorkingDaysInMonth,
  evaluateCheckInStatus,
} from "../lib/utils/business-rules.js";
import { getJakartaDateOnly, getJakartaParts } from "../lib/utils/format.js";
import { workSettingsSchema } from "../lib/validations/attendance.js";

async function ensureWorkSetting() {
  return prisma.workSetting.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      workStartTime: "08:00",
      lateToleranceMin: 15,
      workEndTime: "17:00",
      workDays: "1,2,3,4,5,6",
    },
  });
}

export const attendancesRouter = Router();

attendancesRouter.get("/overview", requireAuth(), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const today = getJakartaDateOnly();
  const [setting, todayRecord, recent] = await Promise.all([
    ensureWorkSetting(),
    prisma.attendance.findUnique({
      where: { userId_date: { userId, date: today } },
    }),
    prisma.attendance.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 14,
    }),
  ]);
  res.json({ setting, todayRecord, recent });
});

attendancesRouter.post("/check-in", requireAuth(), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const now = new Date();
  const today = getJakartaDateOnly(now);

  const existing = await prisma.attendance.findUnique({
    where: { userId_date: { userId, date: today } },
  });
  if (existing) {
    res.status(400).json({ error: "Kamu sudah absen masuk hari ini." });
    return;
  }

  const setting = await ensureWorkSetting();
  const status = evaluateCheckInStatus(now, setting.workStartTime, setting.lateToleranceMin);

  await prisma.attendance.create({
    data: {
      userId,
      date: today,
      checkInAt: now,
      status,
    },
  });

  res.status(201).json({
    ok: true,
    status,
    message:
      status === "TERLAMBAT"
        ? "Absen masuk tercatat (TERLAMBAT)."
        : "Absen masuk tercatat (HADIR).",
  });
});

attendancesRouter.post("/check-out", requireAuth(), async (req: AuthedRequest, res) => {
  const userId = req.user!.id;
  const now = new Date();
  const today = getJakartaDateOnly(now);

  const existing = await prisma.attendance.findUnique({
    where: { userId_date: { userId, date: today } },
  });

  if (!existing || !existing.checkInAt) {
    res.status(400).json({ error: "Kamu belum absen masuk hari ini." });
    return;
  }
  if (existing.checkOutAt) {
    res.status(400).json({ error: "Kamu sudah absen pulang hari ini." });
    return;
  }

  const workMinutes = calculateWorkMinutes(existing.checkInAt, now);
  await prisma.attendance.update({
    where: { id: existing.id },
    data: { checkOutAt: now, workMinutes },
  });

  res.json({ ok: true, workMinutes, message: "Absen pulang berhasil dicatat." });
});

attendancesRouter.get("/recap", requireAuth(["OWNER", "ADMIN"]), async (req, res) => {
  const nowParts = getJakartaParts();
  const month = Number(req.query.month) || nowParts.month;
  const year = Number(req.query.year) || nowParts.year;

  const setting = await ensureWorkSetting();
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const [users, records] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, role: true },
    }),
    prisma.attendance.findMany({
      where: { date: { gte: start, lte: end } },
    }),
  ]);

  const workingDaysElapsed = countWorkingDaysInMonth(year, month, setting.workDays, new Date());

  const byUser = new Map<string, typeof records>();
  for (const r of records) {
    const list = byUser.get(r.userId) ?? [];
    list.push(r);
    byUser.set(r.userId, list);
  }

  const rows = users.map((u) => {
    const userRecs = byUser.get(u.id) ?? [];
    let hadir = 0;
    let terlambat = 0;
    let izin = 0;
    let explicitAlpa = 0;
    let totalMinutes = 0;

    for (const r of userRecs) {
      if (r.status === "HADIR") hadir++;
      else if (r.status === "TERLAMBAT") terlambat++;
      else if (r.status === "IZIN" || r.status === "SAKIT" || r.status === "CUTI") izin++;
      else if (r.status === "ALPA") explicitAlpa++;
      totalMinutes += r.workMinutes;
    }

    const alpa = Math.max(explicitAlpa, workingDaysElapsed - (hadir + terlambat + izin));
    return { userId: u.id, name: u.name, role: u.role, hadir, terlambat, izin, alpa, totalMinutes };
  });

  res.json({
    month,
    year,
    workingDaysElapsed,
    rows,
    employees: users.map((u) => ({ id: u.id, name: u.name })),
  });
});

attendancesRouter.put("/settings", requireAuth(["OWNER"]), async (req, res) => {
  const parsed = workSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" });
    return;
  }

  await prisma.workSetting.upsert({
    where: { id: "default" },
    update: {
      workStartTime: parsed.data.workStartTime,
      lateToleranceMin: parsed.data.lateToleranceMin,
      workEndTime: parsed.data.workEndTime,
    },
    create: {
      id: "default",
      workStartTime: parsed.data.workStartTime,
      lateToleranceMin: parsed.data.lateToleranceMin,
      workEndTime: parsed.data.workEndTime,
      workDays: "1,2,3,4,5,6",
    },
  });

  res.json({ ok: true, message: "Jam kerja diperbarui." });
});
