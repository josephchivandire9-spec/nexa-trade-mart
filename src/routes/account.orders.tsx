import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatZAR } from "@/lib/shopify";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { storageUrl } from "@/lib/storage";

export const Route = createFileRoute("/account/orders")({
  head: () => ({
    meta: [
      { title: "Order History — NEXA TRADE MART" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrdersPage,
});

const STATUS_STYLES: Record<string, { pill: string; dot: string; label: string }> = {
  pending:    { pill: "bg-amber-100 text-amber-900",    dot: "bg-amber-500",    label: "Pending" },
  confirmed:  { pill: "bg-blue-100 text-blue-900",      dot: "bg-blue-500",     label: "Confirmed" },
  processing: { pill: "bg-orange-100 text-orange-900",  dot: "bg-orange-500",   label: "Processing" },
  packed:     { pill: "bg-indigo-100 text-indigo-900",  dot: "bg-indigo-500",   label: "Packed" },
  shipped:    { pill: "bg-blue-100 text-blue-900",      dot: "bg-blue-500",     label: "Shipped" },
  delivered:  { pill: "bg-emerald-100 text-emerald-900",dot: "bg-emerald-500",  label: "Delivered" },
  cancelled:  { pill: "bg-rose-100 text-rose-900",      dot: "bg-rose-500",     label: "Cancelled" },
};

function OrdersPage() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card p-5 animate-pulse">
            <div className="flex gap-3">
              <div className="h-16 w-16 rounded-xl bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center shadow-premium">
        <div className="mx-auto h-14 w-14 rounded-full bg-muted grid place-items-center">
          <Package className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="mt-4 font-display text-xl">No orders yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your orders will appear here.</p>
        <Link to="/shop" className="mt-5 inline-flex h-11 px-6 rounded-lg gradient-gold text-ink font-bold items-center gap-2 text-sm">
          <ShoppingBag className="h-4 w-4" /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-6 shadow-premium">
        <h1 className="font-display text-2xl">My Orders</h1>
        <p className="text-sm text-muted-foreground">{orders.length} order{orders.length === 1 ? "" : "s"} in total.</p>
      </div>

      <div className="space-y-3">
        {(orders as any[]).map((o) => {
          const s = STATUS_STYLES[o.status] ?? STATUS_STYLES.pending;
          const items = (o.items as any[]) ?? [];
          const firstImg = items.find((i) => i.image_url)?.image_url;
          const isOpen = expanded === o.id;
          return (
            <div key={o.id} className="rounded-2xl border bg-card overflow-hidden shadow-premium card-hover">
              <button onClick={() => setExpanded(isOpen ? null : o.id)}
                className="w-full text-left p-5 flex items-start gap-4">
                <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted shrink-0 grid place-items-center">
                  {firstImg ? (
                    <img src={firstImg} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Order</span>
                    <span className="font-mono text-xs font-bold">#{o.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="mt-1 text-sm font-semibold truncate">
                    {items[0]?.name}{items.length > 1 ? ` +${items.length - 1} more` : ""}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {new Date(o.created_at).toLocaleDateString()} · {items.length} item{items.length === 1 ? "" : "s"}
                  </div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest ${s.pill}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} /> {s.label}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display text-lg">{formatZAR(o.total)}</div>
                  <div className="mt-2 inline-flex items-center gap-0.5 text-[11px] text-gold-deep font-bold">
                    {isOpen ? "Hide" : "View"} <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </div>
                </div>
              </button>
              {isOpen && (
                <div className="border-t px-5 py-4 bg-background/60 animate-in fade-in slide-in-from-top-1 duration-200">
                  <ul className="space-y-2 text-sm">
                    {items.map((it, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0 grid place-items-center">
                          {it.image_url
                            ? <img src={storageUrl(it.image_url)} alt="" loading="lazy" className="w-full h-full object-cover" />
                            : <Package className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium">{it.name}</div>
                          <div className="text-xs text-muted-foreground">Qty {it.quantity} · {formatZAR(it.price)}</div>
                        </div>
                        <div className="font-semibold text-sm">{formatZAR(it.line_total ?? it.price * it.quantity)}</div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-3 border-t flex items-center justify-between">
                    <Link to="/account/tracking" className="text-xs font-bold text-gold-deep hover:underline">Track this order →</Link>
                    <div className="font-display text-lg">{formatZAR(o.total)}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
