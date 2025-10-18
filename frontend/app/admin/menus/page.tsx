"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { menuApi } from "@/lib/api";
import type { MenuItem } from "@shared/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Plus, Edit, Trash2 } from "lucide-react";
import { toastError, toastSuccess } from "@/lib/toast";
import Image from "next/image";
import { fetchPresignedUrl } from "@/lib/fetchPresigned";

export default function MenusPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [menuUrls, setMenuUrls] = useState<Record<number, string>>({});

  const categories = [
    { label: "Appetizer", value: "APPETIZER" },
    { label: "Main Course", value: "MAIN_COURSE" },
    { label: "Dessert", value: "DESSERT" },
    { label: "Beverage", value: "BEVERAGE" },
    { label: "Side Dish", value: "SIDE_DISH" },
    { label: "Special", value: "SPECIAL" },
  ];

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    available: true,
  });

  useEffect(() => {
    loadMenus();
  }, []);

  /** Load all menus and fetch presigned URLs from server */
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

  /** Handle menu creation/update */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imagePayload: { name: string; data: string } | undefined;

      if (selectedFile) {
        // Convert image file to Base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(selectedFile);
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.onerror = (err) => reject(err);
        });
        imagePayload = { name: selectedFile.name, data: base64 };
      }

      const payload: any = {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        category: formData.category || undefined,
        available: formData.available,
        ...(imagePayload && { image: imagePayload }),
      };

      if (editingMenu) {
        await menuApi.update(editingMenu.id, payload);
        const res = await menuApi.list();
        setMenus(res);
        toastSuccess("Menu updated successfully");
      } else {
        await menuApi.create(payload);
        const res = await menuApi.list();
        setMenus(res);
        toastSuccess("Menu created successfully");
      }

      setDialogOpen(false);
      resetForm();
      // loadMenus();
    } catch (err) {
      console.error("Failed to save menu:", err);
      toastError("Failed to save menu");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await menuApi.delete(id);
      toastSuccess("Menu item deleted successfully");
      loadMenus();
    } catch (err) {
      console.error("Failed to delete menu:", err);
      toastError("Failed to delete menu item");
    }
  };

  const handleEdit = (menu: MenuItem) => {
    setEditingMenu(menu);
    setFormData({
      name: menu.name,
      description: menu.description || "",
      price: menu.price.toString(),
      category: menu.category || "",
      available: menu.isAvailable,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      available: true,
    });
    setEditingMenu(null);
    setSelectedFile(null);
  };

  const formatCategory = (cat: string) => cat.replace(/_/g, " ");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Items</h1>
          <p className="text-muted-foreground mt-1">
            Manage your restaurant menu
          </p>
        </div>

        {/* Add/Edit Menu */}
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {editingMenu ? "Edit Item" : "Add Item"}
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMenu ? "Edit Menu Item" : "Add New Menu Item"}
              </DialogTitle>
              <DialogDescription>
                {editingMenu
                  ? "Update menu item details"
                  : "Create a new item for your menu"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (฿)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger id="category" className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="available" className="text-base">
                    Available
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Item is available for ordering
                  </p>
                </div>
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, available: checked })
                  }
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingMenu ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="h-8 w-8 rounded-full bg-primary/20 animate-pulse mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menus.map((menu) => (
            <Card key={menu.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle>{menu.name}</CardTitle>
                    {menu.category && (
                      <Badge variant="secondary">
                        {formatCategory(menu.category)}
                      </Badge>
                    )}
                  </div>
                  <Badge variant={menu.isAvailable ? "default" : "secondary"}>
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

                {/* Actions */}
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => handleEdit(menu)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <DeleteMenuDialog
                    menuId={menu.id}
                    menuName={menu.name}
                    onConfirm={handleDelete}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========== Delete Dialog Component ========== */
function DeleteMenuDialog({
  menuId,
  menuName,
  onConfirm,
}: {
  menuId: number;
  menuName: string;
  onConfirm: (id: number) => Promise<void>;
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm(menuId);
      toastSuccess(`Deleted "${menuName}" successfully`);
      setOpen(false);
    } catch (err) {
      console.error(err);
      toastError("Failed to delete menu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="flex-1">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Menu Item</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{menuName}</span>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
