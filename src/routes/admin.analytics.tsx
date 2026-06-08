import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatZAR } from "@/lib/shopify";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Legend,
} from "recharts";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const { data } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [orders, customers, products] = await Promise.all([
        supabase.from("orders").select("total,status,created_at,items"),
        supabase.from("profiles").select("created_at"),
        supabase.from("products").select("id,name"),
      ]);
      return {
        orders: orders.data ?? [],
        customers: customers.data ?? [],
        products: products.data ?? [],
      };
    },
  });

  const orders = data?.orders ?? [];
  const customers = data?.customers ?? [];

  // Last 14 days revenue
  const days: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: d.toLocaleDateString("en-ZA", { month: "short", day: "numeric" }), revenue: 0, orders: 0 });
    const dayOrders = orders.filter((o: any) => o.created_at?.slice(0, 10) === key);
    days[days.length - 1].revenue = dayOrders.reduce((s, o: any) => s + Number(o.total || 0), 0);
    days[days.length - 1].orders = dayOrders.length;
  }

  // Customer growth (cumulative)
  const growth: { date: string; customers: number }[] = [];
  let cum = 0;
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    cum += customers.filter((c: any) => c.created_at?.slice(0, 10) === key).length;
    growth.push({ date: d.toLocaleDateString("en-ZA", { month: "short", day: "numeric" }), customers: cum });
  }

  // Top products
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  orders.forEach((o: any) => {
    (o.items ?? []).forEach((it: any) => {
      const key = it.name || it.product_id || "Unknown";
      if (!productSales[key]) productSales[key] = { name: key, qty: 0, revenue: 0 };
      productSales[key].qty += Number(it.quantity || 0);
      productSales[key].revenue += Number(it.line_total ?? (Number(it.price) * Number(it.quantity)) ?? 0);
    });
  });
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

  const totalRevenue = orders.reduce((s, o: any) => s + Number(o.total || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Sales, growth, and product performance.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Stat label="Total Revenue" value={formatZAR(totalRevenue)} />
        <Stat label="Orders" value={orders.length} />
        <Stat label="Customers" value={customers.length} />
      </div>

      <div className="rounded-2xl border bg-card p-5">
        <h2 className="font-display text-lg mb-4">Revenue · last 14 days</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={days}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(v: any) => formatZAR(Number(v))} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-display text-lg mb-4">Customer growth</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="customers" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="font-display text-lg mb-4">Top products</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="name" width={120} fontSize={11} />
                <Tooltip formatter={(v: any) => formatZAR(Number(v))} />
                <Legend />
                <Bar dataKey="revenue" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl">{value}</div>
    </div>
  );
}
