import * as React from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { AlertTriangle, ArrowLeftRight, CheckCircle2, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { materialSchema, supplierSchema, type MaterialInput, type SupplierInput } from "@/lib/validations/material";
import { formatNumberID } from "@/lib/utils/format";
import { Alert, Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

interface MaterialRow {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  alertStatus: "HABIS" | "MENIPIS" | "AMAN";
  supplier: { id: string; name: string } | null;
}

export function StockPage() {
  const { user } = useAuth();
  const canEdit = user?.role === "OWNER" || user?.role === "ADMIN";

  const [materials, setMaterials] = React.useState<MaterialRow[]>([]);
  const [suppliers, setSuppliers] = React.useState<Array<{ id: string; name: string }>>([]);
  const [onlyLow, setOnlyLow] = React.useState(false);
  const [showMaterialForm, setShowMaterialForm] = React.useState(false);
  const [showSupplierForm, setShowSupplierForm] = React.useState(false);
  const [editing, setEditing] = React.useState<MaterialRow | null>(null);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = React.useCallback(async () => {
    const [matRes, supRes] = await Promise.all([
      apiFetch<{ materials: MaterialRow[] }>("/api/materials"),
      apiFetch<{ suppliers: Array<{ id: string; name: string }> }>("/api/materials/suppliers"),
    ]);
    if (matRes.ok) setMaterials(matRes.data.materials);
    if (supRes.ok) setSuppliers(supRes.data.suppliers);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const matForm = useForm<z.input<typeof materialSchema>, unknown, MaterialInput>({
    resolver: zodResolver(materialSchema),
    defaultValues: { name: "", sku: "", category: "Tinta", unit: "Liter", minStock: 1, supplierId: "" },
  });

  const supForm = useForm<SupplierInput>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { name: "", phone: "", address: "", notes: "" },
  });

  function openCreate() {
    setEditing(null);
    matForm.reset({ name: "", sku: "", category: "Tinta", unit: "Liter", minStock: 1, supplierId: "" });
    setShowMaterialForm(true);
  }

  function openEdit(m: MaterialRow) {
    setEditing(m);
    matForm.reset({
      name: m.name,
      sku: m.sku ?? "",
      category: m.category,
      unit: m.unit,
      minStock: m.minStock,
      supplierId: m.supplier?.id ?? "",
    });
    setShowMaterialForm(true);
  }

  async function onSubmitMaterial(values: MaterialInput) {
    setFeedback(null);
    const res = editing
      ? await apiFetch<{ message?: string }>(`/api/materials/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(values),
        })
      : await apiFetch<{ message?: string }>("/api/materials", {
          method: "POST",
          body: JSON.stringify(values),
        });
    if (!res.ok) {
      setFeedback({ type: "error", text: res.error });
      return;
    }
    setFeedback({ type: "success", text: res.data.message ?? "Bahan disimpan." });
    setShowMaterialForm(false);
    setEditing(null);
    await load();
  }

  async function onSubmitSupplier(values: SupplierInput) {
    setFeedback(null);
    const res = await apiFetch<{ message?: string }>("/api/materials/suppliers", {
      method: "POST",
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setFeedback({ type: "error", text: res.error });
      return;
    }
    setFeedback({ type: "success", text: res.data.message ?? "Supplier ditambahkan." });
    supForm.reset();
    setShowSupplierForm(false);
    await load();
  }

  async function handleDelete(m: MaterialRow) {
    if (!window.confirm(`Hapus bahan ${m.name}?`)) return;
    const res = await apiFetch<{ message?: string }>(`/api/materials/${m.id}`, { method: "DELETE" });
    if (!res.ok) {
      setFeedback({ type: "error", text: res.error });
      return;
    }
    setFeedback({ type: "success", text: res.data.message ?? "Bahan dihapus." });
    await load();
  }

  const visible = onlyLow ? materials.filter((m) => m.alertStatus !== "AMAN") : materials;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium tracking-[-0.01em] text-ink">Stok Bahan Sablon</h1>
        </div>
        {canEdit ? (
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/stok/mutasi" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 h-10 text-sm font-medium text-white hover:bg-brand-hover">
              <ArrowLeftRight className="h-4 w-4" />
              Mutasi / Opname
            </Link>
            <Button variant="outline" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Tambah Bahan
            </Button>
            <Button variant="outline" onClick={() => setShowSupplierForm((v) => !v)}>+ Supplier</Button>
          </div>
        ) : null}
      </div>

      {feedback ? (
        <Alert variant={feedback.type === "error" ? "error" : "success"}>{feedback.text}</Alert>
      ) : null}

      {showSupplierForm && canEdit ? (
        <Card>
          <CardHeader><CardTitle>Tambah Supplier Baru</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={supForm.handleSubmit(onSubmitSupplier)} className="grid gap-3 sm:grid-cols-3">
              <div><Label htmlFor="sup-name">Nama Supplier</Label><Input id="sup-name" {...supForm.register("name")} /></div>
              <div><Label htmlFor="sup-phone">No. HP</Label><Input id="sup-phone" {...supForm.register("phone")} /></div>
              <div><Label htmlFor="sup-addr">Alamat</Label><Input id="sup-addr" {...supForm.register("address")} /></div>
              <div className="sm:col-span-3 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowSupplierForm(false)}>Batal</Button>
                <Button type="submit" disabled={supForm.formState.isSubmitting}>Simpan Supplier</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {showMaterialForm && canEdit ? (
        <Card>
          <CardHeader><CardTitle>{editing ? `Edit Bahan: ${editing.name}` : "Tambah Bahan Baru"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={matForm.handleSubmit(onSubmitMaterial)} className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="m-name">Nama Bahan</Label>
                <Input id="m-name" {...matForm.register("name")} placeholder="Tinta Plastisol Putih" />
                {matForm.formState.errors.name ? <p className="mt-1 text-xs text-red-600">{matForm.formState.errors.name.message}</p> : null}
              </div>
              <div><Label htmlFor="m-sku">SKU (Opsional)</Label><Input id="m-sku" {...matForm.register("sku")} placeholder="TNT-PLT-WHT" /></div>
              <div><Label htmlFor="m-cat">Kategori</Label><Input id="m-cat" {...matForm.register("category")} /></div>
              <div><Label htmlFor="m-unit">Satuan</Label><Input id="m-unit" {...matForm.register("unit")} /></div>
              <div><Label htmlFor="m-min">Stok Minimum</Label><Input id="m-min" type="number" step="0.01" {...matForm.register("minStock")} /></div>
              <div>
                <Label htmlFor="m-sup">Supplier</Label>
                <Select id="m-sup" {...matForm.register("supplierId")}>
                  <option value="">-- Pilih Supplier --</option>
                  {suppliers.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </Select>
              </div>
              <div className="sm:col-span-3 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowMaterialForm(false)}>Batal</Button>
                <Button type="submit" disabled={matForm.formState.isSubmitting}>Simpan Bahan</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex items-center gap-2">
        <label className="inline-flex items-center gap-2 text-sm text-muted cursor-pointer">
          <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} className="h-4 w-4 rounded border-line bg-card accent-brand" />
          Tampilkan hanya stok menipis / habis
        </label>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {visible.map((m) => (
          <div key={m.id} className="rounded-xl border border-line bg-card p-4 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link to={`/stok/${m.id}`} className="text-sm font-medium text-ink hover:text-brand">
                  {m.name}
                </Link>
                <p className="text-xs text-muted font-mono truncate">
                  {m.category} {m.sku ? `• ${m.sku}` : ""}
                </p>
              </div>
              {m.alertStatus === "HABIS" ? (
                <Badge variant="danger"><AlertTriangle className="h-3 w-3" /> Habis</Badge>
              ) : m.alertStatus === "MENIPIS" ? (
                <Badge variant="warning"><AlertTriangle className="h-3 w-3" /> Menipis</Badge>
              ) : (
                <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Aman</Badge>
              )}
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-ink font-medium">{formatNumberID(m.currentStock)} {m.unit}</span>
              <span className="text-muted">Min {formatNumberID(m.minStock)} {m.unit}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-soft overflow-hidden">
              <div
                className={`h-full rounded-full ${m.alertStatus === "HABIS" ? "bg-red-500" : m.alertStatus === "MENIPIS" ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: `${m.minStock > 0 ? Math.min(100, Math.round((m.currentStock / (m.minStock * 1.5)) * 100)) : m.currentStock > 0 ? 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <Link to={`/stok/${m.id}`} className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-soft min-h-[36px]">
                <Eye className="h-3.5 w-3.5" /> Riwayat
              </Link>
              {canEdit ? (
                <>
                  <Button size="sm" variant="outline" onClick={() => openEdit(m)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(m)} aria-label={`Hapus ${m.name}`}><Trash2 className="h-3.5 w-3.5 text-red-600" /></Button>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-line bg-card">
        <table className="w-full text-left text-sm tabular-nums">
          <thead className="border-b border-line text-xs font-medium text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Bahan</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Stok Saat Ini</th>
              <th className="px-4 py-3 font-medium">Minimum</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((m) => (
              <tr key={m.id} className="hover:bg-soft/60">
                <td className="px-4 py-3">
                  <Link to={`/stok/${m.id}`} className="font-medium text-ink hover:text-brand">{m.name}</Link>
                  <div className="font-mono text-xs text-muted">{m.sku || "-"} {m.supplier ? `• ${m.supplier.name}` : ""}</div>
                </td>
                <td className="px-4 py-3 text-muted">{m.category}</td>
                <td className="px-4 py-3">
                  <div className="font-mono font-semibold text-ink">{formatNumberID(m.currentStock)} {m.unit}</div>
                  <div className="mt-1.5 h-1.5 w-28 rounded-full bg-soft overflow-hidden">
                    <div
                      className={`h-full rounded-full ${m.alertStatus === "HABIS" ? "bg-red-500" : m.alertStatus === "MENIPIS" ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${m.minStock > 0 ? Math.min(100, Math.round((m.currentStock / (m.minStock * 1.5)) * 100)) : m.currentStock > 0 ? 100 : 0}%` }}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-muted">{formatNumberID(m.minStock)} {m.unit}</td>
                <td className="px-4 py-3">
                  {m.alertStatus === "HABIS" ? (
                    <Badge variant="danger"><AlertTriangle className="h-3 w-3" /> Habis</Badge>
                  ) : m.alertStatus === "MENIPIS" ? (
                    <Badge variant="warning"><AlertTriangle className="h-3 w-3" /> Menipis</Badge>
                  ) : (
                    <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Aman</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Link to={`/stok/${m.id}`} className="inline-flex items-center gap-1 rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-soft min-h-[38px]">
                      <Eye className="h-3.5 w-3.5" /> Riwayat
                    </Link>
                    {canEdit ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => openEdit(m)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(m)} aria-label={`Hapus ${m.name}`}><Trash2 className="h-3.5 w-3.5 text-red-600" /></Button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
