import {
  PrismaClient,
  MenuCategory,
  UserRole,
  OrderStatus,
} from "@prisma/client";
import { hashPassword } from "../config/password.config";

const JWT_SECRET = process.env.JWT_SECRET as string;
const prisma = new PrismaClient();

const adminPass = await hashPassword("admin123");
const staffPass = await hashPassword("staff123");
const managerPass = await hashPassword("manager123");

async function main() {
  console.log("🌱 Seeding database...");

  // ===== Users =====
  await prisma.users.createMany({
    data: [
      {
        username: "admin",
        email: "admin@example.com",
        password: adminPass, // คุณสามารถ hash รหัสผ่านก่อนใส่จริง
        role: UserRole.ADMIN,
      },
      {
        username: "staff1",
        email: "staff1@example.com",
        password: staffPass,
        role: UserRole.STAFF,
      },
      {
        username: "manager",
        email: "manager@example.com",
        password: managerPass,
        role: UserRole.MANAGER,
      },
    ],
    skipDuplicates: true,
  });

  // ===== Tables =====
  const tables = Array.from({ length: 10 }, (_, i) => ({
    code: `T${i + 1}`,
    capacity: 4,
  }));
  await prisma.table.createMany({ data: tables, skipDuplicates: true });

  // ===== Menu Items =====
  await prisma.menu.createMany({
    data: [
      {
        name: "Grilled Chicken Steak",
        description: "Juicy grilled chicken served with vegetables.",
        price: 250,
        category: MenuCategory.MAIN_COURSE,
        image: "grilled-chicken-steak.jpg",
      },
      {
        name: "Caesar Salad",
        description: "Fresh romaine lettuce with Caesar dressing.",
        price: 120,
        category: MenuCategory.APPETIZER,
        image: "caesar-salad.jpg",
      },
      {
        name: "Chocolate Lava Cake",
        description: "Warm chocolate cake with molten center.",
        price: 150,
        category: MenuCategory.DESSERT,
        image: "chocolate-lava-cake.jpg",
      },
      {
        name: "Iced Lemon Tea",
        description: "Refreshing iced tea with lemon slices.",
        price: 60,
        category: MenuCategory.BEVERAGE,
        image: "iced-lemon-tea.jpg",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seeding finished!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
