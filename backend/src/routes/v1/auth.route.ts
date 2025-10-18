import { Hono } from "hono";
import {
  register,
  login,
  logout,
  me,
  changePassword,
} from "../../controllers/auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const authRoute = new Hono();

// Public routes
authRoute.post("/register", register);
authRoute.post("/login", login);

// Protected routes
authRoute.get("/me", authMiddleware, me);
authRoute.post("/logout", authMiddleware, logout);
authRoute.patch("/change-password", authMiddleware, changePassword);

export default authRoute;
