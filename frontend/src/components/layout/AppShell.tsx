import * as React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Clock,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import type { RoleType } from "@/lib/utils/business-rules";
import { cn } from "@/lib/utils/format";

interface NavItem {
  href: string;
  label: string;
  title: string;
  group: 0 | 1 | 2;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  roles: RoleType[];
  mobilePrimary?: boolean;
}

const GROUP_LABELS: Record<0 | 1 | 2, string> = {
  0: "Operasional",
  1: "Klien",
  2: "Tim",
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Ringkasan", title: "Ringkasan", group: 0, icon: LayoutDashboard, roles: ["OWNER", "ADMIN", "PRODUCTION"], mobilePrimary: true },
  { href: "/absensi", label: "Absensi", title: "Absensi", group: 0, icon: Clock, roles: ["OWNER", "ADMIN", "PRODUCTION"], mobilePrimary: true },
  { href: "/absensi/rekap", label: "Rekap absensi", title: "Rekap absensi", group: 0, icon: ClipboardList, roles: ["OWNER", "ADMIN"], mobilePrimary: true },
  { href: "/pelanggan", label: "Pelanggan", title: "Pelanggan", group: 1, icon: Users, roles: ["OWNER", "ADMIN"], mobilePrimary: true },
  { href: "/karyawan", label: "Karyawan", title: "Karyawan", group: 2, icon: UserCog, roles: ["OWNER"], mobilePrimary: true },
];

const ROLE_LABEL: Record<RoleType, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  PRODUCTION: "Produksi",
};

function pageTitle(pathname: string): string {
  const exact = NAV_ITEMS.find((i) => i.href === pathname);
  return exact ? exact.title : "Nacova";
}

