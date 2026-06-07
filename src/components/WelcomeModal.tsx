import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, LogIn, UserPlus, ShoppingBag, Gift, Truck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const KEY = "ntm-welcome-seen";

export function WelcomeModal() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(KEY)) return;
    const t = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(t);
  }, [user, loading]);

  function close() {
    try { localStorage.setItem(KEY, "1"); } catch {}
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full sm:max-w-md bg-background text-foreground sm:rounded-2xl rounded-t-3xl shadow-2xl border border-border overflow-hidden">
        <button onClick={close} aria-label="Close" className="absolute top-3 right-3 p-2 rounded-full hover:bg-muted z-10">
          <X className="h-5 w-5" />
        </button>
        <div className="px-6 pt-7 pb-5 text-center bg-gradient-to-br from-ink to-black text-white">
          <div className="text-[11px] tracking-[0.4em] text-gold/80 uppercase">Welcome to</div>
          <div className="font-display text-3xl text-gradient-gold mt-1">NEXA TRADE MART</div>
          <p className="mt-2 text-sm text-white/75">Sign in to save your details, track orders and earn rewards.</p>
        </div>

        <div className="p-5 space-y-3">
          <Link
            to="/login"
            onClick={close}
            className="w-full h-12 rounded-lg gradient-gold text-ink font-bold inline-flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" /> Sign in
          </Link>
          <Link
            to="/register"
            onClick={close}
            className="w-full h-12 rounded-lg border border-gold/40 text-gold-deep font-semibold inline-flex items-center justify-center gap-2 hover:bg-gold/5"
          >
            <UserPlus className="h-4 w-4" /> Create account
          </Link>
          <button
            type="button"
            onClick={close}
            className="w-full h-11 rounded-lg text-sm text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" /> Continue as guest
          </button>

          <div className="pt-3 mt-2 border-t grid grid-cols-3 gap-2 text-center text-[11px] text-muted-foreground">
            <div className="flex flex-col items-center gap-1"><Truck className="h-4 w-4 text-gold-deep" /> Track orders</div>
            <div className="flex flex-col items-center gap-1"><Gift className="h-4 w-4 text-gold-deep" /> Loyalty points</div>
            <div className="flex flex-col items-center gap-1"><ShoppingBag className="h-4 w-4 text-gold-deep" /> Faster checkout</div>
          </div>
          <p className="text-[10px] text-center text-muted-foreground pt-1">
            Guest browsing is fine. You'll be asked to sign in at checkout.
          </p>
        </div>
      </div>
    </div>
  );
}
