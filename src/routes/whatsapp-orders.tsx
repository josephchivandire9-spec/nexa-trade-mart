import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { MessageCircle, Send } from "lucide-react";
import { buildWhatsAppOrderLink } from "@/lib/shopify";
import { toast } from "sonner";

export const Route = createFileRoute("/whatsapp-orders")({
  head: () => ({
    meta: [
      { title: "WhatsApp Orders — NEXA TRADE MART" },
      { name: "description", content: "Place a custom order via WhatsApp. Fast, simple, secure." },
      { property: "og:url", content: "/whatsapp-orders" },
    ],
    links: [{ rel: "canonical", href: "/whatsapp-orders" }],
  }),
  component: WAOrders,
});

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(7).max(20),
  address: z.string().trim().min(1).max(200),
  option: z.enum(["Delivery", "Pickup"]),
  location: z.string().trim().max(120).optional(),
  items: z.string().trim().min(1).max(1000),
  notes: z.string().trim().max(500).optional(),
});

function WAOrders() {
  const [form, setForm] = useState({ name: "", phone: "", address: "", option: "Delivery", location: "", items: "", notes: "" });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      toast.error("Please complete all required fields.");
      return;
    }
    const msg = `🛍️ *NEW NEXA TRADE MART ORDER*\n\n*Customer*\nName: ${form.name}\nPhone: ${form.phone}\n\n*Delivery*\nOption: ${form.option}\nAddress: ${form.address}\nLocation: ${form.location || "-"}\n\n*Items*\n${form.items}\n\n*Notes*\n${form.notes || "-"}`;
    window.open(buildWhatsAppOrderLink(msg), "_blank");
    toast.success("Opening WhatsApp…");
  }

  return (
    <div className="container-px mx-auto max-w-3xl py-14">
      <div className="text-center">
        <span className="text-[11px] uppercase tracking-[0.4em] text-gold-deep">Quick Order</span>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">WhatsApp Orders</h1>
        <p className="mt-3 text-muted-foreground">Fill in your details and we'll prepare a professional order message ready to send.</p>
      </div>

      <form onSubmit={submit} className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
        <Field label="Full name"><input maxLength={80} value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input" /></Field>
        <Field label="Phone number"><input maxLength={20} value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="input" /></Field>
        <Field label="Delivery address"><input maxLength={200} value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} className="input" /></Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Pickup or delivery">
            <select value={form.option} onChange={(e) => setForm({...form, option: e.target.value})} className="input">
              <option>Delivery</option>
              <option>Pickup</option>
            </select>
          </Field>
          <Field label="Delivery location / suburb"><input maxLength={120} value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} className="input" /></Field>
        </div>
        <Field label="Products you'd like to order">
          <textarea rows={4} maxLength={1000} value={form.items} onChange={(e) => setForm({...form, items: e.target.value})} className="input" placeholder="e.g. 1x Nike Air Max (size 9), 2x Premium T-Shirt (size L, black)" />
        </Field>
        <Field label="Additional notes (optional)"><textarea rows={3} maxLength={500} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className="input" /></Field>
        <button className="w-full h-12 rounded-lg gradient-gold text-ink font-bold inline-flex items-center justify-center gap-2 shadow-gold">
          <Send className="h-4 w-4" /> Send Order on WhatsApp
        </button>
        <p className="text-center text-xs text-muted-foreground inline-flex items-center justify-center gap-1 w-full"><MessageCircle className="h-3 w-3" /> Opens WhatsApp with a pre-filled message.</p>
      </form>

      <style>{`.input { width:100%; height:44px; padding:0 12px; border-radius:8px; border:1px solid var(--color-border); background: var(--color-background); outline:none; }
        textarea.input { height:auto; padding:10px 12px; }
        .input:focus { border-color: var(--color-gold); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
