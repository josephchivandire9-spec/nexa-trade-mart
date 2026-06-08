import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingBag, MessageSquare, TrendingUp, Users, Clock, Bot, Megaphone, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatZAR } from "@/lib/shopify";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, orders, messages, recentOrders, customers, banners] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total,status,created_at"),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(6),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("banners").select("id", { count: "exact", head: true }).eq("is_active", true),
      ]);
      const allOrders = orders.data ?? [];
      const totalRevenue = allOrders.reduce((s, o) => s + Number(o.total || 0), 0);
      const pending = allOrders.filter((o) => o.status === "pending" || o.status === "confirmed").length;
      return {
        productCount: products.count ?? 0,
        orderCount: allOrders.length,
        unreadMessages: messages.count ?? 0,
        customerCount: customers.count ?? 0,
        activeBanners: banners.count ?? 0,
        pending,
        revenue: totalRevenue,
        recent: recentOrders.data ?? [],
      };
    },
  });

  const cards = [
    { label: "Revenue", value: formatZAR(data?.revenue ?? 0), icon: TrendingUp, tone: "from-emerald-500 to-emerald-700", to: "/admin/orders" },
    { label: "Total Orders", value: data?.orderCount ?? 0, icon: ShoppingBag, tone: "from-blue-500 to-blue-700", to: "/admin/orders" },
    { label: "Pending Orders", value: data?.pending ?? 0, icon: Clock, tone: "from-amber-500 to-amber-700", to: "/admin/orders" },
    { label: "Customers", value: data?.customerCount ?? 0, icon: Users, tone: "from-violet-500 to-violet-700", to: "/admin/customers" },
    { label: "Products", value: data?.productCount ?? 0, icon: Package, tone: "from-rose-500 to-rose-700", to: "/admin/products" },
    { label: "Unread Messages", value: data?.unreadMessages ?? 0, icon: MessageSquare, tone: "from-cyan-500 to-cyan-700", to: "/admin/messages" },
    { label: "AI Support", value: "Live", icon: Bot, tone: "from-fuchsia-500 to-fuchsia-700", to: "/admin/ai" },
    { label: "Active Promotions", value: data?.activeBanners ?? 0, icon: Megaphone, tone: "from-orange-500 to-orange-700", to: "/admin/promotions" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time overview of your store.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to as never} className="block group">
            <div className="rounded-2xl border bg-card p-5 h-full transition hover:shadow-lg hover:-translate-y-0.5">
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${c.tone} text-white inline-flex items-center justify-center shadow-sm`}>
                <c.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-display text-2xl sm:text-3xl">{c.value}</div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">{c.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-gold-deep hover:underline inline-flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {(data?.recent ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground mt-4">No orders yet.</p>
          ) : (
            <ul className="mt-4 divide-y">
              {data!.recent.map((o) => (
                <li key={o.id} className="py-3 flex items-center justify-between text-sm gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{o.customer_name}</div>
                    <div className="text-xs text-muted-foreground truncate">{o.customer_phone} · {new Date(o.created_at).toLocaleString()}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold">{formatZAR(o.total)}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{o.status}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-display text-lg">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-1 gap-2">
            <QuickAction to="/admin/products" icon={Package} label="Add / edit products" />
            <QuickAction to="/admin/banners" icon={Megaphone} label="Update banners" />
            <QuickAction to="/admin/rewards" icon={TrendingUp} label="Approve rewards" />
            <QuickAction to="/admin/analytics" icon={TrendingUp} label="View analytics" />
            <QuickAction to="/admin/settings" icon={MessageSquare} label="System settings" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: typeof Package; label: string }) {
  return (
    <Link to={to as never} className="flex items-center gap-3 h-12 px-3 rounded-lg border hover:bg-muted text-sm font-medium">
      <Icon className="h-4 w-4 text-gold-deep" />
      <span className="flex-1">{label}</span>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