export function AppShell() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem("nacova.sidebar.collapsed") === "1";
    } catch {
      return false;
    }
  });

  function toggleSidebar() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("nacova.sidebar.collapsed", next ? "1" : "0");
      } catch {
        /* ignore storage errors */
      }
      return next;
    });
  }

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (!user) return null;

  const canManage = user.role !== "PRODUCTION";
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));
  const mobileItems = visibleItems.filter((item) => item.mobilePrimary).slice(0, 5);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/absensi" && pathname.startsWith("/absensi/rekap")) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const initials = user.name
    .replace(/[^A-Za-z\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-page text-ink md:flex md:gap-4 md:p-4">
      <aside
        className={cn(
          "hidden md:flex md:shrink-0 md:flex-col md:sticky md:top-4 md:h-[calc(100vh-2rem)] rounded-2xl border border-line bg-card shadow-[0_1px_2px_rgba(31,27,22,0.04)] p-3 transition-[width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          collapsed ? "md:w-[68px]" : "md:w-60"
        )}
      >
        <div
          className={cn(
            "flex items-center h-10 border-b border-line pb-2",
            collapsed ? "justify-center" : "justify-between px-1"
          )}
        >
          {!collapsed ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <svg viewBox="0 0 20 20" className="h-4 w-4 text-brand shrink-0" aria-hidden="true">
                <rect x="2" y="2" width="16" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.75" />
                <line x1="5" y1="13" x2="15" y2="7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
              <span className="text-base font-medium tracking-tight text-ink truncate">Nacova</span>
            </div>
          ) : null}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Perluas sidebar" : "Perkecil sidebar"}
            title={collapsed ? "Perluas sidebar" : "Perkecil sidebar"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-soft hover:text-ink cursor-pointer transition-colors duration-150 shrink-0"
          >
            {collapsed ? (
              <PanelLeftOpen strokeWidth={1.5} className="h-4 w-4" />
            ) : (
              <PanelLeftClose strokeWidth={1.5} className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav aria-label="Menu utama" className="mt-3 flex-1 overflow-y-auto overflow-x-hidden">
          {([0, 1, 2] as const).map((g) => {
            const items = visibleItems.filter((i) => i.group === g);
            if (items.length === 0) return null;
            return (
              <div
                key={g}
                className={cn(g > 0 && (collapsed ? "mt-3 pt-3 border-t border-line" : "mt-5"))}
              >
                {!collapsed ? (
                  <p className="px-2.5 mb-1.5 text-xs text-muted">{GROUP_LABELS[g]}</p>
                ) : null}
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        title={collapsed ? item.label : undefined}
                        aria-label={item.label}
                        className={cn(
                          "flex items-center rounded-lg h-9 text-sm transition-[background-color,color,border-color] duration-150",
                          collapsed ? "justify-center px-0" : "gap-2.5 px-2.5",
                          active
                            ? "border border-line bg-soft font-medium text-ink"
                            : "border border-transparent text-sec hover:bg-soft/60 hover:text-ink"
                        )}
                      >
                        <Icon
                          strokeWidth={1.5}
                          className={cn("h-4 w-4 shrink-0", active ? "text-brand" : "text-muted")}
                        />
                        {!collapsed ? <span className="truncate">{item.label}</span> : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-line pt-3 mt-3">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div
                title={`${user.name} (${ROLE_LABEL[user.role]})`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-soft text-xs font-medium text-ink"
              >
                {initials}
              </div>
              <button
                type="button"
                aria-label="Keluar"
                title="Keluar"
                onClick={handleLogout}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-soft hover:text-ink cursor-pointer transition-colors duration-150"
              >
                <LogOut strokeWidth={1.5} className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-1 py-1">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft text-xs font-medium text-ink">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{user.name}</p>
                <p className="text-xs text-muted">{ROLE_LABEL[user.role]}</p>
              </div>
              <button
                type="button"
                aria-label="Keluar"
                title="Keluar"
                onClick={handleLogout}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-soft hover:text-ink cursor-pointer transition-colors duration-150"
              >
                <LogOut strokeWidth={1.5} className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="min-w-0 flex-1 flex flex-col md:min-h-[calc(100vh-2rem)] md:rounded-2xl md:border md:border-line md:bg-card md:shadow-[0_1px_2px_rgba(31,27,22,0.04)]">
        <header className="sticky top-0 z-20 md:static flex items-center justify-between gap-3 border-b border-line bg-card/95 md:bg-transparent backdrop-blur-md md:backdrop-blur-none px-4 h-14 sm:px-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              aria-label="Buka menu"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink hover:bg-soft cursor-pointer shrink-0"
            >
              <Menu strokeWidth={1.5} className="h-4 w-4" />
            </button>
            <h1 className="text-sm font-medium text-sec truncate">{pageTitle(pathname)}</h1>
          </div>
          <div className="flex items-center gap-2">
            {pathname !== "/absensi" ? (
              <Link
                to="/absensi"
                aria-label="Absen"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand w-9 sm:w-auto sm:px-3.5 h-9 text-sm font-medium text-card hover:bg-brand-hover transition-colors duration-150 shrink-0"
              >
                <Clock strokeWidth={1.5} className="h-4 w-4" />
                <span className="hidden sm:inline">Absen</span>
              </Link>
            ) : canManage ? (
              <Link
                to="/absensi/rekap"
                aria-label="Rekap absensi"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-card w-9 sm:w-auto sm:px-3.5 h-9 text-sm font-medium text-ink hover:bg-soft transition-colors duration-150 shrink-0"
              >
                <ClipboardList strokeWidth={1.5} className="h-4 w-4 text-muted" />
                <span className="hidden sm:inline">Rekap</span>
              </Link>
            ) : null}
            <button
              type="button"
              aria-label="Keluar"
              title="Keluar"
              onClick={handleLogout}
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted hover:text-ink cursor-pointer"
            >
              <LogOut strokeWidth={1.5} className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pb-28 sm:px-6 md:pb-8">
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Navigasi bawah"
        className="fixed bottom-3 inset-x-3 z-30 flex md:hidden rounded-xl border border-line bg-card/95 backdrop-blur-md p-1 shadow-[0_8px_24px_rgba(31,27,22,0.08)]"
      >
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center rounded-lg py-1.5 text-[11px] font-medium min-h-[44px]",
                active ? "bg-soft text-brand" : "text-muted"
              )}
            >
              <Icon strokeWidth={1.5} className="h-4 w-4 mb-0.5" />
              <span className="truncate max-w-[60px]">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-ink/30 backdrop-blur-[1px]"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-72 max-w-[82vw] bg-card border-r border-line h-full flex flex-col p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-brand shrink-0" aria-hidden="true">
                  <rect x="2" y="2" width="16" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.75" />
                  <line x1="5" y1="13" x2="15" y2="7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
                <span className="text-base font-medium tracking-tight text-ink">Nacova</span>
              </div>
              <button
                type="button"
                aria-label="Tutup menu"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-soft hover:text-ink"
              >
                <X strokeWidth={1.5} className="h-4 w-4" />
              </button>
            </div>

            <nav aria-label="Menu mobile lengkap" className="mt-3 flex-1 overflow-y-auto">
              {([0, 1, 2] as const).map((g) => {
                const items = visibleItems.filter((i) => i.group === g);
                if (items.length === 0) return null;
                return (
                  <div key={g} className={g > 0 ? "mt-5" : ""}>
                    <p className="px-2.5 mb-1.5 text-xs text-muted">{GROUP_LABELS[g]}</p>
                    <div className="space-y-0.5">
                      {items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg px-2.5 h-10 text-sm",
                              active
                                ? "border border-line bg-soft font-medium text-ink"
                                : "text-sec hover:bg-soft/60"
                            )}
                          >
                            <Icon
                              strokeWidth={1.5}
                              className={cn("h-4 w-4 shrink-0", active ? "text-brand" : "text-muted")}
                            />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>

            <div className="border-t border-line pt-3 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft text-xs font-medium text-ink">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{user.name}</p>
                <p className="text-xs text-muted">{ROLE_LABEL[user.role]}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
