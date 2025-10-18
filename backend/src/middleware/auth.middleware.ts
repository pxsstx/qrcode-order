import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { UserRole } from "../config/database.config";
import { success, error } from "../utils/response";
import { getCookie } from "hono/cookie";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    // Try to get token from Authorization header first
    const authHeader = c.req.header("Authorization");
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      // If no Authorization header, try to get token from cookie
      token = getCookie(c, "token");
    }

    if (!token) {
      return c.json(error("Unauthorized - No token provided"), 401);
    }

    const payload = await verify(token, JWT_SECRET);

    c.set("user", payload);
    await next();
  } catch (err) {
    return c.json(error("Unauthorized - Invalid token"), 401);
  }
};

export const adminMiddleware = async (c: Context, next: Next) => {
  try {
    const user = c.get("user");

    if (!user) {
      return c.json(error("Unauthorized"), 401);
    }

    if (user.role !== UserRole.ADMIN) {
      return c.json(error("Forbidden - Admin access required"), 403);
    }

    await next();
  } catch (err) {
    return c.json(error("Forbidden"), 403);
  }
};

export const managerOrAdminMiddleware = async (c: Context, next: Next) => {
  try {
    const user = c.get("user");

    if (!user) {
      return c.json(error("Unauthorized"), 401);
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.MANAGER) {
      return c.json(error("Forbidden - Manager or Admin access required"), 403);
    }

    await next();
  } catch (err) {
    return c.json(error("Forbidden"), 403);
  }
};

export const requireAdmin = [authMiddleware, adminMiddleware];
export const requireManagerOrAdmin = [authMiddleware, managerOrAdminMiddleware];
