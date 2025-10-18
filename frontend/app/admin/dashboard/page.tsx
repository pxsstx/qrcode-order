"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orderApi, tableApi, menuApi } from "@/lib/api";
import { UtensilsCrossed, ShoppingBag, Table2, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalTables: 0,
    occupiedTables: 0,
    totalMenuItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [orders, tables, menus] = await Promise.all([
        orderApi.list(),
        tableApi.list(),
        menuApi.list(),
      ]);

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: any) => o.status === "PENDING").length,
        totalTables: tables.length,
        occupiedTables: tables.filter((t: any) => t.isOccupied).length,
        totalMenuItems: menus.length,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      description: `${stats.pendingOrders} pending`,
    },
    {
      title: "Tables",
      value: `${stats.occupiedTables}/${stats.totalTables}`,
      icon: Table2,
      description: "Occupied",
    },
    {
      title: "Menu Items",
      value: stats.totalMenuItems,
      icon: UtensilsCrossed,
      description: "Available",
    },
    {
      title: "Revenue",
      value: "฿0.00",
      icon: TrendingUp,
      description: "Today",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Welcome back! Here's an overview of your restaurant.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="h-8 w-8 rounded-full bg-primary/20 animate-pulse mx-auto" />
        </div>
      )}
    </div>
  );
}
