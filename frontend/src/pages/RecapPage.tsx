import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { apiFetch } from "@/lib/api";
import { formatDurationMinutes, getJakartaParts } from "@/lib/utils/format";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input, Label, Select } from "@/components/ui/input";

interface MonthlyRecapRow {
  userId: string;
  name: string;
  role: string;
  hadir: number;
  terlambat: number;
  izin: number;
  alpa: number;
  totalMinutes: number;
}

export function RecapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const nowParts = getJakartaParts();
  const month = Number(searchParams.get("month")) || nowParts.month;
  const year = Number(searchParams.get("year")) || nowParts.year;

  const [selectedMonth, setSelectedMonth] = React.useState(month);
  const [selectedYear, setSelectedYear] = React.useState(year);
  const [rows, setRows] = React.useState<MonthlyRecapRow[]>([]);
  const [workingDaysElapsed, setWorkingDaysElapsed] = React.useState(0);

  const load = React.useCallback(async () => {
    const res = await apiFetch<{
      workingDaysElapsed: number;
      rows: MonthlyRecapRow[];
    }>(`/api/attendances/recap?month=${month}&year=${year}`);
    if (res.ok) {
      setRows(res.data.rows);
      setWorkingDaysElapsed(res.data.workingDaysElapsed);
    }
  }, [month, year]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const columns: ColumnDef<MonthlyRecapRow, unknown>[] = [
    {
      accessorKey: "name",
      header: "Karyawan",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-ink">{row.original.name}</p>
          <p className="text-xs text-muted">{row.original.role}</p>
        </div>
      ),
    },
    { accessorKey: "hadir", header: "Hadir", cell: ({ row }) => <Badge variant="success">{row.original.hadir}</Badge> },
    { accessorKey: "terlambat", header: "Telat", cell: ({ row }) => <Badge variant="warning">{row.original.terlambat}</Badge> },
    { accessorKey: "izin", header: "Izin/Sakit", cell: ({ row }) => <Badge variant="neutral">{row.original.izin}</Badge> },
    { accessorKey: "alpa", header: "Alpa", cell: ({ row }) => <Badge variant="danger">{row.original.alpa}</Badge> },
    {
      accessorKey: "totalMinutes",
      header: "Total Jam Kerja",
      cell: ({ row }) => <span className="font-mono text-xs text-ink">{formatDurationMinutes(row.original.totalMinutes)}</span>,
    },
  ];

  function handleFilterSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setSearchParams({ month: String(selectedMonth), year: String(selectedYear) });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium tracking-[-0.01em] text-ink">Rekap Absensi Bulanan</h1>
          <p className="text-sm text-muted">
            Hari kerja berjalan periode ini: <span className="font-medium text-ink">{workingDaysElapsed} hari</span>
          </p>
        </div>

        <form onSubmit={handleFilterSubmit} className="flex items-end gap-2">
          <div>
            <Label htmlFor="month">Bulan</Label>
            <Select id="month" value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, idx) => (
                <option key={idx + 1} value={idx + 1}>{idx + 1}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="year">Tahun</Label>
            <Input id="year" type="number" className="w-24" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} />
          </div>
          <Button type="submit" variant="outline">Tampilkan</Button>
        </form>
      </div>

      <DataTable columns={columns} data={rows} emptyMessage="Belum ada karyawan aktif." />
    </div>
  );
}
