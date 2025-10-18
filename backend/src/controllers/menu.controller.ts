import { Context } from "hono";
import { prisma } from "../config/database.config";
import { success, error } from "../utils/response";
import { MenuCategory } from "../../../shared/types/enums";
import { uploadImage } from "../utils/file";

// ✅ แปลงค่าจาก body ให้ปลอดภัย
async function parseJsonSafe<T>(req: Request): Promise<T> {
  try {
    return await req.json();
  } catch {
    throw new Error("Invalid JSON body");
  }
}

// ✅ ดึงเมนูทั้งหมด
export const getMenus = async (c: Context) => {
  try {
    const { category, available } = c.req.query();
    const where: any = {};

    if (category) {
      if (!Object.values(MenuCategory).includes(category as MenuCategory)) {
        return c.json(error("Invalid category"), 400);
      }
      where.category = category as MenuCategory;
    }

    if (available !== undefined) {
      where.isAvailable = available === "true";
    }

    const menus = await prisma.menu.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return c.json(success(menus));
  } catch (err) {
    console.error(err);
    return c.json(error("Failed to fetch menus"), 500);
  }
};

// ✅ ดึงเมนูเดียว
export const getMenu = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const menu = await prisma.menu.findUnique({
      where: { id: Number(id) },
    });
    if (!menu) return c.json(error("Menu not found"), 404);
    return c.json(success(menu));
  } catch (err) {
    console.error(err);
    return c.json(error("Failed to fetch menu"), 500);
  }
};

// ✅ สร้างเมนูใหม่
export const createMenu = async (c: Context) => {
  try {
    const body = await parseJsonSafe<any>(c.req.raw);
    const { name, description, price, options, category, image } = body;

    if (!name || price == null)
      return c.json(error("Name and price are required"), 400);

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0)
      return c.json(error("Price must be greater than 0"), 400);

    if (category && !Object.values(MenuCategory).includes(category))
      return c.json(error("Invalid category"), 400);

    let imageKey: string | null = null;
    if (image?.data && image?.name) {
      const buffer = Buffer.from(image.data, "base64");
      imageKey = `${Date.now()}-${image.name}`;
      await uploadImage(buffer, imageKey);
    }

    const menu = await prisma.menu.create({
      data: {
        name,
        description,
        price: numericPrice,
        options: options || null,
        category: category || null,
        image: imageKey,
      },
    });

    return c.json(success(menu, "Menu created successfully"), 201);
  } catch (err) {
    console.error("❌ Create menu error:", err);
    return c.json(error("Failed to create menu"), 500);
  }
};

// ✅ แก้ไขเมนู
export const updateMenu = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const body = await parseJsonSafe<any>(c.req.raw);
    const { name, description, price, options, category, image, isAvailable } =
      body;

    const menuId = Number(id);
    const existingMenu = await prisma.menu.findUnique({
      where: { id: menuId },
    });
    if (!existingMenu) return c.json(error("Menu not found"), 404);

    let numericPrice: number | undefined = undefined;
    if (price !== undefined) {
      numericPrice = parseFloat(price);
      if (isNaN(numericPrice) || numericPrice <= 0)
        return c.json(error("Price must be greater than 0"), 400);
    }

    if (category && !Object.values(MenuCategory).includes(category))
      return c.json(error("Invalid category"), 400);

    let imageKey = existingMenu.image;
    if (image?.data && image?.name) {
      const buffer = Buffer.from(image.data, "base64");
      imageKey = `${Date.now()}-${image.name}`;
      await uploadImage(buffer, imageKey);
    }

    const updatedMenu = await prisma.menu.update({
      where: { id: menuId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(numericPrice !== undefined && { price: numericPrice }),
        ...(options !== undefined && { options }),
        ...(category !== undefined && { category }),
        ...(imageKey && { image: imageKey }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });

    return c.json(success(updatedMenu, "Menu updated successfully"));
  } catch (err) {
    console.error("❌ Update menu error:", err);
    return c.json(error("Failed to update menu"), 500);
  }
};

// ✅ ลบเมนู
export const deleteMenu = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const menuId = Number(id);

    const existingMenu = await prisma.menu.findUnique({
      where: { id: menuId },
    });
    if (!existingMenu) return c.json(error("Menu not found"), 404);

    await prisma.menu.delete({ where: { id: menuId } });

    return c.json(success(null, "Menu deleted successfully"));
  } catch (err) {
    console.error(err);
    return c.json(error("Failed to delete menu"), 500);
  }
};

// ✅ toggle สถานะเมนู
export const toggleAvailability = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const menuId = Number(id);

    const menu = await prisma.menu.findUnique({ where: { id: menuId } });
    if (!menu) return c.json(error("Menu not found"), 404);

    const updatedMenu = await prisma.menu.update({
      where: { id: menuId },
      data: { isAvailable: !menu.isAvailable },
    });

    return c.json(success(updatedMenu, "Availability updated"));
  } catch (err) {
    console.error(err);
    return c.json(error("Failed to update availability"), 500);
  }
};
