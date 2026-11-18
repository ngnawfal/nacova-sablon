import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { customerSchema, type CustomerInput } from "@/lib/validations/customer";
import { Alert, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  company: string | null;
  address: string | null;
  notes: string | null;
}

export function CustomersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeQ = searchParams.get("q") || "";
  const [query, setQuery] = React.useState(activeQ);
  const [customers, setCustomers] = React.useState<CustomerRow[]>([]);
  const [editing, setEditing] = React.useState<CustomerRow | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = React.useCallback(async () => {
    const qs = activeQ ? `?q=${encodeURIComponent(activeQ)}` : "";
    const res = await apiFetch<{ customers: CustomerRow[] }>(`/api/customers${qs}`);
    if (res.ok) setCustomers(res.data.customers);
  }, [activeQ]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", phone: "", company: "", address: "", notes: "" },
  });

  function openCreate() {
    setEditing(null);
    reset({ name: "", phone: "", company: "", address: "", notes: "" });
    setShowForm(true);
  }

  function openEdit(c: CustomerRow) {
    setEditing(c);
    reset({
      name: c.name,
      phone: c.phone,
      company: c.company ?? "",
      address: c.address ?? "",
      notes: c.notes ?? "",
    });
    setShowForm(true);
  }

  async function onSubmit(values: CustomerInput) {
    setFeedback(null);
    const res = editing
      ? await apiFetch<{ message?: string }>(`/api/customers/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(values),
        })
      : await apiFetch<{ message?: string }>("/api/customers", {
          method: "POST",
          body: JSON.stringify(values),
        });
    if (!res.ok) {
      setFeedback({ type: "error", text: res.error });
      return;
    }
    setFeedback({ type: "success", text: res.data.message ?? "Tersimpan." });
    setShowForm(false);
    setEditing(null);
    await load();
  }

  async function handleDelete(c: CustomerRow) {
    if (!window.confirm(`Hapus pelanggan ${c.name}?`)) return;
    setFeedback(null);
    const res = await apiFetch<{ message?: string }>(`/api/customers/${c.id}`, { method: "DELETE" });
    if (!res.ok) {
      setFeedback({ type: "error", text: res.error });
      return;
    }
    setFeedback({ type: "success", text: res.data.message ?? "Pelanggan dihapus." });
    await load();
  }

  function handleSearch(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    setSearchParams(trimmed ? { q: trimmed } : {});
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium tracking-[-0.01em] text-ink">Data Pelanggan</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Tambah Pelanggan
        </Button>
      </div>

      {feedback ? (
        <Alert variant={feedback.type === "error" ? "error" : "success"}>{feedback.text}</Alert>
      ) : null}

      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <Input placeholder="Cari nama, no. HP, atau instansi..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button type="submit" variant="outline">
          <Search className="h-4 w-4" />
          Cari
        </Button>
      </form>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? `Edit: ${editing.name}` : "Tambah Pelanggan"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="c-name">Nama Pelanggan</Label>
                <Input id="c-name" {...register("name")} placeholder="Contoh: HMIF / Budi" />
                {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
              </div>
              <div>
                <Label htmlFor="c-phone">No. HP / WhatsApp</Label>
                <Input id="c-phone" {...register("phone")} placeholder="0812..." />
                {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p> : null}
              </div>
              <div>
                <Label htmlFor="c-company">Instansi / Brand (Opsional)</Label>
                <Input id="c-company" {...register("company")} />
              </div>
              <div>
                <Label htmlFor="c-address">Alamat (Opsional)</Label>
                <Input id="c-address" {...register("address")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="c-notes">Catatan</Label>
                <Textarea id="c-notes" {...register("notes")} />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {customers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-card p-8 text-center text-sm text-muted">
          Tidak ada data pelanggan yang sesuai.
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {customers.map((c) => (
              <div key={c.id} className="rounded-xl border border-line bg-card p-4 space-y-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{c.name}</p>
                  <p className="font-mono text-xs text-muted">{c.phone}</p>
                </div>
                {c.company || c.address ? (
                  <p className="text-xs text-muted">
                    {[c.company, c.address].filter(Boolean).join(" • ")}
                  </p>
                ) : null}
                {c.notes ? <p className="text-xs text-sec">{c.notes}</p> : null}
                <div className="flex justify-end gap-1.5 pt-1">
                  <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(c)} aria-label={`Hapus ${c.name}`}>
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-line bg-card">
            <table className="w-full text-left text-sm tabular-nums">
              <thead className="border-b border-line text-xs font-medium text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">Kontak</th>
                  <th className="px-4 py-3 font-medium">Instansi / Alamat</th>
                  <th className="px-4 py-3 font-medium">Catatan</th>
                  <th className="px-4 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-soft/60">
                    <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{c.phone}</td>
                    <td className="px-4 py-3 text-ink">
                      <div>{c.company || "-"}</div>
                      {c.address ? <div className="text-xs text-muted">{c.address}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-xs text-sec">{c.notes || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(c)} aria-label={`Hapus ${c.name}`}>
                          <Trash2 className="h-3.5 w-3.5 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
