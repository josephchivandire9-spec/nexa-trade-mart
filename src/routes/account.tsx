import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Loader2, User, Package, LogOut, MapPin, Truck, Gift, Users,
  Settings as SettingsIcon, LayoutDashboard, Wallet, Bell, Ticket, Heart,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — NEXA TRADE MART" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountLayout,
});

const NAV: { to: string; label: string; icon: typeof User; exact?: boolean }[] = [
  { to: "/account", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/account/profile", label: "Profile", icon: User },
  { to: "/account/orders", label: "My Orders", icon: Package },
  { to: "/account/tracking", label: "Order Tracking", icon: Truck },
  { to: "/account/wishlist", label: "Wishlist", icon: Heart },
  { to: "/account/addresses", label: "Saved Addresses", icon: MapPin },
  { to: "/account/rewards", label: "Rewards Centre", icon: Gift },
  { to: "/account/coupons", label: "Coupons", icon: Ticket },
  { to: "/account/wallet", label: "Wallet", icon: Wallet },
  { to: "/account/notifications", label: "Notifications", icon: Bell },
  { to: "/account/referrals", label: "Referrals", icon: Users },
  { to: "/account/settings", label: "Settings", icon: SettingsIcon },
];

function AccountLayout() {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return null;

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  const initials = (profile?.full_name || user.email || "?")
    .split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="container-px mx-auto max-w-6xl py-6 md:py-10 grid md:grid-cols-[260px_1fr] gap-6">
      <aside className="rounded-2xl border bg-card p-3 h-fit md:sticky md:top-28 shadow-premium">
        <div className="px-3 py-4 border-b flex items-center gap-3">
          <div className="h-11 w-11 rounded-full gradient-gold text-ink font-bold inline-flex items-center justify-center text-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-gold-deep">Customer</div>
            <div className="text-sm font-display truncate">{profile?.full_name || user.email}</div>
            {profile?.customer_code && (
              <div className="mt-0.5 inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-gold/15 text-gold-deep">
                {profile.customer_code}
              </div>
            )}
          </div>
        </div>
        <nav className="space-y-0.5 mt-2">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to}
                className={`flex items-center gap-2.5 px-3 h-10 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-ink text-white shadow-premium" : "hover:bg-muted"
                }`}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
          <button onClick={signOut}
            className="w-full flex items-center gap-2.5 px-3 h-10 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </nav>
      </aside>
      <main className="min-w-0 fade-up"><Outlet /></main>
    </div>
  );
}
