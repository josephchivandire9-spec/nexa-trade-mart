import { useState } from "react";
import { ShoppingCart, Minus, Plus, Trash2, MessageCircle, X, Loader2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatZAR, WHATSAPP_NUMBER } from "@/lib/shopify";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  async function placeOrder() {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Please enter your name and phone number");
      return;
    }
    setSubmitting(true);
    try {
      const orderItems = items.map((i) => ({
        product_id: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        line_total: i.price * i.quantity,
      }));
      const { error } = await supabase.from("orders").insert({
        customer_name: form.name,
        customer_phone: form.phone,
        customer_address: form.address || null,
        notes: form.notes || null,
        items: orderItems,
        subtotal,
        total: subtotal,
        source: "whatsapp",
      });
      if (error) throw error;

      const lines = items
        .map((i) => `• ${i.name} x${i.quantity} — ${formatZAR(i.price * i.quantity)}`)
        .join("\n");
      const msg = `Hi NEXA TRADE MART, I'd like to place an order:\n\n${lines}\n\nSubtotal: ${formatZAR(subtotal)}\n\nName: ${form.name}\nPhone: ${form.phone}\nAddress: ${form.address}\nNotes: ${form.notes}`;
      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,
        "_blank",
      );
      toast.success("Order sent! We'll confirm on WhatsApp.");
      clearCart();
      setOpen(false);
      setForm({ name: "", phone: "", address: "", notes: "" });
    } catch (e) {
      console.error(e);
      toast.error("Could not place order. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative h-10 px-3 inline-flex items-center gap-2 rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-ink transition"
        aria-label="Open cart"
      >
        <ShoppingCart className="h-4 w-4" />
        <span className="text-xs font-semibold">Cart</span>
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-gold text-ink text-[10px] font-bold inline-flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-background text-foreground shadow-2xl flex flex-col">
            <header className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="font-display text-xl">Your Cart</h3>
                <p className="text-xs text-muted-foreground">
                  {totalItems === 0 ? "Empty for now" : `${totalItems} item${totalItems > 1 ? "s" : ""}`}
                </p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-2 rounded-full hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mb-3 text-gold/60" />
                  <p>Your cart is empty.</p>
                  <p className="text-xs mt-1">Add premium picks from our shop.</p>
                </div>
              ) : (
                <>
                  <ul className="space-y-4">
                    {items.map((it) => (
                      <li key={it.productId} className="flex gap-3 border-b pb-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary shrink-0">
                          {it.image_url && (
                            <img src={it.image_url} alt={it.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{it.name}</h4>
                          <p className="text-sm font-semibold mt-1">{formatZAR(it.price)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(it.productId, it.quantity - 1)}
                              className="h-7 w-7 rounded border inline-flex items-center justify-center hover:bg-muted"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-sm w-6 text-center">{it.quantity}</span>
                            <button
                              onClick={() => updateQuantity(it.productId, it.quantity + 1)}
                              className="h-7 w-7 rounded border inline-flex items-center justify-center hover:bg-muted"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => removeItem(it.productId)}
                              className="ml-auto h-7 w-7 inline-flex items-center justify-center text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs uppercase tracking-widest text-muted-foreground">Your details</h4>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Full name *"
                      maxLength={120}
                      className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-gold"
                    />
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Phone *"
                      maxLength={30}
                      className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-gold"
                    />
                    <input
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="Delivery address"
                      maxLength={250}
                      className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-gold"
                    />
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Notes (optional)"
                      maxLength={500}
                      rows={2}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
                    />
                  </div>
                </>
              )}
            </div>

            {items.length > 0 && (
              <footer className="p-5 border-t space-y-3 bg-secondary/40">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-display text-xl font-bold">{formatZAR(subtotal)}</span>
                </div>
                <button
                  onClick={placeOrder}
                  disabled={submitting}
                  className="w-full h-12 rounded-lg gradient-gold text-ink font-bold inline-flex items-center justify-center gap-2 shadow-gold hover:opacity-95 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                  Order via WhatsApp
                </button>
                <p className="text-[11px] text-center text-muted-foreground">
                  Your order is saved & a WhatsApp message opens to confirm.
                </p>
              </footer>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
