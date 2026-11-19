import { PrismaClient, Role, AttendanceStatus, StockMovementType } from "@prisma/client";
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

  // Suppliers & Materials (including PPT Slide 15 AC: Tinta Putih 2 L, min 3 L)
  const existingMaterials = await prisma.material.count();
  if (existingMaterials === 0) {
    const sup1 = await prisma.supplier.create({
      data: { name: "Toko Sablon Makmur", phone: "081900112233", address: "Pasar Tekstil Blok B" },
    });
    const sup2 = await prisma.supplier.create({
      data: { name: "Grosir Kaos Polos Jaya", phone: "081800445566", address: "Kawasan Industri No. 3" },
    });

    const mat1 = await prisma.material.create({
      data: {
        name: "Tinta Plastisol Putih",
        sku: "TNT-PLT-WHT",
        category: "Tinta",
        unit: "Liter",
        currentStock: 2.0,
        minStock: 3.0,
        supplierId: sup1.id,
      },
    });
    const mat2 = await prisma.material.create({
      data: {
        name: "Tinta Plastisol Hitam",
        sku: "TNT-PLT-BLK",
        category: "Tinta",
        unit: "Liter",
        currentStock: 8.5,
        minStock: 3.0,
        supplierId: sup1.id,
      },
    });
    const mat3 = await prisma.material.create({
      data: {
        name: "Kaos Cotton Combed 30s Hitam (L)",
        sku: "KOS-C30-BLK-L",
        category: "Kaos Polos",
        unit: "Pcs",
        currentStock: 65,
        minStock: 20,
        supplierId: sup2.id,
      },
    });
    const mat4 = await prisma.material.create({
      data: {
        name: "Obat Afdruk Emulsi",
        sku: "CHM-AFD-01",
        category: "Kimia",
        unit: "Botol",
        currentStock: 0,
        minStock: 2,
        supplierId: sup1.id,
      },
    });

    await prisma.stockMovement.createMany({
      data: [
        { materialId: mat1.id, type: StockMovementType.IN, qty: 5, beforeStock: 0, afterStock: 5, reason: "Stok awal gudang", createdById: admin.id },
        { materialId: mat1.id, type: StockMovementType.OUT, qty: 3, beforeStock: 5, afterStock: 2, reason: "Pemakaian produksi batch mingguan", createdById: admin.id },
        { materialId: mat2.id, type: StockMovementType.IN, qty: 8.5, beforeStock: 0, afterStock: 8.5, reason: "Stok awal gudang", createdById: admin.id },
        { materialId: mat3.id, type: StockMovementType.IN, qty: 65, beforeStock: 0, afterStock: 65, reason: "Stok awal kaos polos", createdById: admin.id },
        { materialId: mat4.id, type: StockMovementType.IN, qty: 0, beforeStock: 0, afterStock: 0, reason: "Stok awal kosong", createdById: admin.id },
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
    [prod2.id, d2, AttendanceStatus.IZIN],
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
        checkInAt: st === AttendanceStatus.IZIN ? null : checkIn,
        checkOutAt: st === AttendanceStatus.IZIN ? null : checkOut,
        status: st,
        workMinutes: st === AttendanceStatus.IZIN ? 0 : 540,
        note: st === AttendanceStatus.IZIN ? "Izin keperluan keluarga" : null,
      },
    });
  }

  console.log("Seed Sprint 2 selesai: users, attendances, customers, suppliers, materials, stock_movements.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
