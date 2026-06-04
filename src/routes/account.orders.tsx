import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatZAR } from "@/lib/shopify";
import { Package } from "lucide-react";

export const Route = createFileRoute("/account/orders")({
  head: () => ({
    meta: [
      { title: "Order History — NEXA TRADE MART" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdersPage,
});

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  confirmed: "bg-blue-100 text-blue-900",
  processing: "bg-blue-100 text-blue-900",
  packed: "bg-indigo-100 text-indigo-900",
  shipped: "bg-purple-100 text-purple-900",
  delivered: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-rose-100 text-rose-900",
};

function OrdersPage() {
  const { user } = useAuth();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center">
        <Package className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="mt-3 font-display text-xl">No orders yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your future orders placed while signed in will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h1 className="font-display text-2xl">Order History</h1>
      {(orders as any[]).map((o) => (
        <div key={o.id} className="rounded-2xl border bg-card p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Order #{o.id.slice(0, 8)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(o.created_at).toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-lg">{formatZAR(o.total)}</div>
              <span
                className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest ${
                  STATUS_COLORS[o.status] ?? "bg-muted text-foreground"
                }`}
              >
                {o.status}
              </span>
            </div>
          </div>
          <ul className="mt-3 text-sm space-y-1 border-t pt-3">
            {(o.items as any[]).map((it, i) => (
              <li key={i} className="flex justify-between">
                <span>
                  {it.name} × {it.quantity}
                </span>
                <span className="text-muted-foreground">
                  {formatZAR(it.line_total ?? it.price * it.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
