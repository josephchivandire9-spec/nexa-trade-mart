import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Package, MessageCircle, Bell, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Tab = { to: string; label: string; icon: typeof Home; match: (p: string) => boolean };

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAdmin, user } = useAuth();

  // Hide on auth screens
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/auth") ||
    pathname === "/admin/login"
  ) {
    return null;
  }

  const tabs: Tab[] = [
    { to: "/", label: "Home", icon: Home, match: (p) => p === "/" },
    { to: "/shop", label: "Shop", icon: Package, match: (p) => p.startsWith("/shop") || p.startsWith("/product") },
    { to: "/support", label: "AI", icon: MessageCircle, match: (p) => p.startsWith("/support") },
    {
      to: user ? "/account/tracking" : "/login",
      label: "Alerts",
      icon: Bell,
      match: (p) => p.startsWith("/account/tracking") || p.startsWith("/account/orders"),
    },
    isAdmin
      ? { to: "/admin", label: "Admin", icon: LayoutDashboard, match: (p) => p.startsWith("/admin") }
      : { to: user ? "/account" : "/login", label: "Profile", icon: User, match: (p) => p.startsWith("/account") || p.startsWith("/login") },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-ink/95 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-5">
        {tabs.map((t) => {
          const active = t.match(pathname);
          return (
            <li key={t.label}>
              <Link
                to={t.to}
                className={`flex flex-col items-center justify-center gap-0.5 h-14 text-[10px] font-medium tracking-wide ${
                  active ? "text-gold" : "text-white/60"
                }`}
              >
                <t.icon className={`h-5 w-5 ${active ? "text-gold" : ""}`} />
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
