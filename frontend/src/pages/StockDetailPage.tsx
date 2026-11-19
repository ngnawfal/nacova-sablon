import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatDateTimeWIB, formatNumberID } from "@/lib/utils/format";
import { Alert, Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MaterialDetail {
  id: string;
  name: string;
  category: string;
  sku: string | null;
  unit: string;
  currentStock: number;
  minStock: number;
  alertStatus: "HABIS" | "MENIPIS" | "AMAN";
  movements: Array<{
    id: string;
    type: "IN" | "OUT" | "ADJUST";
    qty: number;
    beforeStock: number;
    afterStock: number;
    reason: string | null;
    reference: string | null;
    createdAt: string;
    createdBy: { name: string };
  }>;
}

export function StockDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [material, setMaterial] = React.useState<MaterialDetail | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    void (async () => {
      const res = await apiFetch<{ material: MaterialDetail }>(`/api/materials/${id}`);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setMaterial(res.data.material);
    })();
  }, [id]);

  if (error) return <Alert variant="error">{error}</Alert>;
  if (!material) return <div className="py-12 text-center text-sm text-muted">Memuat detail bahan...</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/stok" className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-3 py-2 text-sm font-medium text-ink hover:bg-soft min-h-[44px]">
          <ArrowLeft className="h-4 w-4" />
          Daftar Stok
        </Link>
        <div>
          <h1 className="text-xl font-medium tracking-[-0.01em] text-ink">{material.name}</h1>
          <p className="text-xs text-muted">{material.category} • SKU: {material.sku || "-"}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-xs font-medium text-muted">Stok Saat Ini</CardTitle></CardHeader>
          <CardContent className="text-2xl font-medium font-mono text-ink">{formatNumberID(material.currentStock)} {material.unit}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-xs font-medium text-muted">Stok Minimum</CardTitle></CardHeader>
          <CardContent className="text-2xl font-medium font-mono text-muted">{formatNumberID(material.minStock)} {material.unit}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-xs font-medium text-muted">Status</CardTitle></CardHeader>
          <CardContent>
            <Badge variant={material.alertStatus === "HABIS" ? "danger" : material.alertStatus === "MENIPIS" ? "warning" : "success"}>
              {material.alertStatus}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Riwayat Mutasi Stok</CardTitle></CardHeader>
        <CardContent>
          {material.movements.length === 0 ? (
            <p className="text-sm text-muted">Belum ada riwayat mutasi.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm tabular-nums">
                <thead className="border-b border-line text-xs font-medium text-muted">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Waktu (WIB)</th>
                    <th className="py-2 pr-4 font-medium">Tipe</th>
                    <th className="py-2 pr-4 font-medium">Jumlah</th>
                    <th className="py-2 pr-4 font-medium">Sebelum → Sesudah</th>
                    <th className="py-2 pr-4 font-medium">Alasan / Ref</th>
                    <th className="py-2 font-medium">Pencatat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {material.movements.map((mv) => (
                    <tr key={mv.id}>
                      <td className="py-2.5 pr-4 whitespace-nowrap font-mono text-xs text-muted">{formatDateTimeWIB(mv.createdAt)}</td>
                      <td className="py-2.5 pr-4"><Badge variant={mv.type === "IN" ? "success" : mv.type === "OUT" ? "danger" : "warning"}>{mv.type}</Badge></td>
                      <td className="py-2.5 pr-4 font-mono text-ink">{formatNumberID(mv.qty)} {material.unit}</td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-muted">{formatNumberID(mv.beforeStock)} → {formatNumberID(mv.afterStock)}</td>
                      <td className="py-2.5 pr-4 text-ink">
                        {mv.reason || "-"}
                        {mv.reference ? <span className="ml-1 font-mono text-xs text-muted">({mv.reference})</span> : null}
                      </td>
                      <td className="py-2.5 text-muted">{mv.createdBy.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
