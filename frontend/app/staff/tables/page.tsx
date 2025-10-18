"use client";

import { useEffect, useState, useRef } from "react";
import { tableApi } from "@/lib/api";
import type { Table } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer, QrCode } from "lucide-react";
import { generateQRCode } from "@/lib/qrcode";
import Image from "next/image";
import { restaurantConfig } from "@/config/restaurant";

export default function StaffTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

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
      const url = `${window.location.origin}/t/${table.code}`;
      const qr = await generateQRCode(url);
      setQrSrc(qr);
      setSelectedTable(table);
      setOpenDialog(true);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }
  };

  const handlePrintSlip = () => {
    if (!selectedTable || !qrSrc) return;

    const printContent = `
      <div style="
        font-family: 'Arial', sans-serif;
        width: 210px;
        text-align: center;
        margin: 8px auto 0 auto;
        padding: 8px 0;
      ">
        ${
          restaurantConfig.logo
            ? `<img src='${restaurantConfig.logo}' width='60' style='margin-bottom:6px;' />`
            : ""
        }
        <div style="font-size: 14px; font-weight: bold; margin-bottom: 4px;">
          ${restaurantConfig.name}
        </div>
        <div style="font-size: 10px; margin-bottom: 4px;">
          ${restaurantConfig.address}
        </div>
        <div style="font-size: 10px;">Tel: ${restaurantConfig.phone}</div>
        <hr style="border-top: 1px dashed #000; margin: 6px 0;" />
        <div style="font-size: 13px; font-weight: bold;">🪑 โต๊ะ ${
          selectedTable.code
        }</div>
        <div style="font-size: 10px; margin-bottom: 4px;">สแกนเพื่อสั่งอาหาร</div>
        <div style="display:flex; justify-content:center; align-items:center;">
          <img src="${qrSrc}" width="160" style="display:block; margin:0 auto;" />
        </div>
        <hr style="border-top: 1px dashed #000; margin: 6px 0;" />
        <div style="font-size: 10px;">พิมพ์เมื่อ: ${new Date().toLocaleString()}</div>
        <div style="font-size: 10px; margin-top: 4px;">
          ${restaurantConfig.footerMessage}<br/>
          Powered by ${restaurantConfig.poweredBy}
        </div>
      </div>
    `;

    const win = window.open("", "", "width=250,height=400");
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Print Slip</title>
            <style>
              @page { size: 57mm auto; margin: 0; }
              body { margin: 0; padding: 0; text-align: center; }
              img { display: block; margin: 0 auto; }
            </style>
          </head>
          <body>${printContent}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => window.close(), 500);
              }
            </script>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Tables</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          View and manage table status
        </p>
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
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Table QR Code</DialogTitle>
          </DialogHeader>
          {qrSrc && selectedTable ? (
            <div className="flex flex-col items-center gap-3">
              <div ref={printRef}>
                <h2 className="text-lg font-semibold mb-1">
                  Table {selectedTable.code}
                </h2>
                <Image
                  src={qrSrc}
                  alt="QR Code"
                  width={200}
                  height={200}
                  className="border rounded-md"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Scan to order at this table
                </p>
              </div>
              <Button variant="outline" onClick={handlePrintSlip}>
                <Printer /> Print Slip
              </Button>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Generating...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
