import * as React from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Alert } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function LoginPage() {
  const { user, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl") || "/";
  const callbackUrl = rawCallback.startsWith("/") ? rawCallback : "/";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  if (!authLoading && user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate(callbackUrl, { replace: true });
  }

  return (
    <main className="fixed inset-0 h-dvh w-full overflow-hidden overscroll-none flex items-center justify-center bg-page px-4 text-ink">
      <div className="w-full max-w-sm space-y-5">
        <div className="flex items-center justify-center gap-2">
          <svg viewBox="0 0 20 20" className="h-4 w-4 text-brand" aria-hidden="true">
            <rect x="2" y="2" width="16" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.75" />
            <line x1="5" y1="13" x2="15" y2="7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          <span className="text-base font-medium tracking-tight text-ink">Nacova</span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-line bg-card p-6 shadow-[0_1px_2px_rgba(31,27,22,0.04)]"
        >
          <h1 className="text-lg font-medium tracking-tight text-ink">Masuk</h1>

          {error ? <Alert variant="error">{error}</Alert> : null}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="nama@nacova.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            <span>{submitting ? "Memverifikasi" : "Masuk"}</span>
            <ArrowRight strokeWidth={1.5} className="h-4 w-4" />
          </Button>

          {import.meta.env.DEV ? (
            <div className="border-t border-line pt-4 space-y-2">
              <p className="text-xs text-muted">
                Demo lokal (<span className="font-mono text-ink">nacova123</span>)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Owner", email: "owner@nacova.id" },
                  { label: "Admin", email: "admin@nacova.id" },
                  { label: "Produksi", email: "produksi@nacova.id" },
                ].map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => {
                      setEmail(demo.email);
                      setPassword("nacova123");
                    }}
                    className="rounded-lg border border-line bg-page px-2 py-1.5 text-xs font-medium text-ink hover:bg-soft min-h-[36px] cursor-pointer transition-colors duration-150"
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </form>
      </div>
    </main>
  );
}
