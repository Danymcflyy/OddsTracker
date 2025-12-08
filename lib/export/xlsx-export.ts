import ExcelJS from "exceljs";
import type { FixtureWithEnrichedOdds } from "@/types/fixture";

interface XlsxExportOptions {
  filename: string;
  visibleColumns: string[];
  data: FixtureWithEnrichedOdds[];
  columnLabels?: Record<string, string>;
  formatCell?: (row: FixtureWithEnrichedOdds, columnId: string) => string | number | null | Date;
}

const DEFAULT_LABELS: Record<string, string> = {
  "start_time": "Date",
  "league.country.name": "Pays",
  "league.name": "Ligue",
  "home_team.name": "Home",
  "away_team.name": "Away",
  "home_score": "Score Home",
  "away_score": "Score Away",
};

export async function exportToXLSX({
  filename,
  visibleColumns,
  data,
  columnLabels = DEFAULT_LABELS,
  formatCell = defaultFormatCell,
}: XlsxExportOptions): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Données");

  worksheet.columns = visibleColumns.map((columnId) => ({
    header: columnLabels[columnId] ?? columnId,
    key: columnId,
    width: 18,
  }));

  data.forEach((row) => {
    const rowData: Record<string, string | number | Date | null> = {};
    visibleColumns.forEach((columnId) => {
      rowData[columnId] = formatCell(row, columnId);
    });
    worksheet.addRow(rowData);
  });

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
  worksheet.getRow(1).height = 20;

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function defaultFormatCell(row: FixtureWithEnrichedOdds, columnId: string) {
  if (!columnId.includes(".")) {
    return formatPrimitive((row as unknown as Record<string, unknown>)[columnId]);
  }

  const segments = columnId.split(".");
  let current: any = row;

  for (const segment of segments) {
    if (current == null) return null;
    current = current[segment];
  }

  return formatPrimitive(current);
}

function formatPrimitive(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? value : Number(value.toFixed(2));
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string") {
    const parsedDate = Date.parse(value);
    if (!Number.isNaN(parsedDate) && value.includes("T")) {
      return new Date(parsedDate);
    }
    return value;
  }

  return JSON.stringify(value);
}
