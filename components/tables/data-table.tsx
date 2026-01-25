"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  pagination: PaginationState;
  sorting: SortingState;
  onPaginationChange: (pagination: PaginationState) => void;
  onSortingChange: (sorting: SortingState) => void;
  isLoading?: boolean;
  pageSizeOptions?: number[];
  emptyState?: React.ReactNode;
  className?: string;
  renderToolbar?: (table: TanstackTable<TData>) => React.ReactNode;
}

/**
 * Composant générique TanStack Table v8
 * - Pagination et tri côté serveur
 * - Support des colonnes dynamiques (ColumnDef passé en props)
 * - UI minimaliste conforme au design OddsTracker
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pagination,
  sorting,
  onPaginationChange,
  onSortingChange,
  isLoading = false,
  pageSizeOptions = [25, 50, 100],
  emptyState = "Aucun résultat à afficher",
  className,
  renderToolbar,
}: DataTableProps<TData, TValue>) {
  const handlePaginationChange = React.useCallback(
    (
      updater:
        | PaginationState
        | ((prev: PaginationState) => PaginationState)
    ) => {
      const nextState =
        typeof updater === "function" ? updater(pagination) : updater;
      onPaginationChange(nextState);
    },
    [onPaginationChange, pagination]
  );

  const handleSortingChange = React.useCallback(
    (updater: SortingState | ((prev: SortingState) => SortingState)) => {
      const nextState =
        typeof updater === "function" ? updater(sorting) : updater;
      onSortingChange(nextState);
    },
    [onSortingChange, sorting]
  );

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination,
      sorting,
    },
    manualPagination: true,
    manualSorting: true,
    autoResetPageIndex: false,
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = Math.max(pageCount, 1);
  const currentPage = Math.min(pagination.pageIndex + 1, totalPages);

  return (
    <div className={cn("space-y-4", className)}>
      {renderToolbar ? <div className="flex flex-col gap-3">{renderToolbar(table)}</div> : null}
      <div className="rounded-lg border bg-white overflow-x-auto">
        <Table>
          <TableHeader className="bg-white sticky top-0 z-10 shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  if (header.isPlaceholder) {
                    return (
                      <TableHead key={`${headerGroup.id}-${header.id}`} />
                    );
                  }

                  const canSort = header.column.getCanSort();
                  const sortState = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        "sticky top-0 z-10 border-b border-r last:border-r-0 p-0",
                        // Hierarchical background colors
                        header.depth === 0 ? "bg-slate-100 font-bold text-slate-900 h-10" : 
                        header.depth === 1 ? "bg-slate-50 font-semibold text-slate-700 h-9" : 
                        "bg-white font-medium text-slate-600 h-8"
                      )}
                      style={{
                        textAlign: header.colSpan > 1 ? "center" : "left",
                        // Correct sticky offset for nested rows
                        top: header.depth * 40, // 40px is approx height of each header row
                      }}
                    >
                      <div className="relative group px-2 py-1 h-full flex items-center justify-center">
                        {header.isPlaceholder ? null : (
                          <>
                            <span className="truncate">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </span>
                            
                            {/* Hide button - visible on hover */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                header.column.toggleVisibility(false);
                              }}
                              className="absolute right-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-1"
                              title="Masquer ce groupe"
                            >
                              <EyeOff className="h-3 w-3" />
                            </button>

                            {canSort && header.depth > 1 && (
                              <button
                                onClick={header.column.getToggleSortingHandler()}
                                className="ml-1 opacity-50 hover:opacity-100"
                              >
                                {sortState === "asc" ? (
                                  <ArrowUp className="h-3 w-3" />
                                ) : sortState === "desc" ? (
                                  <ArrowDown className="h-3 w-3" />
                                ) : (
                                  <ArrowUpDown className="h-3 w-3" />
                                )}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Chargement des données...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="hover:bg-slate-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-1 px-2 border-r last:border-r-0 border-b">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm text-muted-foreground">
                  {emptyState}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} / {totalPages}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Lignes par page</span>
            <select
              className="h-9 rounded-md border bg-transparent px-2 text-sm"
              value={pagination.pageSize}
              onChange={(event) =>
                handlePaginationChange({
                  ...pagination,
                  pageSize: Number(event.target.value),
                  pageIndex: 0,
                })
              }
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePaginationChange({ ...pagination, pageIndex: 0 })}
              disabled={pagination.pageIndex === 0}
            >
              Début
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handlePaginationChange({
                  ...pagination,
                  pageIndex: Math.max(pagination.pageIndex - 1, 0),
                })
              }
              disabled={pagination.pageIndex === 0}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handlePaginationChange({
                  ...pagination,
                  pageIndex: Math.min(pagination.pageIndex + 1, totalPages - 1),
                })
              }
              disabled={pagination.pageIndex >= totalPages - 1}
            >
              Suivant
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handlePaginationChange({
                  ...pagination,
                  pageIndex: totalPages - 1,
                })
              }
              disabled={pagination.pageIndex >= totalPages - 1}
            >
              Fin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
