"use client";

import { useEffect, useState } from "react";
import type { MenuItem } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toastError } from "@/lib/toast";
import { fetchPresignedUrl } from "@/lib/fetchPresigned";
import Image from "next/image";
import { menuApi } from "@/lib/api";

export default function StaffMenusPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuUrls, setMenuUrls] = useState<Record<number, string>>({});

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async (fromApi = false) => {
    try {
      setLoading(true);

      // เลือกว่าจะดึงจาก API หลักหรือ /api/menus
      let data: MenuItem[] = [];
      if (fromApi) {
        data = await menuApi.list();
      } else {
        const res = await fetch("/api/menus");
        if (!res.ok)
          throw new Error(`Failed to fetch menus: ${res.statusText}`);
        data = await res.json();
      }

      setMenus(Array.isArray(data) ? data : []);

      // ดึง presigned URLs ของรูป
      const urls: Record<number, string> = {};
      await Promise.all(
        data.map(async (menu) => {
          if (menu.image) {
            try {
              urls[menu.id] = await fetchPresignedUrl(menu.image);
            } catch (err) {
              console.error(`Failed to fetch URL for ${menu.image}`, err);
              urls[menu.id] = "";
            }
          }
        })
      );
      setMenuUrls(urls);
    } catch (err: any) {
      console.error("Failed to load menus:", err);
      toastError(err?.message || "Failed to load menus");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Menu Items</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          View all available menu items
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="h-8 w-8 rounded-full bg-primary/20 animate-pulse mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {menus.map((menu) => (
            <Card key={menu.id}>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg">
                    {menu.name}
                  </CardTitle>
                  <Badge
                    variant={menu.isAvailable ? "secondary" : "destructive"}
                    className="text-xs flex-shrink-0"
                  >
                    {menu.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Image */}
                <div className="w-full h-48 relative rounded-lg overflow-hidden bg-gray-100">
                  {menuUrls[menu.id] ? (
                    <Image
                      src={menuUrls[menu.id]}
                      alt={menu.name}
                      fill
                      className="object-cover"
                      quality={100}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 animate-pulse" />
                  )}
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {menu.description || "No description"}
                  </p>
                  <p className="text-xl font-bold text-primary">
                    ฿{menu.price.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
