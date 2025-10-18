"use client";

import { useEffect, useState } from "react";
import { tableApi } from "@/lib/api";
import type { Table } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, QrCode } from "lucide-react";
import { generateQRCode } from "@/lib/qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const data = await tableApi.list();
      setTables(data);
    } catch (error) {
      console.error("Failed to load tables:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOccupancy = async (id: number) => {
    try {
      await tableApi.toggleOccupancy(id);
      loadTables();
    } catch (error) {
      console.error("Failed to toggle occupancy:", error);
    }
  };

  const handleGenerateQRCode = async (table: Table) => {
    try {
      // Generate a QR code that links to the table ordering page
      const tableUrl = `${window.location.origin}/t/${table.code}`;
      const qr = await generateQRCode(tableUrl);
      console.log(tableUrl);
      setQrSrc(qr);
      setSelectedTable(table);
      setDialogOpen(true);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Tables</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage restaurant tables and QR codes
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Table
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="h-8 w-8 rounded-full bg-primary/20 animate-pulse mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {tables.map((table) => (
            <Card key={table.id}>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">
                    Table {table.code}
                  </CardTitle>
                  <Badge
                    variant={table.isOccupied ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {table.isOccupied ? "Occupied" : "Available"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
                <div className="text-xs sm:text-sm space-y-1">
                  <p className="text-muted-foreground">
                    Capacity: {table.capacity} people
                  </p>
                  <p className="text-muted-foreground break-all">
                    Code:{" "}
                    <code className="bg-muted px-1 py-0.5 rounded text-xs">
                      {table.code}
                    </code>
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent text-xs sm:text-sm"
                    onClick={() => handleToggleOccupancy(table.id)}
                  >
                    {table.isOccupied ? "Mark Available" : "Mark Occupied"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 bg-transparent"
                    onClick={() => handleGenerateQRCode(table)}
                  >
                    <QrCode className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {selectedTable ? `Table ${selectedTable.code}` : "QR Code"}
            </DialogTitle>
            <DialogDescription>
              Scan this QR code to open the table’s ordering page.
            </DialogDescription>
          </DialogHeader>

          {qrSrc ? (
            <div className="flex flex-col items-center justify-center space-y-3">
              <Image
                src={qrSrc}
                alt="QR Code"
                width={200}
                height={200}
                className="rounded-lg border p-2 bg-white"
              />
              <p className="text-xs text-muted-foreground text-center break-all">
                {`${window.location.origin}/t/${selectedTable?.code}`}
              </p>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Generating QR code...
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
