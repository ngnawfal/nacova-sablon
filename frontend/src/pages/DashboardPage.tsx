import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatTimeWIB } from "@/lib/utils/format";
import { Alert, Badge } from "@/components/ui/card";

interface Sprint1Dashboard {
  attendance: { present: number; late: number; total: number };
  counts: { customers: number };
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

  const [data, setData] = React.useState<Sprint1Dashboard | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    void (async () => {
      const res = await apiFetch<Sprint1Dashboard>("/api/reports/dashboard");
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setData(res.data);
    })();
  }, []);

  if (error) return <Alert variant="error">{error}</Alert>;
  if (!data || !user) {
    return <div className="py-12 text-center text-sm text-muted">Memuat ringkasan...</div>;
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

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[28px] leading-[1.15] tracking-[-0.02em] font-medium text-ink">
          {monthName} <span className="text-muted font-normal">{yearLabel}</span>
        </h2>
        <Link to="/absensi" className="text-xs sm:text-sm text-sec hover:text-ink">
          Absensi harian →
        </Link>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-line bg-card p-4 sm:p-5">
          <p className="text-xs text-muted truncate">Kehadiran hari ini</p>
          <p className="mt-2 text-lg sm:text-[28px] leading-none font-medium tabular-nums text-ink">
            {data.attendance.present + data.attendance.late}
            <span className="text-xs sm:text-base font-normal text-muted"> / {data.attendance.total}</span>
          </p>
          <p className="mt-2 text-[11px] sm:text-xs text-muted">{data.attendance.late} terlambat</p>
        </div>

        <div className="rounded-xl border border-line bg-card p-4 sm:p-5">
          <p className="text-xs text-muted truncate">Status absen saya</p>
          <p className="mt-2 text-lg sm:text-[24px] leading-none font-medium text-ink">
            {data.myAttendance ? data.myAttendance.status : "Belum absen"}
          </p>
          <p className="mt-2 text-[11px] sm:text-xs text-muted font-mono">
            {data.myAttendance?.checkInAt ? `Masuk ${formatTimeWIB(data.myAttendance.checkInAt)} WIB` : "Klik Absen untuk check-in"}
          </p>
        </div>

        <div className="col-span-2 lg:col-span-1 rounded-xl border border-line bg-card p-4 sm:p-5">
          <p className="text-xs text-muted truncate">Data pelanggan terdaftar</p>
          <p className="mt-2 text-lg sm:text-[28px] leading-none font-medium tabular-nums text-ink">
            {data.counts.customers}
          </p>
          <p className="mt-2 text-[11px] sm:text-xs text-muted">
            {canManage ? (
              <Link to="/pelanggan" className="text-brand hover:underline">Kelola pelanggan →</Link>
            ) : (
              "Pelanggan aktif Nacova"
            )}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-ink">Log kehadiran hari ini</h3>
          {canManage ? (
            <Link to="/absensi/rekap" className="text-xs text-muted hover:text-ink">
              Lihat rekap bulanan →
            </Link>
          ) : null}
        </div>
        {data.todayAttendances.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">Belum ada karyawan yang absen hari ini.</p>
        ) : (
          <div className="divide-y divide-line text-sm">
            {data.todayAttendances.map((a) => (
              <div key={a.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink truncate">{a.name}</p>
                  <p className="text-xs text-muted font-mono">
                    {a.checkInAt ? `Masuk ${formatTimeWIB(a.checkInAt)} WIB` : "-"}
                    {a.checkOutAt ? ` • Pulang ${formatTimeWIB(a.checkOutAt)} WIB` : ""}
                  </p>
                </div>
                <Badge variant={a.status === "HADIR" ? "success" : "warning"}>{a.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
