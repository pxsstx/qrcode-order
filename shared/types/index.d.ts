// Enums
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

// Models
export interface Menu {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  options?: Record<string, any> | null;
  category?: MenuCategory | null;
  image?: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  orderItems?: OrderItem[];
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: number;
  code: string;
  capacity: number;
  isOccupied: boolean;
  orders?: Order[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  tableId: number;
  status: OrderStatus;
  totalPrice: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  table?: Table;
  orderItems?: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  menuId: number;
  quantity: number;
  price: number;
  options?: Record<string, any> | null;
  notes?: string | null;
  createdAt: string;
  order?: Order;
  menu?: Menu;
}

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
