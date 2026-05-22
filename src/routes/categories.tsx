import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/lib/shopify";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — NEXA TRADE MART" },
      { name: "description", content: "Browse all product categories at NEXA TRADE MART — clothing, shoes, electronics, phones, household, beauty." },
      { property: "og:url", content: "/categories" },
    ],
    links: [{ rel: "canonical", href: "/categories" }],
  }),
  component: Categories,
});

const emoji: Record<string, string> = {
  clothing: "👕", shoes: "👟", electronics: "📺", phones: "📱", household: "🏠", beauty: "💄",
};

function Categories() {
  return (
    <div className="container-px mx-auto max-w-7xl py-14">
      <div className="text-center">
        <span className="text-[11px] uppercase tracking-[0.4em] text-gold-deep">Browse</span>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">All Categories</h1>
      </div>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORIES.map((c) => (
          <Link key={c.slug} to="/shop" search={{ category: c.slug }} className="group relative overflow-hidden rounded-2xl border border-border bg-card aspect-[4/3] card-hover">
            <div className="absolute inset-0 bg-ink/90 group-hover:bg-ink/75 transition" />
            <div className="relative h-full flex flex-col items-center justify-center text-white p-6 text-center">
              <span className="text-5xl mb-3">{emoji[c.slug]}</span>
              <h3 className="font-display text-2xl text-gradient-gold">{c.title}</h3>
              <p className="text-sm text-white/70 mt-1">{c.blurb}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-gold">
                Shop <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
