import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export function DataTable<TData>({
  columns,
  data,
  emptyMessage = "Belum ada data.",
}: {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  emptyMessage?: string;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-card p-8 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line text-xs text-muted">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => {
                const canSort = header.column.getCanSort();
                return (
                  <th key={header.id} className="px-4 py-3 whitespace-nowrap font-normal">
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 hover:text-ink cursor-pointer"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-line">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-soft/50 transition-colors duration-150">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-ink">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
