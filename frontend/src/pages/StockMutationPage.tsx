import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { formatNumberID } from "@/lib/utils/format";
import { Alert, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

interface MaterialOpt {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
}

export function StockMutationPage() {
  const [materials, setMaterials] = React.useState<MaterialOpt[]>([]);
  const [mode, setMode] = React.useState<"IN" | "OUT" | "ADJUST">("IN");
  const [materialId, setMaterialId] = React.useState("");
  const [qty, setQty] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = React.useCallback(async () => {
    const res = await apiFetch<{ materials: MaterialOpt[] }>("/api/materials");
    if (res.ok) {
      setMaterials(res.data.materials);
      setMaterialId((prev) => prev || res.data.materials[0]?.id || "");
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const selected = materials.find((m) => m.id === materialId);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);
    try {
      const numericVal = Number(qty);
      const endpoint =
        mode === "IN"
          ? "/api/materials/stock-in"
          : mode === "OUT"
            ? "/api/materials/stock-out"
            : "/api/materials/adjust";
      const body =
        mode === "ADJUST"
          ? { materialId, actualStock: numericVal, reason }
          : { materialId, qty: numericVal, reason, reference };

      const res = await apiFetch<{ afterStock: number; message?: string }>(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setFeedback({ type: "error", text: res.error });
        return;
      }
      setFeedback({
        type: "success",
        text: `${res.data.message ?? "Mutasi tercatat."} Stok saat ini: ${formatNumberID(res.data.afterStock)} ${selected?.unit ?? ""}`,
      });
      setQty("");
      setReason("");
      setReference("");
      await load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/stok" className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-3 py-2 text-sm font-medium text-ink hover:bg-soft min-h-[44px]">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
        <div>
          <h1 className="text-xl font-medium tracking-[-0.01em] text-ink">Mutasi &amp; Stock Opname</h1>
        </div>
      </div>

      {feedback ? (
        <Alert variant={feedback.type === "error" ? "error" : "success"}>{feedback.text}</Alert>
      ) : null}

      <div className="grid grid-cols-3 gap-2">
        {[
          { key: "IN", label: "Stok Masuk (IN)" },
          { key: "OUT", label: "Stok Keluar (OUT)" },
          { key: "ADJUST", label: "Opname (ADJUST)" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setMode(tab.key as "IN" | "OUT" | "ADJUST");
              setFeedback(null);
            }}
            className={`rounded-lg border px-3 py-2.5 text-xs font-semibold min-h-[44px] cursor-pointer transition-colors ${
              mode === tab.key ? "border-brand bg-brand text-white" : "border-line bg-card text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "IN" ? "Form Stok Masuk" : mode === "OUT" ? "Form Stok Keluar" : "Form Stock Opname (Penyesuaian Fisik)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="mut-mat">Bahan</Label>
              <Select id="mut-mat" value={materialId} onChange={(e) => setMaterialId(e.target.value)}>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (Stok: {formatNumberID(m.currentStock)} {m.unit})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="mut-qty">
                {mode === "ADJUST" ? `Stok Fisik Aktual (${selected?.unit ?? ""})` : `Jumlah (${selected?.unit ?? ""})`}
              </Label>
              <Input id="mut-qty" type="number" step="0.01" min={mode === "ADJUST" ? "0" : "0.01"} required value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
            {mode !== "ADJUST" ? (
              <div>
                <Label htmlFor="mut-ref">Referensi Nota / Kode Pesanan (Opsional)</Label>
                <Input id="mut-ref" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Contoh: NCV-2026-0001 / PO-012" />
              </div>
            ) : null}
            <div>
              <Label htmlFor="mut-reason">{mode === "ADJUST" ? "Alasan Opname (Wajib)" : "Keterangan (Opsional)"}</Label>
              <Textarea id="mut-reason" required={mode === "ADJUST"} minLength={mode === "ADJUST" ? 3 : 0} value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={loading || !materialId}>
              {loading ? "Memproses..." : "Simpan Mutasi Stok"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
