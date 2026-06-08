import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Package, ShoppingBag, MessageSquare, ImageIcon, FolderTree,
  LogOut, Loader2, ShieldAlert, Users, Gift, BarChart3, Settings as SettingsIcon,
  Megaphone, Bot, LifeBuoy, Menu, X, Store,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { NotificationBell } from "@/components/NotificationBell";
import { toast } from "sonner";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };

const TOP_NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/banners", label: "Banners", icon: ImageIcon },
  { to: "/admin/promotions", label: "Promotions", icon: Megaphone },
  { to: "/admin/ai", label: "AI Assistant", icon: Bot },
  { to: "/admin/support", label: "Support", icon: LifeBuoy },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

const SIDE_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Operations",
    items: [
      { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
      { to: "/admin/products", label: "Product Management", icon: Package },
      { to: "/admin/categories", label: "Categories", icon: FolderTree },
      { to: "/admin/orders", label: "Order Management", icon: ShoppingBag },
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
      { to: "/admin/banners", label: "Banner Manager", icon: ImageIcon },
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
    navigate({ to: "/admin/login" });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
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

  const isActive = (n: NavItem) => (n.exact ? pathname === n.to : pathname.startsWith(n.to) && n.to !== "/admin") || (n.exact && pathname === n.to);

  return (
    <div className="fixed inset-0 flex flex-col bg-secondary/40 z-40 overflow-hidden">
      {/* TOP BAR */}
      <header className="h-16 shrink-0 bg-ink text-white border-b border-white/10 flex items-center px-3 sm:px-6 gap-3">
        <button
          onClick={() => setDrawerOpen((v) => !v)}
          className="lg:hidden h-11 w-11 inline-flex items-center justify-center rounded-lg hover:bg-white/10"
          aria-label="Toggle menu"
        >
          {drawerOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <Link to="/admin" className="flex items-center gap-2 shrink-0">
          <div className="h-9 w-9 rounded-lg bg-gold/20 text-gold inline-flex items-center justify-center">
            <Store className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-[10px] uppercase tracking-[0.2em] text-gold/80">Admin</div>
            <div className="font-display text-base">NEXA TRADE MART</div>
          </div>
        </Link>

        {/* TOP TABS - desktop */}
        <nav className="hidden xl:flex items-center gap-1 ml-6 overflow-x-auto">
          {TOP_NAV.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`px-3 h-10 inline-flex items-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block text-right leading-tight">
            <div className="text-[10px] uppercase tracking-widest text-white/60">Signed in</div>
            <div className="text-xs font-medium truncate max-w-[160px]">{user.email}</div>
          </div>
          <NotificationBell />
          <button
            onClick={signOut}
            className="hidden sm:inline-flex h-11 px-4 items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="flex-1 min-h-0 flex">
        {/* SIDEBAR - desktop */}
        <aside className="hidden lg:flex w-64 shrink-0 bg-card border-r flex-col overflow-y-auto">
          <SidebarBody isActive={isActive} />
        </aside>

        {/* SIDEBAR - mobile drawer */}
        {drawerOpen && (
          <>
            <div className="lg:hidden fixed inset-0 top-16 bg-black/50 z-40" onClick={() => setDrawerOpen(false)} />
            <aside className="lg:hidden fixed left-0 top-16 bottom-0 w-72 bg-card border-r z-50 overflow-y-auto">
              <SidebarBody isActive={isActive} />
              <div className="p-3 border-t">
                <button onClick={signOut} className="w-full h-12 rounded-lg bg-destructive/10 text-destructive font-medium inline-flex items-center justify-center gap-2">
                  <LogOut className="h-5 w-5" /> Sign out
                </button>
              </div>
            </aside>
          </>
        )}

        {/* MAIN */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto">
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
                  className={`flex items-center gap-3 px-3 h-12 rounded-lg text-sm font-medium ${
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
