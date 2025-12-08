import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export function formatDate(date: Date | string, formatStr: string = "dd/MM/yyyy"): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: fr });
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, "dd/MM/yyyy HH:mm");
}
