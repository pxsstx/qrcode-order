// shared/types/enums.ts

export enum UserRole {
  ADMIN = "ADMIN",
  STAFF = "STAFF",
  MANAGER = "MANAGER",
}

export enum OrderStatus {
  PENDING = "PENDING",
  PREPARING = "PREPARING",
  READY = "READY",
  SERVED = "SERVED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum MenuCategory {
  APPETIZER = "APPETIZER",
  MAIN_COURSE = "MAIN_COURSE",
  DESSERT = "DESSERT",
  BEVERAGE = "BEVERAGE",
  SIDE_DISH = "SIDE_DISH",
  SPECIAL = "SPECIAL",
}
