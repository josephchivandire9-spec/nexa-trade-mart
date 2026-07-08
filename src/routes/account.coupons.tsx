import { createFileRoute, Link } from "@tanstack/react-router";
import { Ticket, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/account/coupons")({
  head: () => ({ meta: [{ title: "Coupons — NEXA TRADE MART" }, { name: "robots", content: "noindex" }] }),
  component: CouponsPage,
});

// Placeholder coupons — will be replaced with live data in Milestone 2.
const COUPONS = [
  { code: "WELCOME10", discount: "10% OFF", desc: "First order discount", expires: "2026-12-31", tone: "gold" },
  { code: "FREESHIP", discount: "Free Delivery", desc: "Orders above R500", expires: "2026-09-30", tone: "emerald" },
  { code: "NEXA50", discount: "R50 OFF", desc: "Loyalty appreciation", expires: "2026-08-15", tone: "indigo" },
];

const PROMOS = [
  { title: "Weekend Flash Sale", desc: "Up to 30% off selected categories", cta: "Shop now", href: "/promotions" },
  { title: "Refer & Earn", desc: "Earn 100 points per referred friend", cta: "Invite", href: "/account/referrals" },
];

function CouponsPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-6 shadow-premium">
        <h1 className="font-display text-2xl flex items-center gap-2">
          <Ticket className="h-5 w-5 text-gold-deep" /> Coupons & Offers
        </h1>
        <p className="text-sm text-muted-foreground">Save more on every purchase.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {COUPONS.map((c) => (
          <div key={c.code} className="relative overflow-hidden rounded-2xl border bg-card p-5 card-hover">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gold/15" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-gold-deep">{c.desc}</div>
                <div className="font-display text-2xl mt-1">{c.discount}</div>
              </div>
              <Sparkles className="h-5 w-5 text-gold-deep shrink-0" />
            </div>
            <div className="relative mt-4 flex items-center gap-2 border-t border-dashed pt-3">
              <code className="flex-1 font-mono text-sm font-bold tracking-wider bg-muted rounded px-2 py-1.5">{c.code}</code>
              <button onClick={() => { navigator.clipboard?.writeText(c.code); toast.success(`Code ${c.code} copied`); }}
                className="h-9 px-3 rounded-lg gradient-gold text-ink font-bold text-xs inline-flex items-center gap-1.5">
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
            </div>
            <div className="relative mt-2 text-[11px] text-muted-foreground">Expires {new Date(c.expires).toLocaleDateString()}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-premium">
        <h2 className="font-display text-lg">Current Promotions</h2>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          {PROMOS.map((p) => (
            <Link key={p.title} to={p.href} className="rounded-xl border bg-background p-4 card-hover block">
              <div className="font-semibold text-sm">{p.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{p.desc}</div>
              <div className="mt-2 text-xs font-bold text-gold-deep">{p.cta} →</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
