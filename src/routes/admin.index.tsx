import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, ShoppingBag, MessageSquare, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatZAR } from "@/lib/shopify";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, orders, messages, recentOrders] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total,status"),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
      ]);
      const totalRevenue = (orders.data ?? []).reduce((s, o) => s + Number(o.total || 0), 0);
      return {
        productCount: products.count ?? 0,
        orderCount: (orders.data ?? []).length,
        unreadMessages: messages.count ?? 0,
        revenue: totalRevenue,
        recent: recentOrders.data ?? [],
      };
    },
  });

  const stats = [
    { label: "Products", value: data?.productCount ?? 0, icon: Package, to: "/admin/products" },
    { label: "Orders", value: data?.orderCount ?? 0, icon: ShoppingBag, to: "/admin/orders" },
    { label: "Unread Messages", value: data?.unreadMessages ?? 0, icon: MessageSquare, to: "/admin/messages" },
    { label: "Total Revenue", value: formatZAR(data?.revenue ?? 0), icon: TrendingUp },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="text-sm text-muted-foreground mt-1">Overview of your store.</p>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Wrapper = (props: { children: React.ReactNode }) =>
            s.to ? (
              <Link to={s.to as never} className="block">{props.children}</Link>
            ) : (
              <div>{props.children}</div>
            );
          return (
            <Wrapper key={s.label}>
              <div className="rounded-2xl border bg-card p-5 card-hover">
                <s.icon className="h-5 w-5 text-gold-deep" />
                <div className="mt-3 font-display text-2xl">{s.value}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
              </div>
            </Wrapper>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs text-gold-deep hover:underline">View all</Link>
        </div>
        {(data?.recent ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground mt-4">No orders yet.</p>
        ) : (
          <ul className="mt-4 divide-y">
            {data!.recent.map((o) => (
              <li key={o.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{o.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{o.customer_phone} · {new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatZAR(o.total)}</div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{o.status}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
