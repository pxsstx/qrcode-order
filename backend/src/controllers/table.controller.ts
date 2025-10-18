import { Context } from "hono";
import { prisma } from "../config/database.config";
import { success, error } from "../utils/response";

export const getTables = async (c: Context) => {
  try {
    const { occupied } = c.req.query();

    const where: any = {};

    if (occupied !== undefined) {
      where.isOccupied = occupied === "true";
    }

    const tables = await prisma.table.findMany({
      where,
      orderBy: { id: "asc" },
    });

    return c.json(success(tables));
  } catch (err) {
    return c.json(error("Failed to fetch tables"), 500);
  }
};

export const getTable = async (c: Context) => {
  try {
    const { id } = c.req.param();

    const table = await prisma.table.findUnique({
      where: { id: parseInt(id) },
      include: {
        orders: {
          where: {
            status: {
              notIn: ["COMPLETED", "CANCELLED"],
            },
          },
          include: {
            orderItems: {
              include: {
                menu: true,
              },
            },
          },
        },
      },
    });

    if (!table) {
      return c.json(error("Table notfound"), 404);
    }
    return c.json(success(table));
  } catch (err) {
    return c.json(error("Failed to fetch table"), 500);
  }
};
export const createTable = async (c: Context) => {
  try {
    const { code, capacity } = await c.req.json();
    if (!code) {
      return c.json(error("Table code is required"), 400);
    }
    const existingTable = await prisma.table.findUnique({
      where: { code },
    });
    if (existingTable) {
      return c.json(error("Table code already exists"), 409);
    }
    const table = await prisma.table.create({
      data: {
        code,
        capacity: capacity ? parseInt(capacity) : 4,
      },
    });
    return c.json(success(table, "Table created successfully"), 201);
  } catch (err) {
    return c.json(error("Failed to create table"), 500);
  }
};
export const updateTable = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const { code, capacity, isOccupied } = await c.req.json();
    const existingTable = await prisma.table.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingTable) {
      return c.json(error("Table not found"), 404);
    }
    if (code && code !== existingTable.code) {
      const duplicateTable = await prisma.table.findUnique({
        where: { code },
      });
      if (duplicateTable) {
        return c.json(error("Table code already exists"), 409);
      }
    }
    const table = await prisma.table.update({
      where: { id: parseInt(id) },
      data: {
        ...(code && { code }),
        ...(capacity && { capacity: parseInt(capacity) }),
        ...(isOccupied !== undefined && { isOccupied }),
      },
    });
    return c.json(success(table, "Table updated successfully"));
  } catch (err) {
    return c.json(error("Failed to update table"), 500);
  }
};
export const deleteTable = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const existingTable = await prisma.table.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingTable) {
      return c.json(error("Table not found"), 404);
    }
    await prisma.table.delete({
      where: { id: parseInt(id) },
    });
    return c.json(success(null, "Table deleted successfully"));
  } catch (err) {
    return c.json(error("Failed to delete table"), 500);
  }
};
export const toggleTableOccupancy = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const table = await prisma.table.findUnique({
      where: { id: parseInt(id) },
    });
    if (!table) {
      return c.json(error("Table not found"), 404);
    }
    const updatedTable = await prisma.table.update({
      where: { id: parseInt(id) },
      data: { isOccupied: !table.isOccupied },
    });
    return c.json(success(updatedTable, "Table occupancy updated"));
  } catch (err) {
    return c.json(error("Failed to update table occupancy"), 500);
  }
};
