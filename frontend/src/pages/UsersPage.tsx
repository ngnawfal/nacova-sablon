import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Plus, Trash2, UserCheck, UserX } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { createUserSchema, type CreateUserInput } from "@/lib/validations/user";
import { Alert, Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "PRODUCTION";
  phone: string | null;
  isActive: boolean;
}

export function UsersPage() {
  const { user: actor } = useAuth();
  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showCreate, setShowCreate] = React.useState(false);
  const [resetTarget, setResetTarget] = React.useState<UserRow | null>(null);
  const [newPassword, setNewPassword] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const res = await apiFetch<{ users: UserRow[] }>("/api/users");
    if (res.ok) setUsers(res.data.users);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: "PRODUCTION", name: "", email: "", password: "", phone: "" },
  });

  async function onCreate(values: CreateUserInput) {
    setFeedback(null);
    const res = await apiFetch<{ message?: string }>("/api/users", {
      method: "POST",
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setFeedback({ type: "error", text: res.error });
      return;
    }
    setFeedback({ type: "success", text: res.data.message ?? "Karyawan ditambahkan." });
    reset();
    setShowCreate(false);
    await load();
  }

  async function handleToggleActive(u: UserRow) {
    setFeedback(null);
    setBusyId(u.id);
    const res = await apiFetch<{ message?: string }>(`/api/users/${u.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone ?? "",
        isActive: !u.isActive,
      }),
    });
    setBusyId(null);
    if (!res.ok) {
      setFeedback({ type: "error", text: res.error });
      return;
    }
    setFeedback({ type: "success", text: res.data.message ?? "Status diperbarui." });
    await load();
  }

  async function handleResetPassword(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!resetTarget) return;
    setFeedback(null);
    const res = await apiFetch<{ message?: string }>(`/api/users/${resetTarget.id}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ newPassword }),
    });
    if (!res.ok) {
      setFeedback({ type: "error", text: res.error });
      return;
    }
    setFeedback({ type: "success", text: res.data.message ?? "Password direset." });
    setResetTarget(null);
    setNewPassword("");
  }

  async function handleDelete(u: UserRow) {
    if (!window.confirm(`Hapus akun ${u.name}?`)) return;
    setFeedback(null);
    setBusyId(u.id);
    const res = await apiFetch<{ message?: string }>(`/api/users/${u.id}`, { method: "DELETE" });
    setBusyId(null);
    if (!res.ok) {
      setFeedback({ type: "error", text: res.error });
      return;
    }
    setFeedback({ type: "success", text: res.data.message ?? "Akun dihapus." });
    await load();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium tracking-[-0.01em] text-ink">Kelola Akun Karyawan</h1>
        </div>
        <Button onClick={() => setShowCreate((v) => !v)}>
          <Plus className="h-4 w-4" />
          {showCreate ? "Tutup Form" : "Tambah Karyawan"}
        </Button>
      </div>

      {feedback ? (
        <Alert variant={feedback.type === "error" ? "error" : "success"}>{feedback.text}</Alert>
      ) : null}

      {showCreate ? (
        <Card>
          <CardHeader>
            <CardTitle>Tambah Akun Karyawan Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onCreate)} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" {...register("name")} placeholder="Contoh: Raka Pratama" />
                {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} placeholder="raka@nacova.id" />
                {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select id="role" {...register("role")}>
                  <option value="PRODUCTION">PRODUCTION (Produksi)</option>
                  <option value="ADMIN">ADMIN (Admin Workshop)</option>
                  <option value="OWNER">OWNER (Pemilik)</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">No. HP / WhatsApp</Label>
                <Input id="phone" {...register("phone")} placeholder="0812..." />
              </div>
              <div>
                <Label htmlFor="password">Password Awal</Label>
                <Input id="password" type="password" {...register("password")} placeholder="Minimal 6 karakter" />
                {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password.message}</p> : null}
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Batal</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Simpan Karyawan"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {resetTarget ? (
        <Card className="border-brand/40">
          <CardHeader>
            <CardTitle>Reset Password: {resetTarget.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[220px]">
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input id="newPassword" type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" />
              </div>
              <Button type="submit">Simpan Password</Button>
              <Button type="button" variant="outline" onClick={() => setResetTarget(null)}>Batal</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3 md:hidden">
        {users.map((u) => (
          <div key={u.id} className="rounded-xl border border-line bg-card p-4 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{u.name}</p>
                <p className="font-mono text-xs text-muted truncate">{u.email}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant={u.role === "OWNER" ? "accent" : "neutral"}>{u.role}</Badge>
                <Badge variant={u.isActive ? "success" : "danger"}>{u.isActive ? "Aktif" : "Nonaktif"}</Badge>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-1.5 pt-1">
              <Button size="sm" variant="outline" onClick={() => { setResetTarget(u); setNewPassword(""); }}>
                <KeyRound className="h-3.5 w-3.5" /> Reset PW
              </Button>
              {u.id !== actor?.id ? (
                <>
                  <Button size="sm" variant="outline" disabled={busyId === u.id} onClick={() => handleToggleActive(u)}>
                    {u.isActive ? (<><UserX className="h-3.5 w-3.5" /> Nonaktifkan</>) : (<><UserCheck className="h-3.5 w-3.5" /> Aktifkan</>)}
                  </Button>
                  <Button size="sm" variant="outline" disabled={busyId === u.id} onClick={() => handleDelete(u)} aria-label={`Hapus ${u.name}`}>
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-xl border border-line bg-card">
        <table className="w-full text-left text-sm tabular-nums">
          <thead className="border-b border-line text-xs font-medium text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-soft/60">
                <td className="px-4 py-3 font-medium text-ink">
                  <div>{u.name}</div>
                  {u.phone ? <div className="font-mono text-xs text-muted">{u.phone}</div> : null}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted">{u.email}</td>
                <td className="px-4 py-3"><Badge variant={u.role === "OWNER" ? "accent" : "neutral"}>{u.role}</Badge></td>
                <td className="px-4 py-3"><Badge variant={u.isActive ? "success" : "danger"}>{u.isActive ? "Aktif" : "Nonaktif"}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => { setResetTarget(u); setNewPassword(""); }}>
                      <KeyRound className="h-3.5 w-3.5" />
                      Reset PW
                    </Button>
                    {u.id !== actor?.id ? (
                      <>
                        <Button size="sm" variant="outline" disabled={busyId === u.id} onClick={() => handleToggleActive(u)}>
                          {u.isActive ? (<><UserX className="h-3.5 w-3.5" /> Nonaktifkan</>) : (<><UserCheck className="h-3.5 w-3.5" /> Aktifkan</>)}
                        </Button>
                        <Button size="sm" variant="outline" disabled={busyId === u.id} onClick={() => handleDelete(u)} aria-label={`Hapus ${u.name}`}>
                          <Trash2 className="h-3.5 w-3.5 text-red-600" />
                        </Button>
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
