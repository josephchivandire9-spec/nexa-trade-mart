import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatZAR, WHATSAPP_NUMBER } from "@/lib/shopify";
import { e164DigitsForWhatsApp } from "@/components/PhoneInput";
import { toast } from "sonner";
import { Trash2, Search, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUSES = ["pending", "confirmed", "processing", "packed", "shipped", "delivered", "cancelled"] as const;

function AdminOrders() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () =>
      (await supabase.from("orders").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete this order?")) return;
    await supabase.from("orders").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (orders as any[]).filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!term) return true;
      return (
        o.customer_name?.toLowerCase().includes(term) ||
        o.customer_phone?.toLowerCase().includes(term) ||
        o.id.toLowerCase().includes(term)
      );
    });
  }, [orders, q, filter]);

  function waLink(o: any) {
    const lines = (o.items as any[])
      .map((i) => `• ${i.name} x${i.quantity} — ${formatZAR(i.line_total ?? i.price * i.quantity)}`)
      .join("\n");
    const msg =
      `Hi ${o.customer_name}, this is NEXA TRADE MART confirming your order #${o.id.slice(0, 8)}:\n\n${lines}\n\n` +
      `Total: ${formatZAR(o.total)}\nStatus: ${o.status}`;
    const phone = (o.customer_phone || "").replace(/\D/g, "");
    return `https://wa.me/${phone || WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Orders</h1>
      <p className="text-sm text-muted-foreground mt-1">{orders.length} total</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, order ID…"
            className="w-full h-10 rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:border-gold"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-10 rounded-lg border bg-background px-3 text-sm outline-none"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="mt-6 space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">No orders.</div>
        )}
        {filtered.map((o) => (
          <div key={o.id} className="rounded-2xl border bg-card p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">#{o.id.slice(0, 8)}</div>
                <div className="font-medium mt-0.5">{o.customer_name}</div>
                <div className="text-xs text-muted-foreground">{o.customer_phone} {o.customer_email ? `· ${o.customer_email}` : ""}</div>
                {o.customer_address && <div className="text-xs text-muted-foreground mt-0.5">{o.customer_address}</div>}
                {o.notes && <div className="text-xs italic text-muted-foreground mt-1">Note: {o.notes}</div>}
              </div>
              <div className="text-right">
                <div className="font-display text-xl">{formatZAR(o.total)}</div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
              </div>
            </div>
            <ul className="mt-3 text-sm space-y-1 border-t pt-3">
              {(o.items as any[]).map((it, i) => (
                <li key={i} className="flex justify-between">
                  <span>{it.name} × {it.quantity}</span>
                  <span className="text-muted-foreground">{formatZAR(it.line_total ?? it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <select
                value={o.status}
                onChange={(e) => setStatus(o.id, e.target.value)}
                className="h-9 rounded-lg border bg-background px-3 text-sm outline-none"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <a
                href={waLink(o)}
                target="_blank"
                rel="noreferrer"
                className="h-9 px-3 rounded-lg border border-gold/40 text-gold-deep text-xs inline-flex items-center gap-1 hover:bg-gold/10"
              >
                <MessageCircle className="h-3.5 w-3.5" /> Notify on WhatsApp
              </a>
              <button onClick={() => remove(o.id)} className="ml-auto h-9 w-9 inline-flex items-center justify-center rounded text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
