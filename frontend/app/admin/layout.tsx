"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authApi } from "../../lib/api";
import { useUserStore } from "../../store/use-user-store";
import { Button } from "../../components/ui/button";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Table2,
  LogOut,
  User,
} from "lucide-react";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { restaurantConfig } from "@/config/restaurant";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, clearUser } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await authApi.me();
      if (userData.role !== "ADMIN") {
        router.push("/staff/dashboard");
        return;
      }
      setUser(userData);
    } catch (error) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      clearUser();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-primary/20 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/menus", label: "Menus", icon: UtensilsCrossed },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/tables", label: "Tables", icon: Table2 },
    { href: "/admin/users", label: "Users", icon: User },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold truncate">{restaurantConfig.name}</h1>
              <p className="text-xs text-muted-foreground">{user?.username}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="flex flex-col p-4 gap-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">{children}</main>
      <Toaster />
    </div>
  );
}
