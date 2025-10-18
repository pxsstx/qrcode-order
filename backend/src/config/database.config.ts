// src/config/database.ts
import {
  PrismaClient,
  OrderStatus,
  UserRole,
  MenuCategory,
} from "@prisma/client";

export const prisma = new PrismaClient();

// Export enums for use throughout the application
export { OrderStatus, UserRole, MenuCategory };
