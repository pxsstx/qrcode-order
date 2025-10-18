import { Hono } from "hono";
import {
  getMenus,
  getMenu,
  createMenu,
  updateMenu,
  deleteMenu,
  toggleAvailability,
} from "../../controllers/menu.controller";
import { requireAdmin } from "../../middleware/auth.middleware";
import presign from "../../controllers/presign.controller";

const menusRoute = new Hono();

// Public routes
menusRoute.get("/", getMenus);
menusRoute.get("/:id", getMenu);

// Admin only routes
menusRoute.post("/", ...requireAdmin, createMenu);
menusRoute.put("/:id", ...requireAdmin, updateMenu);
menusRoute.delete("/:id", ...requireAdmin, deleteMenu);
menusRoute.patch("/:id/toggle", ...requireAdmin, toggleAvailability);

export default menusRoute;
