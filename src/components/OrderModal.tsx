import { useState, useEffect } from "react";
import { X, Loader2, MessageCircle, Truck, Store } from "lucide-react";
import { formatZAR, WHATSAPP_NUMBER } from "@/lib/shopify";
import { useServerFn } from "@tanstack/react-start";
import { placeOrder } from "@/lib/orders.functions";
import { toast } from "sonner";

export interface OrderModalItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  items: OrderModalItem[];
  onSuccess?: () => void;
  title?: string;
}

export function OrderModal({ open, onClose, items, onSuccess, title = "Complete your order" }: OrderModalProps) {
  const placeOrderFn = useServerFn(placeOrder);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    fulfillment: "delivery" as "delivery" | "pickup",
    address: "",
    notes: "",
  });

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  async function submit() {
    const name = form.name.trim();
    const phone = form.phone.trim();
    if (!name) {
      toast.message("Please enter your name to continue.");
      return;
    }
    if (!phone || phone.replace(/\D/g, "").length < 7) {
      toast.message("Please enter a valid phone number to continue.");
      return;
    }
    if (form.fulfillment === "delivery" && !form.address.trim()) {
      toast.message("Please enter your delivery address to continue.");
      return;
    }
    if (items.length === 0) {
      toast.error("Your order is empty.");
      return;
    }

    setSubmitting(true);
    try {
      const orderItems = items.map((i) => ({
        product_id: i.product_id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        line_total: i.price * i.quantity,
      }));
      const fulfillmentLabel = form.fulfillment === "delivery" ? "Delivery" : "Pickup";
      const { error } = await supabase.from("orders").insert({
        customer_name: name,
        customer_phone: phone,
        customer_address: form.fulfillment === "delivery" ? form.address.trim() : "Pickup in-store",
        notes: form.notes.trim() || null,
        items: orderItems,
        subtotal,
        total: subtotal,
        source: "whatsapp",
      });
      if (error) throw error;

      const lines = items
        .map((i) => `• ${i.name} x${i.quantity} — ${formatZAR(i.price * i.quantity)}`)
        .join("\n");
      const msg =
        `Hi NEXA TRADE MART, I'd like to place an order:\n\n${lines}\n\n` +
        `Subtotal: ${formatZAR(subtotal)}\n\n` +
        `Name: ${name}\nPhone: ${phone}\nOption: ${fulfillmentLabel}\n` +
        (form.fulfillment === "delivery" ? `Address: ${form.address.trim()}\n` : "") +
        (form.notes.trim() ? `Notes: ${form.notes.trim()}\n` : "");
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
      toast.success("Order sent! We'll confirm on WhatsApp.");
      onSuccess?.();
      onClose();
      setForm({ name: "", phone: "", fulfillment: "delivery", address: "", notes: "" });
    } catch (e) {
      console.error(e);
      toast.error("Could not place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-background text-foreground sm:rounded-2xl rounded-t-3xl shadow-2xl border border-border max-h-[92vh] flex flex-col">
        <header className="flex items-start justify-between p-5 border-b border-border">
          <div>
            <h3 className="font-display text-xl">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Takes less than 30 seconds.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {items.length > 0 && (
            <div className="rounded-xl border border-border bg-secondary/40 p-3 space-y-1.5">
              {items.map((i) => (
                <div key={i.product_id} className="flex items-center justify-between text-sm">
                  <span className="truncate pr-2">
                    {i.name} <span className="text-muted-foreground">× {i.quantity}</span>
                  </span>
                  <span className="font-semibold">{formatZAR(i.price * i.quantity)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 mt-1 border-t border-border">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Subtotal</span>
                <span className="font-display text-lg font-bold">{formatZAR(subtotal)}</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Full name <span className="text-destructive">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Thabo Nkosi"
                maxLength={120}
                autoFocus
                className="mt-1 w-full h-12 rounded-lg border border-border bg-background px-3 text-base outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Phone number <span className="text-destructive">*</span>
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. 068 496 3972"
                inputMode="tel"
                maxLength={30}
                className="mt-1 w-full h-12 rounded-lg border border-border bg-background px-3 text-base outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Fulfillment <span className="text-destructive">*</span>
              </label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {([
                  { v: "delivery", label: "Delivery", Icon: Truck },
                  { v: "pickup", label: "Pickup", Icon: Store },
                ] as const).map(({ v, label, Icon }) => {
                  const active = form.fulfillment === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setForm({ ...form, fulfillment: v })}
                      className={`h-12 rounded-lg border inline-flex items-center justify-center gap-2 text-sm font-semibold transition ${
                        active
                          ? "border-gold bg-gold/10 text-gold-deep"
                          : "border-border bg-background hover:bg-muted text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {form.fulfillment === "delivery" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Delivery address <span className="text-destructive">*</span>
                </label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street, suburb, city"
                  maxLength={250}
                  className="mt-1 w-full h-12 rounded-lg border border-border bg-background px-3 text-base outline-none focus:border-gold"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Additional notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional — preferred time, gate code, etc."
                maxLength={500}
                rows={2}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>

        <footer className="p-5 border-t border-border bg-secondary/40 space-y-2">
          <button
            onClick={submit}
            disabled={submitting}
            className="w-full h-12 rounded-lg gradient-gold text-ink font-bold inline-flex items-center justify-center gap-2 shadow-gold hover:opacity-95 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
            Send order on WhatsApp
          </button>
          <p className="text-[11px] text-center text-muted-foreground">
            Your order is saved and a WhatsApp chat opens to confirm.
          </p>
        </footer>
      </div>
    </div>
  );
}
