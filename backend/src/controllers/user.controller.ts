import { Context } from "hono";
import { prisma } from "../config/database.config";
import { success, error } from "../utils/response";
import { hashPassword } from "../config/password.config";
import { UserRole } from "../../../shared/types/enums";

export const getUsers = async (c: Context) => {
  try {
    const { role, active } = c.req.query();

    const where: any = {};

    if (role) {
      if (!Object.values(UserRole).includes(role as UserRole)) {
        return c.json(error("Invalid role"), 400);
      }
      where.role = role as UserRole;
    }

    if (active !== undefined) {
      where.isActive = active === "true";
    }

    const users = await prisma.users.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json(success(users));
  } catch (err) {
    return c.json(error("Failed to fetch users"), 500);
  }
};

export const getUser = async (c: Context) => {
  try {
    const { id } = c.req.param();

    const user = await prisma.users.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return c.json(error("User not found"), 404);
    }

    return c.json(success(user));
  } catch (err) {
    return c.json(error("Failed to fetch user"), 500);
  }
};

export const createUser = async (c: Context) => {
  try {
    const { username, email, password, role } = await c.req.json();

    if (!username || !email || !password) {
      return c.json(error("All fields are required"), 400);
    }

    if (role && !Object.values(UserRole).includes(role as UserRole)) {
      return c.json(error("Invalid role"), 400);
    }

    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return c.json(error("User already exists"), 409);
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.users.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: (role as UserRole) || UserRole.STAFF,
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

    return c.json(success(user, "User created successfully"), 201);
  } catch (err) {
    return c.json(error("Failed to create user"), 500);
  }
};

export const updateUser = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const { username, email, role, isActive } = await c.req.json();

    const existingUser = await prisma.users.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return c.json(error("User not found"), 404);
    }

    if (role && !Object.values(UserRole).includes(role as UserRole)) {
      return c.json(error("Invalid role"), 400);
    }

    // Check if username or email is already taken by another user
    if (username || email) {
      const duplicateUser = await prisma.users.findFirst({
        where: {
          OR: [
            ...(username ? [{ username }] : []),
            ...(email ? [{ email }] : []),
          ],
          NOT: { id: parseInt(id) },
        },
      });

      if (duplicateUser) {
        if (duplicateUser.email === email) {
          return c.json(error("Email already in use"), 409);
        }
        return c.json(error("Username already taken"), 409);
      }
    }

    const user = await prisma.users.update({
      where: { id: parseInt(id) },
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(role && { role: role as UserRole }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return c.json(success(user, "User updated successfully"));
  } catch (err) {
    return c.json(error("Failed to update user"), 500);
  }
};

export const deleteUser = async (c: Context) => {
  try {
    const { id } = c.req.param();

    const existingUser = await prisma.users.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingUser) {
      return c.json(error("User not found"), 404);
    }

    await prisma.users.delete({
      where: { id: parseInt(id) },
    });

    return c.json(success(null, "User deleted successfully"));
  } catch (err) {
    return c.json(error("Failed to delete user"), 500);
  }
};
