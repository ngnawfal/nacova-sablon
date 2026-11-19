import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { apiFetch } from "@/lib/api";
import { formatDurationMinutes, getJakartaParts } from "@/lib/utils/format";
import { Alert, Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [employees, setEmployees] = React.useState<Array<{ id: string; name: string }>>([]);

  const [leaveUserId, setLeaveUserId] = React.useState("");
  const [leaveDate, setLeaveDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [leaveStatus, setLeaveStatus] = React.useState<"IZIN" | "SAKIT" | "CUTI">("IZIN");
  const [leaveNote, setLeaveNote] = React.useState("");
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const load = React.useCallback(async () => {
    const res = await apiFetch<{
      workingDaysElapsed: number;
      rows: MonthlyRecapRow[];
      employees: Array<{ id: string; name: string }>;
    }>(`/api/attendances/recap?month=${month}&year=${year}`);
    if (res.ok) {
      setRows(res.data.rows);
      setWorkingDaysElapsed(res.data.workingDaysElapsed);
      setEmployees(res.data.employees);
      setLeaveUserId((prev) => prev || res.data.employees[0]?.id || "");
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

  async function handleLeaveSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);
    const res = await apiFetch<{ message?: string }>("/api/attendances/leave", {
      method: "POST",
      body: JSON.stringify({ userId: leaveUserId, date: leaveDate, status: leaveStatus, note: leaveNote }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setFeedback({ type: "error", text: res.error });
      return;
    }
    setFeedback({ type: "success", text: res.data.message ?? "Izin dicatat." });
    setLeaveNote("");
    await load();
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

      <Card>
        <CardHeader>
          <CardTitle>Input Izin / Sakit / Cuti Karyawan (US-10)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {feedback ? (
            <Alert variant={feedback.type === "error" ? "error" : "success"}>{feedback.text}</Alert>
          ) : null}

          <form onSubmit={handleLeaveSubmit} className="grid gap-3 sm:grid-cols-4">
            <div>
              <Label htmlFor="leaveUserId">Karyawan</Label>
              <Select id="leaveUserId" value={leaveUserId} onChange={(e) => setLeaveUserId(e.target.value)}>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="leaveDate">Tanggal</Label>
              <Input id="leaveDate" type="date" required value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="leaveStatus">Status</Label>
              <Select id="leaveStatus" value={leaveStatus} onChange={(e) => setLeaveStatus(e.target.value as "IZIN" | "SAKIT" | "CUTI")}>
                <option value="IZIN">IZIN</option>
                <option value="SAKIT">SAKIT</option>
                <option value="CUTI">CUTI</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="leaveNote">Keterangan</Label>
              <Input id="leaveNote" required minLength={3} placeholder="Alasan izin/sakit" value={leaveNote} onChange={(e) => setLeaveNote(e.target.value)} />
            </div>
            <div className="sm:col-span-4 flex justify-end">
              <Button type="submit" disabled={submitting || !leaveUserId}>
                {submitting ? "Menyimpan..." : "Simpan Izin/Sakit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
