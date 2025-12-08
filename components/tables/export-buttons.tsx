"use client";

import * as React from "react";
import { Download } from "lucide-react";
import type { Table as TanstackTable } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import type { FixtureWithEnrichedOdds } from "@/types/fixture";
import { exportToCSV } from "@/lib/export/csv-export";
import { exportToXLSX } from "@/lib/export/xlsx-export";
import type { CsvExportOptions } from "@/lib/export/csv-export";
import type { XlsxExportOptions } from "@/lib/export/xlsx-export";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonsProps<TData extends FixtureWithEnrichedOdds> {
  table: TanstackTable<TData>;
  filename?: string;
  columnLabels?: Record<string, string>;
  formatCell?: (
    row: TData,
    columnId: string
  ) => string | number | Date | null | undefined;
}

export function ExportButtons<TData extends FixtureWithEnrichedOdds>({
  table,
  filename = "export",
  columnLabels,
  formatCell,
}: ExportButtonsProps<TData>) {
  const { toast } = useToast();

  const handleExport = React.useCallback(
    async (type: "csv" | "xlsx") => {
      try {
        const rows = table.getRowModel().rows.map((row) => row.original);
        if (!rows.length) {
          toast({
            title: "Export impossible",
            description: "Aucune donnée à exporter.",
            variant: "destructive",
          });
          return;
        }

        const visibleColumns = table
          .getAllLeafColumns()
          .filter((column) => column.getIsVisible())
          .map((column) => column.id);

        const options = {
          filename: `${filename}-${new Date().toISOString().replace(/[:.]/g, "-")}`,
          visibleColumns,
          data: rows,
          columnLabels,
          formatCell: formatCell as
            | CsvExportOptions["formatCell"]
            | XlsxExportOptions["formatCell"],
        } satisfies CsvExportOptions & XlsxExportOptions;

        const blob =
          type === "csv"
            ? await exportToCSV(options)
            : await exportToXLSX(options);

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${options.filename}.${type}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        toast({
          title: "Erreur lors de l'export",
          description:
            error instanceof Error ? error.message : "Export impossible",
          variant: "destructive",
        });
      }
    },
    [table, toast, filename, columnLabels, formatCell]
  );

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => handleExport("csv")}
      >
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
      <Button size="sm" className="gap-2" onClick={() => handleExport("xlsx")}>
        <Download className="h-4 w-4" />
        Export XLSX
      </Button>
    </div>
  );
}
