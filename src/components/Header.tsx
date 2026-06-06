import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Search, X, Shield, LogIn, LogOut, User } from "lucide-react";
import { Logo } from "./Logo";
import { CartDrawer } from "./CartDrawer";
import { CATEGORIES } from "@/lib/shopify";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/promotions", label: "Promotions" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-ink/95 text-white border-b border-white/10">
      <div className="border-b border-gold/20 bg-black/60 text-[11px] tracking-widest uppercase text-gold/90">
        <div className="container-px mx-auto max-w-7xl py-2 flex items-center justify-center sm:justify-between gap-4">
          <span className="hidden sm:inline">Free local delivery on orders over R500 · Port Elizabeth / Gqeberha</span>
          <span>Shop More · Save More · Get Rewarded</span>
        </div>
      </div>
      <div className="container-px mx-auto max-w-7xl flex items-center justify-between gap-4 py-3">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <Logo className="h-12 w-auto drop-shadow-[0_2px_8px_rgba(212,175,55,0.35)]" />
          <span className="hidden md:flex flex-col leading-none">
            <span className="font-display text-lg tracking-[0.18em] text-gradient-gold">NEXA</span>
            <span className="text-[10px] tracking-[0.4em] text-white/70">TRADE MART</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-white/80 hover:text-gold transition-colors"
              activeProps={{ className: "text-gold" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/shop"
            search={{ q: "" }}
            className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 hover:border-gold hover:text-gold transition"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="hidden sm:inline-flex h-10 px-3 items-center gap-1.5 rounded-full bg-gold text-ink text-xs font-bold hover:opacity-90 transition"
              title="Admin Dashboard"
            >
              <Shield className="h-3.5 w-3.5" /> Admin
            </Link>
          )}

          {user ? (
            <Link
              to="/account"
              className="hidden sm:inline-flex h-10 px-3 items-center gap-1.5 rounded-full border border-white/15 hover:border-gold hover:text-gold transition text-xs"
              title={user.email ?? "Account"}
            >
              <User className="h-4 w-4" /> Account
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex h-10 px-3 items-center gap-1.5 rounded-full border border-white/15 hover:border-gold hover:text-gold transition text-xs"
              aria-label="Sign in"
            >
              <LogIn className="h-4 w-4" /> Sign in
            </Link>
          )}


          <CartDrawer />
          <button
            className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-full border border-white/15"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/10 bg-ink">
          <div className="container-px mx-auto max-w-7xl py-3 flex flex-col">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 border-b border-white/5 text-white/85 hover:text-gold"
              >
                {n.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="mt-3 inline-flex items-center justify-center gap-2 h-11 rounded-full bg-gold text-ink font-bold text-sm"
              >
                <Shield className="h-4 w-4" /> Admin Dashboard
              </Link>
            )}

            {user ? (
              <>
                <Link
                  to="/account"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex items-center justify-center gap-2 h-11 rounded-full border border-gold/40 text-gold text-sm"
                >
                  <User className="h-4 w-4" /> My Account
                </Link>
                <button
                  onClick={() => { setOpen(false); signOut(); }}
                  className="mt-2 inline-flex items-center justify-center gap-2 h-11 rounded-full border border-white/15 text-white/85 text-sm"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="mt-3 inline-flex items-center justify-center gap-2 h-11 rounded-full border border-gold/40 text-gold text-sm"
                >
                  <User className="h-4 w-4" /> Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex items-center justify-center gap-2 h-11 rounded-full gradient-gold text-ink font-bold text-sm"
                >
                  Create account
                </Link>
              </>
            )}


            <div className="pt-4 pb-2 text-[11px] uppercase tracking-widest text-white/40">Categories</div>
            {CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                to="/shop"
                search={{ category: c.slug }}
                onClick={() => setOpen(false)}
                className="py-2 text-white/75 hover:text-gold"
              >
                {c.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
