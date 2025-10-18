"use client";

import { useEffect, useState } from "react";
import { orderApi } from "@/lib/api";
import type { Order } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    // const interval = setInterval(loadOrders, 5000);
    // return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const data = await orderApi.list();
      // Normalize API response: map `orderItems` to `items` if you prefer
      const normalized: Order[] = data.map((o: any) => ({
        ...o,
        orderItems: o.orderItems ?? [],
      }));
      setOrders(normalized);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      await orderApi.updateStatus(orderId, status);
      loadOrders();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500";
      case "PREPARING":
        return "bg-blue-500";
      case "READY":
        return "bg-green-500";
      case "SERVED":
        return "bg-gray-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Manage and track all customer orders
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="h-8 w-8 rounded-full bg-primary/20 animate-pulse mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg">
                    Order #{order.id}
                  </CardTitle>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Table {order.tableId} •{" "}
                  {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </CardHeader>

              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                {/* Render orderItems */}
                {order.orderItems.length > 0 ? (
                  order.orderItems.map((item) => (
                    <div
                      key={item.menuId}
                      className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm"
                    >
                      <span>
                        {item.quantity}x{" "}
                        {item.menu?.name || `Menu #${item.menuId}`} - ฿
                        {item.price}
                      </span>
                      {item.notes && (
                        <span className="text-muted-foreground italic text-xs sm:text-sm">
                          {item.notes}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No items</p>
                )}

                {order.notes && (
                  <p className="text-xs sm:text-sm text-muted-foreground italic">
                    Note: {order.notes}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <Select
                    value={order.status}
                    onValueChange={(value) =>
                      handleStatusChange(order.id, value)
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PREPARING">Preparing</SelectItem>
                      <SelectItem value="READY">Ready</SelectItem>
                      <SelectItem value="SERVED">Served</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
