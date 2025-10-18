"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { MenuItem, Table } from "@shared/types";
import { menuApi, tableApi, orderApi } from "@/lib/api";
import { useCartStore } from "@/store/use-cart-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function CustomerOrderPage() {
  const params = useParams();
  const tableCode = params.tableCode as string;

  const [table, setTable] = useState<Table | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderNotes, setOrderNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const { items, addItem, removeItem, updateQuantity, clearCart, getTotal } =
    useCartStore();

  useEffect(() => {
    loadData();
  }, [tableCode]);

  const loadData = async () => {
    try {
      const [tablesData, menusData] = await Promise.all([
        tableApi.list(),
        menuApi.list(),
      ]);

      const foundTable = tablesData.find((t: Table) => t.code === tableCode);
      setTable(foundTable || null);
      setMenus(menusData.filter((m: MenuItem) => m.isAvailable));
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (menu: MenuItem) => {
    addItem({
      menuId: menu.id,
      quantity: 1,
      menu,
    });
  };

  const handleSubmitOrder = async () => {
    if (!table || items.length === 0) return;

    setSubmitting(true);
    try {
      await orderApi.create({
        tableId: table.id,
        items: items.map(({ menuId, quantity, notes }) => ({
          menuId,
          quantity,
          notes,
        })),
        notes: orderNotes,
      });

      setOrderSuccess(true);
      clearCart();
      setOrderNotes("");

      setTimeout(() => setOrderSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to submit order:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-primary/20 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Table Not Found</CardTitle>
            <CardDescription>
              The QR code you scanned is invalid or the table does not exist.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary flex items-center justify-center">
              <UtensilsCrossed className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg">Our Restaurant</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Table {table.code}
              </p>
            </div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative bg-transparent"
              >
                <ShoppingCart className="h-5 w-5" />
                {items.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {items.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Your Order</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {items.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Your cart is empty
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                      {items.map((item) => (
                        <div
                          key={item.menuId}
                          className="flex items-start gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {item.menu?.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ${item.menu?.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7 sm:h-8 sm:w-8 bg-transparent"
                              onClick={() =>
                                updateQuantity(
                                  item.menuId,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 sm:w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7 sm:h-8 sm:w-8 bg-transparent"
                              onClick={() =>
                                updateQuantity(item.menuId, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 sm:h-8 sm:w-8"
                              onClick={() => removeItem(item.menuId)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm">
                        Special Instructions
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Any special requests?"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex items-center justify-between text-base sm:text-lg font-bold">
                      <span>Total</span>
                      <span>${getTotal().toFixed(2)}</span>
                    </div>

                    {orderSuccess && (
                      <div className="bg-primary/10 text-primary p-3 rounded-md text-sm text-center">
                        Order submitted successfully!
                      </div>
                    )}

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleSubmitOrder}
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Place Order"}
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Menu Grid */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Menu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {menus.map((menu) => (
            <Card key={menu.id} className="overflow-hidden">
              {menu.imageUrl && (
                <div className="aspect-video bg-muted">
                  <img
                    src={menu.imageUrl || "/placeholder.svg"}
                    alt={menu.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate">
                      {menu.name}
                    </CardTitle>
                    {menu.category && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {menu.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-base sm:text-lg font-bold text-primary flex-shrink-0">
                    ${menu.price.toFixed(2)}
                  </p>
                </div>
                {menu.description && (
                  <CardDescription className="mt-2 text-sm line-clamp-2">
                    {menu.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => handleAddToCart(menu)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
