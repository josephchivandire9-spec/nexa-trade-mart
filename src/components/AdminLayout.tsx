import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, Package, ShoppingBag, MessageSquare, ImageIcon, FolderTree, LogOut, Loader2, ShieldAlert, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { NotificationBell } from "@/components/NotificationBell";
import { toast } from "sonner";

const NAV: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/banners", label: "Banners", icon: ImageIcon },
];


export function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
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
      <div className="container-px mx-auto max-w-md py-20 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 font-display text-2xl">Not authorized</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account ({user.email}) does not have admin access.
        </p>
        <button onClick={signOut} className="mt-6 h-10 px-5 rounded-full bg-ink text-white text-sm">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container-px mx-auto max-w-7xl py-8 grid lg:grid-cols-[240px_1fr] gap-6">
        <aside className="lg:sticky lg:top-28 self-start space-y-2">
          <div className="rounded-2xl border bg-card p-3">
            <div className="px-3 py-2">
              <div className="text-[11px] uppercase tracking-widest text-gold-deep">Admin</div>
              <div className="font-display text-sm truncate">{user.email}</div>
            </div>
            <nav className="space-y-1">
              {NAV.map((n) => {
                const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`flex items-center gap-2 px-3 h-10 rounded-lg text-sm font-medium ${active ? "bg-ink text-white" : "hover:bg-muted"}`}
                  >
                    <n.icon className="h-4 w-4" /> {n.label}
                  </Link>
                );
              })}
              <button
                onClick={signOut}
                className="w-full flex items-center gap-2 px-3 h-10 rounded-lg text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </nav>
          </div>
        </aside>
        <main className="min-h-[60vh]">
          <div className="flex justify-end mb-3"><NotificationBell /></div>
          <Outlet />
        </main>

      </div>
    </div>
  );
}
