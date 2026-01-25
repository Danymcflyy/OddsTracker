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
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2 } from "lucide-react";

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
      <div className="rounded-lg border bg-white">
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
                        "bg-white sticky top-0 z-10 border-b border-r last:border-r-0",
                        header.depth > 1 && "top-10" // Adjust top for nested headers if needed, but sticky handles it usually
                      )}
                      style={{
                        textAlign: header.colSpan > 1 ? "center" : "left",
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        canSort ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 -ml-3"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span className="mr-2">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </span>
                            {sortState === "asc" ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : sortState === "desc" ? (
                              <ArrowDown className="h-4 w-4" />
                            ) : (
                              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )
                      )}
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
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
