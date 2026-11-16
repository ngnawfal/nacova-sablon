import { PrismaClient, Role, AttendanceStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function jakartaDateOnly(daysAgo = 0): Date {
  const now = new Date();
  const jakartaNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  jakartaNow.setDate(jakartaNow.getDate() - daysAgo);
  const y = jakartaNow.getFullYear();
  const m = String(jakartaNow.getMonth() + 1).padStart(2, "0");
  const d = String(jakartaNow.getDate()).padStart(2, "0");
  return new Date(`${y}-${m}-${d}T00:00:00.000Z`);
}

async function main() {
  const defaultPassword = await bcrypt.hash("nacova123", 10);

  await prisma.workSetting.upsert({
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

  await prisma.user.upsert({
    where: { email: "owner@nacova.id" },
    update: {},
    create: {
      name: "Naufal (Owner)",
      email: "owner@nacova.id",
      passwordHash: defaultPassword,
      role: Role.OWNER,
      phone: "081200000001",
      isActive: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@nacova.id" },
    update: {},
    create: {
      name: "Afkha (Admin)",
      email: "admin@nacova.id",
      passwordHash: defaultPassword,
      role: Role.ADMIN,
      phone: "081200000002",
      isActive: true,
    },
  });

  const prod1 = await prisma.user.upsert({
    where: { email: "produksi@nacova.id" },
    update: {},
    create: {
      name: "Dava (Produksi)",
      email: "produksi@nacova.id",
      passwordHash: defaultPassword,
      role: Role.PRODUCTION,
      phone: "081200000003",
      isActive: true,
    },
  });

  const prod2 = await prisma.user.upsert({
    where: { email: "budi@nacova.id" },
    update: {},
    create: {
      name: "Budi (Produksi)",
      email: "budi@nacova.id",
      passwordHash: defaultPassword,
      role: Role.PRODUCTION,
      phone: "081200000004",
      isActive: true,
    },
  });

  const existingCustomers = await prisma.customer.count();
  if (existingCustomers === 0) {
    await prisma.customer.createMany({
      data: [
        {
          name: "Himpunan Mahasiswa Informatika",
          phone: "081355501122",
          company: "HMIF Universitas",
          address: "Jl. Kampus Raya No. 12",
          notes: "Langganan kaos panitia semesteran",
        },
        {
          name: "Kopi Senja Nusantara",
          phone: "082144409988",
          company: "CV Senja Kopi",
          address: "Jl. Sudirman No. 45",
          notes: "Seragam barista & totebag",
        },
        {
          name: "Komunitas Lari Pagi",
          phone: "085711223344",
          company: "RunClub ID",
          address: "Jl. Taman Kota No. 8",
        },
      ],
    });
  }

  const d1 = jakartaDateOnly(1);
  const d2 = jakartaDateOnly(2);
  for (const [u, dt, st] of [
    [prod1.id, d1, AttendanceStatus.HADIR],
    [prod2.id, d1, AttendanceStatus.TERLAMBAT],
    [admin.id, d1, AttendanceStatus.HADIR],
    [prod1.id, d2, AttendanceStatus.HADIR],
  ] as const) {
    const checkIn = new Date(dt);
    checkIn.setUTCHours(st === AttendanceStatus.TERLAMBAT ? 1 : 0, st === AttendanceStatus.TERLAMBAT ? 30 : 50, 0, 0);
    const checkOut = new Date(dt);
    checkOut.setUTCHours(10, 0, 0, 0);

    await prisma.attendance.upsert({
      where: { userId_date: { userId: u, date: dt } },
      update: {},
      create: {
        userId: u,
        date: dt,
        checkInAt: checkIn,
        checkOutAt: checkOut,
        status: st,
        workMinutes: 540,
      },
    });
  }

  console.log("Seed Sprint 1 selesai: users, work_settings, attendances, customers.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
