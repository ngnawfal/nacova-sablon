import * as React from "react";
import { CheckCircle2, Clock, LogIn, LogOut } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatDateWIB, formatDurationMinutes, formatTimeWIB } from "@/lib/utils/format";
import { Alert, Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AttendanceItem {
  id: string;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  status: string;
  workMinutes: number;
  note: string | null;
}

interface OverviewPayload {
  setting: { workStartTime: string; lateToleranceMin: number; workEndTime: string };
  todayRecord: AttendanceItem | null;
  recent: AttendanceItem[];
}

export function AttendancePage() {
  const [data, setData] = React.useState<OverviewPayload | null>(null);
  const [clockText, setClockText] = React.useState("--:--:--");
  const [todayText, setTodayText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = React.useCallback(async () => {
    const res = await apiFetch<OverviewPayload>("/api/attendances/overview");
    if (res.ok) setData(res.data);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      setClockText(
        new Intl.DateTimeFormat("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(now)
      );
      setTodayText(
        new Intl.DateTimeFormat("id-ID", {
          timeZone: "Asia/Jakarta",
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(now)
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  async function handleCheckIn() {
    setFeedback(null);
    setLoading(true);
    const res = await apiFetch<{ message?: string }>("/api/attendances/check-in", { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      setFeedback({ type: "error", text: res.error });
      return;
    }
    setFeedback({ type: "success", text: res.data.message ?? "Absen masuk tercatat." });
    await load();
  }

  async function handleCheckOut() {
    setFeedback(null);
    setLoading(true);
    const res = await apiFetch<{ message?: string }>("/api/attendances/check-out", { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      setFeedback({ type: "error", text: res.error });
      return;
    }
    setFeedback({ type: "success", text: res.data.message ?? "Absen pulang tercatat." });
    await load();
  }

  const setting = data?.setting ?? { workStartTime: "08:00", lateToleranceMin: 15, workEndTime: "17:00" };
  const todayRecord = data?.todayRecord ?? null;
  const recent = data?.recent ?? [];

  const isLeave =
    todayRecord &&
    (todayRecord.status === "IZIN" || todayRecord.status === "SAKIT" || todayRecord.status === "CUTI");

  const statusVariant = (status: string) => {
    if (status === "HADIR") return "success" as const;
    if (status === "TERLAMBAT" || status === "IZIN" || status === "SAKIT" || status === "CUTI")
      return "warning" as const;
    return "danger" as const;
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-medium tracking-[-0.01em] text-ink">Absensi Harian</h1>

      {feedback ? (
        <Alert variant={feedback.type === "error" ? "error" : "success"}>{feedback.text}</Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5 overflow-hidden rounded-xl border border-line bg-card">
        <div className="bg-soft px-6 py-8 text-center border-b border-line">
          <p className="text-xs font-medium text-muted">{todayText || "Memuat tanggal..."}</p>
          <p className="mt-2 font-mono text-5xl sm:text-6xl font-semibold tracking-tight tabular-nums text-ink">
            {clockText}
          </p>
          <p className="mt-1.5 text-xs font-medium text-brand">WIB • Shift {setting.workStartTime}</p>
        </div>

        <div className="p-6 space-y-4 text-center">
          {!data ? (
            <p className="text-sm text-muted">Memuat status hari ini...</p>
          ) : !todayRecord ? (
            <Button size="hero" onClick={handleCheckIn} disabled={loading}>
              <LogIn className="h-6 w-6" />
              {loading ? "Mencatat..." : "Absen Masuk Sekarang"}
            </Button>
          ) : isLeave ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="font-semibold">Status Hari Ini: {todayRecord.status}</p>
              {todayRecord.note ? <p className="mt-1">{todayRecord.note}</p> : null}
            </div>
          ) : !todayRecord.checkOutAt ? (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-soft px-3.5 py-2 text-sm text-ink">
                <Clock className="h-4 w-4 text-brand" />
                <span>
                  Masuk{" "}
                  <strong className="font-mono">
                    {todayRecord.checkInAt ? formatTimeWIB(todayRecord.checkInAt) : "-"}
                  </strong>{" "}
                  WIB
                </span>
                <Badge variant={statusVariant(todayRecord.status)}>{todayRecord.status}</Badge>
              </div>
              <Button size="hero" variant="secondary" onClick={handleCheckOut} disabled={loading}>
                <LogOut className="h-6 w-6" />
                {loading ? "Mencatat..." : "Absen Pulang"}
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-1 text-emerald-800">
              <div className="flex items-center justify-center gap-2 font-semibold">
                <CheckCircle2 className="h-5 w-5" />
                <span>Shift Hari Ini Selesai</span>
              </div>
              <p className="font-mono text-xs">
                Masuk {todayRecord.checkInAt ? formatTimeWIB(todayRecord.checkInAt) : "-"} • Pulang{" "}
                {formatTimeWIB(todayRecord.checkOutAt)} WIB •{" "}
                {formatDurationMinutes(todayRecord.workMinutes)}
              </p>
            </div>
          )}
        </div>
      </div>

        <Card className="lg:col-span-7">
        <CardHeader>
          <CardTitle>Riwayat 14 Hari Terakhir</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted">Belum ada catatan absensi.</p>
          ) : (
            <div className="divide-y divide-line">
              {recent.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium text-ink">{formatDateWIB(r.date)}</p>
                    <p className="font-mono text-xs text-muted">
                      {r.checkInAt ? `Masuk ${formatTimeWIB(r.checkInAt)}` : r.note || "Tanpa check-in"}
                      {r.checkOutAt ? ` → Pulang ${formatTimeWIB(r.checkOutAt)}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                    {r.workMinutes > 0 ? (
                      <p className="mt-1 font-mono text-xs text-muted">{formatDurationMinutes(r.workMinutes)}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
