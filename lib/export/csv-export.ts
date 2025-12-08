import type { FixtureWithEnrichedOdds } from "@/types/fixture";

interface CsvExportOptions {
  filename: string;
  visibleColumns: string[];
  data: FixtureWithEnrichedOdds[];
  columnLabels?: Record<string, string>;
  formatCell?: (row: FixtureWithEnrichedOdds, columnId: string) => string | number | null;
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

export async function exportToCSV({
  filename,
  visibleColumns,
  data,
  columnLabels = DEFAULT_LABELS,
  formatCell = defaultFormatCell,
}: CsvExportOptions): Promise<Blob> {
  const headers = visibleColumns.map((columnId) => `"${columnLabels[columnId] ?? columnId}"`);
  const rows = data.map((row) =>
    visibleColumns
      .map((columnId) => formatCsvValue(formatCell(row, columnId ?? "")))
      .join(",")
  );

  const csvContent = [headers.join(","), ...rows].join("\n");
  return new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
}

function formatCsvValue(value: string | number | Date | null | undefined) {
  if (value === null || value === undefined) {
    return '""';
  }

  if (value instanceof Date) {
    return `"${value.toISOString()}"`;
  }

  if (typeof value === "number") {
    return value.toString();
  }

  const safe = value.replace(/"/g, '""');
  return `"${safe}"`;
}

function defaultFormatCell(row: FixtureWithEnrichedOdds, columnId: string) {
  if (!columnId.includes(".")) {
    const value = row as unknown as Record<string, unknown>;
    const result = value[columnId];
    return result instanceof Date ? result : formatPrimitive(result);
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
    return Number.isInteger(value) ? value : value.toFixed(2);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}
