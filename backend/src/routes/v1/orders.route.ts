import { Hono } from "hono";
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,
  getOrdersByTable,
} from "../../controllers/order.controller";
import { requireAdmin, authMiddleware } from "../../middleware/auth.middleware";

const ordersRoute = new Hono();

// Staff routes (authenticated)
ordersRoute.post("/", createOrder);
ordersRoute.get("/", authMiddleware, getOrders);
ordersRoute.get("/:id", authMiddleware, getOrder);
ordersRoute.get("/table/:tableId", getOrdersByTable);
ordersRoute.patch("/:id/status", updateOrderStatus);

// Admin only routes
ordersRoute.delete("/:id", ...requireAdmin, deleteOrder);

export default ordersRoute;
