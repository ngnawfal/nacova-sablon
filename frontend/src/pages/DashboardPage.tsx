import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, SlidersHorizontal } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDateTimeWIB, formatNumberID, formatTimeWIB } from "@/lib/utils/format";
import { Alert, Badge } from "@/components/ui/card";

interface Sprint2Dashboard {
  sprint: number;
  attendance: { present: number; late: number; leave: number; total: number };
  counts: {
    customers: number;
    materials: number;
    safeStock: number;
    lowStock: number;
    outOfStock: number;
    menipis: number;
  };
  lowStockItems: Array<{
    id: string;
    name: string;
    category: string;
    unit: string;
    currentStock: number;
    minStock: number;
    supplierName: string | null;
    alertStatus: "HABIS" | "MENIPIS" | "AMAN";
  }>;
  recentMovements: Array<{
    id: string;
    materialId: string;
    materialName: string;
    unit: string;
    type: "IN" | "OUT" | "ADJUST";
    qty: number;
    afterStock: number;
    reason: string | null;
    createdByName: string;
    createdAt: string;
  }>;
  myAttendance: { status: string; checkInAt: string | null; checkOutAt: string | null } | null;
  todayAttendances: Array<{
    id: string;
    name: string;
    role: string;
    status: string;
    checkInAt: string | null;
    checkOutAt: string | null;
  }>;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const forbidden = searchParams.get("forbidden") === "1";

