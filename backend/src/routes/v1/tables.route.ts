import { Hono } from "hono";
import {
  getTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  toggleTableOccupancy,
} from "../../controllers/table.controller";
import { requireAdmin, authMiddleware } from "../../middleware/auth.middleware";

const tablesRoute = new Hono();

// Staff routes (authenticated)
tablesRoute.get("/", getTables);
tablesRoute.get("/:id", authMiddleware, getTable);
tablesRoute.patch("/:id/toggle", authMiddleware, toggleTableOccupancy);

// Admin only routes
tablesRoute.post("/", ...requireAdmin, createTable);
tablesRoute.put("/:id", ...requireAdmin, updateTable);
tablesRoute.delete("/:id", ...requireAdmin, deleteTable);

export default tablesRoute;
