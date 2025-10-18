import { Hono } from "hono";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../../controllers/user.controller";
import { requireAdmin } from "../../middleware/auth.middleware";

const usersRoute = new Hono();

// Admin only routes
usersRoute.get("/", ...requireAdmin, getUsers);
usersRoute.get("/:id", ...requireAdmin, getUser);
usersRoute.post("/", ...requireAdmin, createUser);
usersRoute.put("/:id", ...requireAdmin, updateUser);
usersRoute.delete("/:id", ...requireAdmin, deleteUser);

export default usersRoute;
