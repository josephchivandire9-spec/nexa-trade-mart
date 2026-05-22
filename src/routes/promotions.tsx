import { createFileRoute, Link } from "@tanstack/react-router";
import { Gift, Users, Star, Tag, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/promotions")({
  head: () => ({
    meta: [
      { title: "Promotions & Rewards — NEXA TRADE MART" },
      { name: "description", content: "Loyalty rewards, free gifts, referral bonuses, monthly giveaways and exclusive promotions at NEXA TRADE MART." },
      { property: "og:url", content: "/promotions" },
    ],
    links: [{ rel: "canonical", href: "/promotions" }],
  }),
  component: Promotions,
});

const promos = [
  { icon: Gift, title: "Buy 5, Get a Free Gift", body: "Add any 5 qualifying items to your order and we'll include a free gift, on us." },
  { icon: Users, title: "Refer & Earn", body: "Invite 5 friends or family. When they shop, you get exclusive vouchers and bonus products." },
  { icon: Star, title: "Customer of the Month", body: "Top shoppers each month win a premium reward package and VIP treatment." },
  { icon: Tag, title: "Monthly Giveaways", body: "Random giveaways for loyal customers. Stay subscribed and check our WhatsApp updates." },
  { icon: Sparkles, title: "Discount Vouchers", body: "Earn vouchers on every order, redeemable automatically at checkout." },
  { icon: ShieldCheck, title: "VIP Trust Guarantee", body: "Verified products, real support and a transparent shopping experience." },
];

function Promotions() {
  return (
    <div>
      <section className="bg-ink-radial text-white">
        <div className="container-px mx-auto max-w-7xl py-16 sm:py-24 text-center">
          <span className="text-[11px] uppercase tracking-[0.4em] text-gold">Promotions · Rewards · Loyalty</span>
          <h1 className="mt-3 font-display text-4xl sm:text-6xl text-gradient-gold">Loyal Customers, Big Rewards</h1>
          <p className="mt-4 max-w-2xl mx-auto text-white/70">
            Shop more, earn points, get free items and unlock exclusive promotions designed for our community.
          </p>
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {promos.map((r, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 card-hover">
              <div className="h-11 w-11 rounded-xl gradient-gold text-ink inline-flex items-center justify-center">
                <r.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-xl">{r.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-ink text-white p-8 sm:p-12 text-center ring-gold-glow">
          <h3 className="font-display text-3xl text-gradient-gold">Ready to start saving?</h3>
          <p className="mt-2 text-white/70">Every order earns rewards. Every customer matters.</p>
          <Link to="/shop" className="mt-6 inline-flex items-center gap-2 h-12 px-6 rounded-full gradient-gold text-ink font-bold">
            Shop the catalog <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
