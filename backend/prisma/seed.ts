import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  const demoUsers = [
    { name: "Naufal (Owner)", email: "owner@nacova.id", role: Role.OWNER, phone: "081200000001" },
    { name: "Afkha (Admin)", email: "admin@nacova.id", role: Role.ADMIN, phone: "081200000002" },
    { name: "Dava (Produksi)", email: "produksi@nacova.id", role: Role.PRODUCTION, phone: "081200000003" },
    { name: "Budi (Produksi)", email: "budi@nacova.id", role: Role.PRODUCTION, phone: "081200000004" },
  ];

  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, passwordHash: defaultPassword, isActive: true },
    });
  }

  console.log("Seed Sprint 0 selesai: owner@nacova.id / admin@nacova.id / produksi@nacova.id (password: nacova123)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
