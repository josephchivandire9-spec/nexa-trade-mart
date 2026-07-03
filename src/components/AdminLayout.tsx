import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, MessageSquare, ImageIcon, FolderTree,
  LogOut, Loader2, ShieldAlert, Users, Gift, BarChart3, Settings as SettingsIcon,
  Megaphone, Bot, LifeBuoy, Menu, X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { NotificationBell } from "@/components/NotificationBell";
import { toast } from "sonner";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };

const SIDE_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Operations",
    items: [
      { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
      { to: "/admin/products", label: "Products", icon: Package },
      { to: "/admin/categories", label: "Categories", icon: FolderTree },
      { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
    ],
  },
  {
    label: "Customers",
    items: [
      { to: "/admin/customers", label: "Customer CRM", icon: Users },
      { to: "/admin/rewards", label: "Loyalty Rewards", icon: Gift },
      { to: "/admin/referrals", label: "Referral Program", icon: Gift },
    ],
  },
  {
    label: "Engagement",
    items: [
      { to: "/admin/banners", label: "Banners", icon: ImageIcon },
      { to: "/admin/social", label: "Social Links", icon: ImageIcon },
      { to: "/admin/promotions", label: "Promotions", icon: Megaphone },
      { to: "/admin/messages", label: "Notifications", icon: MessageSquare },
      { to: "/admin/ai", label: "AI Monitoring", icon: Bot },
      { to: "/admin/support", label: "Support Tickets", icon: LifeBuoy },
    ],
  },
  {
    label: "Insights",
    items: [
      { to: "/admin/analytics", label: "Reports & Analytics", icon: BarChart3 },
      { to: "/admin/settings", label: "System Settings", icon: SettingsIcon },
    ],
  },
];

export function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 font-display text-2xl">Not authorized</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account ({user.email}) does not have admin access.
          </p>
          <button onClick={signOut} className="mt-6 h-11 px-6 rounded-full bg-ink text-white text-sm">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const isActive = (n: NavItem): boolean => {
    if (n.exact) return pathname === n.to;
    return pathname.startsWith(n.to) && n.to !== "/admin";
  };

  return (
    <div className="bg-secondary/40 min-h-[calc(100vh-4rem)]">
      {/* Admin sub-bar */}
      <div className="bg-ink text-white border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen((v) => !v)}
            className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-white/10"
            aria-label="Toggle admin menu"
          >
            {drawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="text-[10px] uppercase tracking-[0.25em] text-gold/80">Admin Mode</div>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={signOut}
              className="hidden sm:inline-flex h-9 px-3 items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto flex">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:block w-64 shrink-0 bg-card border-r min-h-[calc(100vh-7rem)]">
          <SidebarBody isActive={isActive} />
        </aside>

        {/* Sidebar - mobile drawer */}
        {drawerOpen && (
          <>
            <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setDrawerOpen(false)} />
            <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-card border-r z-50 overflow-y-auto">
              <div className="h-12 flex items-center justify-between px-3 border-b bg-ink text-white">
                <span className="text-[10px] uppercase tracking-[0.25em] text-gold/80">Admin Menu</span>
                <button onClick={() => setDrawerOpen(false)} className="h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-white/10">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarBody isActive={isActive} />
              <div className="p-3 border-t">
                <button onClick={signOut} className="w-full h-11 rounded-lg bg-destructive/10 text-destructive font-medium inline-flex items-center justify-center gap-2">
                  <LogOut className="h-5 w-5" /> Sign out
                </button>
              </div>
            </aside>
          </>
        )}

        <main className="flex-1 min-w-0">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarBody({ isActive }: { isActive: (n: NavItem) => boolean }) {
  return (
    <div className="p-3 space-y-5">
      {SIDE_GROUPS.map((g) => (
        <div key={g.label}>
          <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
            {g.label}
          </div>
          <nav className="space-y-1">
            {g.items.map((n) => {
              const active = isActive(n);
              return (
                <Link
                  key={n.to + n.label}
                  to={n.to}
                  className={`flex items-center gap-3 px-3 h-11 rounded-lg text-sm font-medium ${
                    active ? "bg-ink text-white" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <n.icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{n.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
}
