"use client";

import { useState, useEffect } from "react";

export function useColumnVisibility(sportSlug: string, defaultColumns: string[]) {
  const storageKey = `oddstracker_columns_${sportSlug}`;

  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") {
      return defaultColumns.reduce((acc, col) => ({ ...acc, [col]: true }), {});
    }

    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return defaultColumns.reduce((acc, col) => ({ ...acc, [col]: true }), {});
      }
    }
    return defaultColumns.reduce((acc, col) => ({ ...acc, [col]: true }), {});
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(columnVisibility));
  }, [columnVisibility, storageKey]);

  const toggleColumn = (columnId: string) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  return {
    columnVisibility,
    toggleColumn,
    setColumnVisibility,
  };
}
