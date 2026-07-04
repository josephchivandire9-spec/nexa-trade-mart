import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X, Loader2, MessageCircle, Truck, Store, LogIn, UserPlus, CreditCard, Banknote, ShoppingBag, Landmark, Copy } from "lucide-react";
import { formatZAR, WHATSAPP_NUMBER } from "@/lib/shopify";
import { useServerFn } from "@tanstack/react-start";
import { placeOrder } from "@/lib/orders.functions";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { PhoneInput, e164DigitsForWhatsApp } from "@/components/PhoneInput";
import { toast } from "sonner";

type PaymentMethod = "online" | "eft" | "cod" | "pickup";

export const BANKING_DETAILS = [
  { label: "Bank Zero", holder: "Nexa Trade Mart", account: "81402200122", branch: "888000" },
  { label: "Access Bank", holder: "Nexa Trade Mart", account: "51464600000", branch: "410506" },
] as const;


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
  const { user, loading: authLoading } = useAuth();
  const { profile, update: updateProfile } = useProfile();
  const [submitting, setSubmitting] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    fulfillment: "delivery" as "delivery" | "pickup",
    payment_method: "cod" as PaymentMethod,
    address: "",
    notes: "",
  });

  useEffect(() => {
    if (open && profile && !prefilled) {
      setForm((f) => ({
        ...f,
        name: f.name || profile.full_name || "",
        phone: f.phone || profile.phone || "",
        address: f.address || profile.address || "",
      }));
      setPrefilled(true);
    }
    if (!open) setPrefilled(false);
  }, [open, profile, prefilled]);


  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  // Gate guest checkout — require sign-in/registration first
  if (!authLoading && !user) {
    return (
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full sm:max-w-md bg-background text-foreground sm:rounded-2xl rounded-t-3xl shadow-2xl border border-border">
          <header className="flex items-start justify-between p-5 border-b border-border">
            <div>
              <h3 className="font-display text-xl">Sign in to check out</h3>
              <p className="text-xs text-muted-foreground mt-0.5">An account saves your details and lets you track orders.</p>
            </div>
            <button onClick={onClose} aria-label="Close" className="p-2 rounded-full hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </header>
          <div className="p-5 space-y-3">
            <Link to="/login" onClick={onClose} className="w-full h-12 rounded-lg gradient-gold text-ink font-bold inline-flex items-center justify-center gap-2">
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
            <Link to="/register" onClick={onClose} className="w-full h-12 rounded-lg border border-gold/40 text-gold-deep font-semibold inline-flex items-center justify-center gap-2 hover:bg-gold/5">
              <UserPlus className="h-4 w-4" /> Create account
            </Link>
            <p className="text-[11px] text-center text-muted-foreground pt-2">
              Your cart is saved — you'll come right back here after signing in.
            </p>
          </div>
        </div>
      </div>
    );
  }


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
      const fulfillmentLabel = form.fulfillment === "delivery" ? "Delivery" : "Pickup";
      const paymentLabel =
        form.payment_method === "online" ? "Pay Online" :
        form.payment_method === "eft" ? "EFT / Bank Transfer" :
        form.payment_method === "cod" ? "Cash on Delivery" : "Pay at Pickup";
      const result = await placeOrderFn({
        data: {
          customer_name: name,
          customer_phone: phone,
          customer_address: form.fulfillment === "delivery" ? form.address.trim() : "Pickup in-store",
          notes: form.notes.trim() || null,
          fulfillment: form.fulfillment,
          payment_method: form.payment_method,
          source: "whatsapp",
          items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        },
      });

      const lines = result.items
        .map((i) => `• ${i.name} x${i.quantity} — ${formatZAR(i.line_total)}`)
        .join("\n");
      const msg =
        `Hi NEXA TRADE MART, I'd like to place an order:\n\n${lines}\n\n` +
        `Subtotal: ${formatZAR(result.subtotal)}\n\n` +
        `Name: ${name}\nPhone: ${phone}\nOption: ${fulfillmentLabel}\nPayment: ${paymentLabel}\n` +
        (form.fulfillment === "delivery" ? `Address: ${form.address.trim()}\n` : "") +
        (form.notes.trim() ? `Notes: ${form.notes.trim()}\n` : "");
      const waNumber = e164DigitsForWhatsApp(WHATSAPP_NUMBER.startsWith("+") ? WHATSAPP_NUMBER : `+${WHATSAPP_NUMBER}`) || WHATSAPP_NUMBER;
      window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
      toast.success(form.payment_method === "online" ? "Order sent! Payment link will be shared on WhatsApp." : "Order sent! We'll confirm on WhatsApp.");
      // Save updated profile details for signed-in customers
      if (profile) {
        updateProfile({
          full_name: name,
          phone,
          address: form.fulfillment === "delivery" ? form.address.trim() : profile.address ?? "",
        });
      }
      onSuccess?.();
      onClose();
      setForm({ name: "", phone: "", fulfillment: "delivery", payment_method: "cod", address: "", notes: "" });

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
              <div className="mt-1">
                <PhoneInput value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Select your country — we save your number in international format for WhatsApp.</p>
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
                      onClick={() => setForm({ ...form, fulfillment: v, payment_method: v === "pickup" ? "pickup" : form.payment_method === "pickup" ? "cod" : form.payment_method })}
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
                Payment method <span className="text-destructive">*</span>
              </label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {(form.fulfillment === "pickup"
                  ? ([{ v: "pickup", label: "Pay at pickup", Icon: ShoppingBag }] as const)
                  : ([
                      { v: "online", label: "Pay Online", Icon: CreditCard },
                      { v: "cod", label: "Cash on Delivery", Icon: Banknote },
                    ] as const)
                ).map(({ v, label, Icon }) => {
                  const active = form.payment_method === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setForm({ ...form, payment_method: v })}
                      className={`h-14 rounded-lg border inline-flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition px-2 text-center ${
                        active ? "border-gold bg-gold/10 text-gold-deep" : "border-border bg-background hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  );
                })}
              </div>
              {form.payment_method === "online" && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  You'll be securely redirected to our payment gateway after confirming on WhatsApp. We never store card details.
                </p>
              )}
            </div>


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
