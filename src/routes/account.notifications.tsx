import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Package, Sparkles, Ticket, CheckCircle2, CircleDot } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account/notifications")({
  head: () => ({ meta: [{ title: "Notifications — NEXA TRADE MART" }, { name: "robots", content: "noindex" }] }),
  component: NotificationsPage,
});

type Kind = "order" | "reward" | "promo" | "info";
interface N { id: string; kind: Kind; title: string; body: string; date: string; unread: boolean }

const ICON: Record<Kind, typeof Bell> = { order: Package, reward: Sparkles, promo: Ticket, info: Bell };
const TINT: Record<Kind, string> = {
  order: "bg-blue-100 text-blue-700",
  reward: "bg-gold/25 text-gold-deep",
  promo: "bg-emerald-100 text-emerald-700",
  info: "bg-muted text-foreground",
};

function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<N[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    // Derive notifications from real order status changes for now.
    supabase.from("orders").select("id,status,total,created_at,updated_at")
      .eq("customer_id", user.id).order("updated_at", { ascending: false }).limit(15)
      .then(({ data }) => {
        const list: N[] = ((data as any[]) ?? []).map((o) => ({
          id: o.id,
          kind: "order" as const,
          title: `Order #${o.id.slice(0, 8).toUpperCase()} — ${o.status}`,
          body: statusMessage(o.status),
          date: o.updated_at || o.created_at,
          unread: o.status !== "delivered" && o.status !== "cancelled",
        }));
        setItems(list);
        setLoading(false);
      });
  }, [user]);

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  const unread = items.filter((i) => i.unread).length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-6 shadow-premium">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl flex items-center gap-2">
              <Bell className="h-5 w-5 text-gold-deep" /> Notifications
              {unread > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive text-white">{unread} new</span>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Live updates about your orders, rewards and offers.</p>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead}
              className="h-9 px-3 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-muted">
              <CheckCircle2 className="h-4 w-4" /> Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-card divide-y shadow-premium overflow-hidden">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="p-5 flex gap-3 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-2/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <Bell className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-display text-lg">You're all caught up</p>
            <p className="text-sm text-muted-foreground">No notifications right now.</p>
          </div>
        ) : (
          items.map((n) => {
            const Icon = ICON[n.kind];
            return (
              <div key={n.id} className={`p-5 flex gap-3 items-start transition-colors ${n.unread ? "bg-gold/5" : ""}`}>
                <div className={`h-10 w-10 rounded-full grid place-items-center shrink-0 ${TINT[n.kind]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold truncate">{n.title}</div>
                    {n.unread && <CircleDot className="h-3 w-3 text-gold-deep shrink-0" />}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{new Date(n.date).toLocaleString()}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function statusMessage(s: string) {
  switch (s) {
    case "pending": return "We've received your order and it's awaiting confirmation.";
    case "confirmed": return "Your order has been confirmed. Preparing for dispatch.";
    case "processing": return "Your order is being processed.";
    case "packed": return "Your order has been packed and is ready to ship.";
    case "shipped": return "Your order is on its way!";
    case "delivered": return "Delivered — enjoy your purchase.";
    case "cancelled": return "This order was cancelled.";
    default: return "Order update.";
  }
}
