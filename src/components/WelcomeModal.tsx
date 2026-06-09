import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, LogIn, UserPlus, ShoppingBag, Gift, Truck, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

const KEY = "ntm-welcome-seen-session";

export function WelcomeModal() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user) return;
    if (typeof window === "undefined") return;
    // Show once per browser session (not persistent), so it returns after closing tab
    if (sessionStorage.getItem(KEY)) return;
    const t = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(t);
  }, [user, loading]);

  function close() {
    try { sessionStorage.setItem(KEY, "1"); } catch {}
    setOpen(false);
  }

  async function signInWithGoogle() {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Could not sign in with Google. Please try again.");
        setGoogleLoading(false);
        return;
      }
      if (result.redirected) return; // browser redirecting
      close();
    } catch {
      toast.error("Google sign-in failed.");
      setGoogleLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full sm:max-w-md bg-background text-foreground sm:rounded-2xl rounded-t-3xl shadow-2xl border border-border overflow-hidden max-h-[95vh] flex flex-col">
        <button onClick={close} aria-label="Close" className="absolute top-3 right-3 p-2 rounded-full hover:bg-muted z-10">
          <X className="h-5 w-5" />
        </button>
        <div className="px-6 pt-7 pb-5 text-center bg-gradient-to-br from-ink to-black text-white shrink-0">
          <div className="text-[11px] tracking-[0.4em] text-gold/80 uppercase">Welcome to</div>
          <div className="font-display text-3xl text-gradient-gold mt-1">NEXA TRADE MART</div>
          <p className="mt-2 text-sm text-white/75">Sign in to save your details, track orders and earn rewards.</p>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto">
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={googleLoading}
            className="w-full h-12 rounded-lg bg-white text-ink font-semibold inline-flex items-center justify-center gap-3 border border-border hover:bg-white/90 disabled:opacity-60 shadow-sm"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C40.6 36.3 44 30.6 44 24c0-1.3-.1-2.4-.4-3.5z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Link
            to="/login"
            onClick={close}
            className="w-full h-12 rounded-lg gradient-gold text-ink font-bold inline-flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" /> Sign in with email
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
