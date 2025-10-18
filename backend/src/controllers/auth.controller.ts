import { sign } from "hono/jwt";
import { prisma } from "../config/database.config";
import { Context } from "hono";
import { error, success } from "../utils/response";
import { hashPassword, verifyPassword } from "../config/password.config";
import { setCookie, deleteCookie } from "hono/cookie";
import { UserRole } from "../../../shared/types/enums";

const JWT_SECRET = process.env.JWT_SECRET as string;

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const register = async (c: Context) => {
  try {
    const { username, email, password } = await c.req.json();

    if (!username || !email || !password) {
      return c.json(error("All fields are required"), 400);
    }

    if (!isValidEmail(email)) {
      return c.json(error("Invalid email format"), 400);
    }

    if (password.length < 8) {
      return c.json(error("Password must be at least 8 characters"), 400);
    }

    if (username.length < 3) {
      return c.json(error("Username must be at least 3 characters"), 400);
    }

    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return c.json(error("Email already in use"), 409);
      }
      return c.json(error("Username already taken"), 409);
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: UserRole.STAFF,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return c.json(success(user, "User registered successfully"), 201);
  } catch (err) {
    console.error("Registration error:", err);
    return c.json(error("Failed to create user"), 500);
  }
};

export const login = async (c: Context) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json(error("Email and password are required"), 400);
    }

    if (!isValidEmail(email)) {
      return c.json(error("Invalid email format"), 400);
    }

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return c.json(error("Invalid email or password"), 401);
    }

    if (!user.isActive) {
      return c.json(error("Account is inactive. Please contact support"), 403);
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return c.json(error("Invalid email or password"), 401);
    }

    const token = await sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      },
      JWT_SECRET
    );

    // Set token in cookie

    setCookie(c, "token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
      path: "/",
    });

    return c.json(
      success(
        {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
        },
        "Login successful"
      )
    );
  } catch (err) {
    console.error("Login error:", err);
    return c.json(error("Login failed"), 500);
  }
};

export const logout = async (c: Context) => {
  // Clear the token cookie
  deleteCookie(c, "token");

  return c.json(success(null, "Logout successful"));
};

export const me = async (c: Context) => {
  try {
    const user = c.get("user");

    if (!user) {
      return c.json(error(" invalid credentials"), 401);
    }

    const userData = await prisma.users.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!userData) {
      return c.json(error("User not found"), 404);
    }

    return c.json(success(userData));
  } catch (err) {
    console.error("Get user error:", err);
    return c.json(error("Failed to fetch user data"), 500);
  }
};

export const changePassword = async (c: Context) => {
  try {
    const user = c.get("user");
    const { currentPassword, newPassword } = await c.req.json();

    if (!currentPassword || !newPassword) {
      return c.json(error("Current and new password are required"), 400);
    }

    if (newPassword.length < 8) {
      return c.json(error("New password must be at least 8 characters"), 400);
    }

    const userData = await prisma.users.findUnique({
      where: { id: user.id },
    });

    if (!userData) {
      return c.json(error("User not found"), 404);
    }

    const isPasswordValid = await verifyPassword(
      currentPassword,
      userData.password
    );

    if (!isPasswordValid) {
      return c.json(error("Current password is incorrect"), 401);
    }

    const hashedPassword = await hashPassword(newPassword);

    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: { password: hashedPassword },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return c.json(
      success(
        {
          user: updatedUser,
        },
        "Password changed successfully"
      )
    );
  } catch (err) {
    console.error("Change password error:", err);
    return c.json(error("Failed to change password"), 500);
  }
};
