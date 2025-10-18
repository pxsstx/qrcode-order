import { Context } from "hono";
import { prisma } from "../config/database.config";
import { success, error } from "../utils/response";
import { OrderStatus } from "../../../shared/types/enums";

export const createOrder = async (c: Context) => {
  try {
    const { tableId, items, notes } = await c.req.json();

    if (!tableId || !items || !Array.isArray(items) || items.length === 0) {
      return c.json(error("Table ID and items are required"), 400);
    }

    for (const item of items) {
      if (!item.menuId || !item.quantity || item.quantity <= 0) {
        return c.json(
          error("Each item must have menuId and valid quantity"),
          400
        );
      }
    }

    const table = await prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table) {
      return c.json(error("Table not found"), 404);
    }

    const menuIds = items.map((item) => item.menuId);
    const menus = await prisma.menu.findMany({
      where: {
        id: { in: menuIds },
        isAvailable: true,
      },
    });

    if (menus.length !== menuIds.length) {
      return c.json(error("Some menu items not found or unavailable"), 404);
    }

    let totalPrice = 0;
    const orderItemsData = items.map((item) => {
      const menu = menus.find((m) => m.id === item.menuId);
      if (!menu) {
        throw new Error(`Menu ${item.menuId} not found`);
      }

      const itemPrice = menu.price * item.quantity;
      totalPrice += itemPrice;

      return {
        menuId: item.menuId,
        quantity: item.quantity,
        price: menu.price,
        options: item.options || null,
        notes: item.notes || null,
      };
    });

    const order = await prisma.order.create({
      data: {
        tableId,
        totalPrice,
        notes: notes || null,
        status: OrderStatus.PENDING,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: {
          include: {
            menu: true,
          },
        },
        table: true,
      },
    });

    await prisma.table.update({
      where: { id: tableId },
      data: { isOccupied: true },
    });

    return c.json(success(order, "Order created successfully"), 201);
  } catch (err) {
    console.error(err);
    return c.json(error("Failed to create order"), 500);
  }
};

export const getOrders = async (c: Context) => {
  try {
    const { status, tableId } = c.req.query();

    const where: any = {};
    if (status) {
      if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
        return c.json(error("Invalid status"), 400);
      }
      where.status = status as OrderStatus;
    }
    if (tableId) where.tableId = parseInt(tableId);

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            menu: true,
          },
        },
        table: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return c.json(success(orders));
  } catch (err) {
    return c.json(error("Failed to fetch orders"), 500);
  }
};

export const getOrder = async (c: Context) => {
  try {
    const { id } = c.req.param();

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        orderItems: {
          include: {
            menu: true,
          },
        },
        table: true,
      },
    });

    if (!order) {
      return c.json(error("Order not found"), 404);
    }

    return c.json(success(order));
  } catch (err) {
    return c.json(error("Failed to fetch order"), 500);
  }
};

export const updateOrderStatus = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const { status } = await c.req.json();

    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      return c.json(
        error(
          `Invalid status. Valid values: ${Object.values(OrderStatus).join(
            ", "
          )}`
        ),
        400
      );
    }

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: status as OrderStatus },
      include: {
        orderItems: {
          include: {
            menu: true,
          },
        },
        table: true,
      },
    });

    if (status === OrderStatus.COMPLETED) {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { isOccupied: false },
      });
    }

    return c.json(success(order, "Order status updated"));
  } catch (err) {
    return c.json(error("Failed to update order status"), 404);
  }
};

export const deleteOrder = async (c: Context) => {
  try {
    const { id } = c.req.param();

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
    });

    if (!order) {
      return c.json(error("Order not found"), 404);
    }

    await prisma.order.delete({
      where: { id: parseInt(id) },
    });

    return c.json(success(null, "Order deleted successfully"));
  } catch (err) {
    return c.json(error("Failed to delete order"), 500);
  }
};

export const getOrdersByTable = async (c: Context) => {
  try {
    const { tableId } = c.req.param();

    if (!tableId || isNaN(Number(tableId))) {
      return c.json(error("Invalid or missing tableId parameter"), 400);
    }

    const table = await prisma.table.findUnique({
      where: { id: parseInt(tableId) },
    });

    if (!table) {
      return c.json(error("Table not found"), 404);
    }

    // 📦 ดึง order ของโต๊ะนั้นที่ยังไม่เสร็จหรือยกเลิก
    const orders = await prisma.order.findMany({
      where: {
        tableId: parseInt(tableId),
        status: {
          notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
        },
      },
      include: {
        orderItems: {
          include: {
            menu: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (orders.length === 0) {
      return c.json(error("No active orders found for this table"), 404);
    }

    return c.json(success(orders));
  } catch (err) {
    console.error(err);
    return c.json(error("Failed to fetch orders"), 500);
  }
};
