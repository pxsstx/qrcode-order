import { NextRequest, NextResponse } from "next/server";
import { withCache } from "@/lib/cache";
import { menuApi } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const data = await withCache("menus:list", () => menuApi.list(), 120);
    return NextResponse.json(data); // ต้อง return JSON
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