  const [data, setData] = React.useState<Sprint2Dashboard | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    void (async () => {
      const res = await apiFetch<Sprint2Dashboard>("/api/reports/dashboard");
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setData(res.data);
    })();
  }, []);

  if (error) return <Alert variant="error">{error}</Alert>;
  if (!data || !user) {
    return <div className="py-12 text-center text-sm text-muted">Memuat ringkasan workshop...</div>;
  }

  const canManage = user.role !== "PRODUCTION";
  const now = new Date();
  const monthName = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", month: "long" }).format(now);
  const yearLabel = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", year: "numeric" }).format(now);

  return (
    <div className="space-y-6">
      {forbidden ? (
        <Alert variant="error">
          Akses ditolak: role {user.role} tidak memiliki izin ke halaman tersebut.
        </Alert>
      ) : null}

      {/* Period Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[28px] leading-[1.15] tracking-[-0.02em] font-medium text-ink">
          {monthName} <span className="text-muted font-normal">{yearLabel}</span>
        </h2>
        <Link
          to={canManage ? "/stok" : "/absensi"}
          className="text-xs sm:text-sm text-sec hover:text-ink transition-colors duration-150"
        >
          {canManage ? "Buka gudang bahan →" : "Absensi harian →"}
        </Link>
      </div>

      {/* Prominent Red Low-Stock Alert Banner (AC US-07 PPT Slide 15 / US-08) */}
      {data.lowStockItems.length > 0 ? (
        <section
          aria-label="Peringatan stok minimum"
          className="rounded-xl border border-red-700/25 bg-red-50/80 p-4 sm:p-5 text-red-900"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-700 shrink-0" />
              <h3 className="text-sm font-semibold text-red-900">
                Peringatan Stok Minimum ({data.lowStockItems.length} bahan perlu perhatian)
              </h3>
            </div>
            {canManage ? (
              <Link
                to="/stok/mutasi"
                className="text-xs font-medium text-red-800 underline underline-offset-2 hover:text-red-950"
              >
                Catat restok sekarang →
              </Link>
            ) : null}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.lowStockItems.map((m) => (
              <Link
                key={m.id}
                to={`/stok/${m.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-red-700/20 bg-card px-3.5 py-2.5 hover:border-red-700/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-red-900 truncate">
                    {m.name} {m.alertStatus === "HABIS" ? "habis" : "hampir habis"}
                  </p>
                  <p className="font-mono text-xs text-red-700/90 tabular-nums">
                    Sisa {formatNumberID(m.currentStock)} {m.unit} • Minimum {formatNumberID(m.minStock)} {m.unit}
                  </p>
                </div>
                <Badge variant="danger" className="shrink-0">
                  {m.alertStatus === "HABIS" ? "HABIS" : "MENIPIS"}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Row 1: 4 Clean Stat Cards — 2x2 on mobile, 4-col on desktop */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <div className="rounded-xl border border-line bg-card p-4 sm:p-5">
          <p className="text-xs text-muted truncate">Kehadiran hari ini</p>
          <p className="mt-2 text-lg sm:text-[28px] leading-none font-medium tabular-nums text-ink">
            {data.attendance.present + data.attendance.late}
            <span className="text-xs sm:text-base font-normal text-muted"> / {data.attendance.total}</span>
          </p>
          <p className="mt-2 text-[11px] sm:text-xs text-muted truncate">
            {data.attendance.late} terlambat · {data.attendance.leave} izin
          </p>
        </div>

        <div className="rounded-xl border border-line bg-card p-4 sm:p-5">
          <p className="text-xs text-muted truncate">Bahan perlu restok</p>
          <p
            className={`mt-2 text-lg sm:text-[28px] leading-none font-medium tabular-nums ${
              data.counts.lowStock > 0 ? "text-red-700" : "text-ink"
            }`}
          >
            {String(data.counts.lowStock).padStart(2, "0")}
          </p>
          <p className="mt-2 text-[11px] sm:text-xs text-muted truncate">
            {data.counts.outOfStock} habis · {data.counts.menipis} menipis
          </p>
        </div>

        <div className="rounded-xl border border-line bg-card p-4 sm:p-5">
          <p className="text-xs text-muted truncate">Total bahan aktif</p>
          <p className="mt-2 text-lg sm:text-[28px] leading-none font-medium tabular-nums text-ink">
            {data.counts.materials}
          </p>
          <p className="mt-2 text-[11px] sm:text-xs text-muted truncate">
            {data.counts.safeStock} bahan berstatus aman
          </p>
        </div>

        <div className="rounded-xl border border-line bg-card p-4 sm:p-5">
          <p className="text-xs text-muted truncate">
            {canManage ? "Data pelanggan" : "Status absen saya"}
          </p>
          <p className="mt-2 text-lg sm:text-[28px] leading-none font-medium tabular-nums text-ink truncate">
            {canManage
              ? data.counts.customers
              : data.myAttendance
                ? data.myAttendance.status
                : "Belum"}
          </p>
          <p className="mt-2 text-[11px] sm:text-xs text-muted truncate">
            {canManage
              ? "Pelanggan terdaftar aktif"
              : data.myAttendance?.checkInAt
                ? `Masuk ${formatTimeWIB(data.myAttendance.checkInAt)} WIB`
                : "Belum check-in hari ini"}
          </p>
        </div>
      </section>

      {/* Row 2: Recent Stock Movements (8 cols) + Today Attendance (4 cols) */}
      <section className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8 rounded-xl border border-line bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-ink">Mutasi stok terbaru</h3>
            <Link to="/stok" className="text-xs text-muted hover:text-ink">
              Lihat semua bahan →
            </Link>
          </div>
          {data.recentMovements.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Belum ada mutasi stok tercatat.</p>
          ) : (
            <div className="divide-y divide-line text-sm">
              {data.recentMovements.map((mv) => (
                <div key={mv.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                        mv.type === "IN"
                          ? "border-emerald-700/20 bg-emerald-50 text-emerald-700"
                          : mv.type === "OUT"
                            ? "border-red-700/20 bg-red-50 text-red-700"
                            : "border-amber-700/20 bg-amber-50 text-amber-800"
                      }`}
                    >
                      {mv.type === "IN" ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : mv.type === "OUT" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <SlidersHorizontal className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <Link
                        to={`/stok/${mv.materialId}`}
                        className="font-medium text-ink hover:text-brand block truncate"
                      >
                        {mv.materialName}
                      </Link>
                      <p className="text-xs text-muted truncate">
                        {mv.reason || mv.type} • {mv.createdByName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-xs font-medium text-ink tabular-nums">
                      {mv.type === "IN" ? "+" : mv.type === "OUT" ? "-" : "±"}
                      {formatNumberID(mv.qty)} {mv.unit}
                    </p>
                    <p className="font-mono text-[11px] text-muted">
                      Sisa {formatNumberID(mv.afterStock)} • {formatDateTimeWIB(mv.createdAt).split(",")[0]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 rounded-xl border border-line bg-card p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-ink">Absensi hari ini</h3>
              <Link
                to={canManage ? "/absensi/rekap" : "/absensi"}
                className="text-xs text-muted hover:text-ink"
              >
                {canManage ? "Rekap →" : "Absen →"}
              </Link>
            </div>
            {data.todayAttendances.length === 0 ? (
              <p className="py-4 text-xs text-muted">Belum ada catatan absensi hari ini.</p>
            ) : (
              <div className="divide-y divide-line">
                {data.todayAttendances.map((a) => (
                  <div key={a.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{a.name}</p>
                      <p className="font-mono text-xs text-muted">
                        {a.checkInAt ? `Masuk ${formatTimeWIB(a.checkInAt)} WIB` : a.status}
                      </p>
                    </div>
                    <Badge
                      variant={
                        a.status === "HADIR"
                          ? "success"
                          : a.status === "TERLAMBAT"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {a.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {canManage ? (
            <div className="border-t border-line pt-3 flex items-center justify-between text-xs">
              <span className="text-muted">Akses cepat</span>
              <div className="flex items-center gap-3">
                <Link to="/pelanggan" className="text-sec hover:text-ink">Pelanggan</Link>
                <Link to="/stok/mutasi" className="text-brand hover:underline">Mutasi stok</Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
