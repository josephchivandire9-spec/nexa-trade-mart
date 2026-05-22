import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { CATEGORIES, ShopifyProduct } from "@/lib/shopify";
import { z } from "zod";

const shopSearchSchema = z.object({
  category: z.string().optional().catch(undefined),
  q: z.string().optional().catch(undefined),
  sort: z.enum(["featured", "price-asc", "price-desc", "discount"]).optional().catch("featured"),
});

export const Route = createFileRoute("/shop")({
  validateSearch: shopSearchSchema,
  head: () => ({
    meta: [
      { title: "Shop — NEXA TRADE MART" },
      { name: "description", content: "Browse premium products across clothing, shoes, electronics, phones, household & beauty. Filter, sort and shop the latest deals." },
      { property: "og:title", content: "Shop — NEXA TRADE MART" },
      { property: "og:url", content: "/shop" },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: ShopPage,
});

function ShopPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(search.q ?? "");
  const [priceMax, setPriceMax] = useState<number>(0);

  const cat = CATEGORIES.find((c) => c.slug === search.category);
  const sfQuery = cat ? `product_type:${cat.type}` : undefined;

  const { data: products = [], isLoading } = useProducts(sfQuery, 100);

  const filtered = useMemo(() => {
    let list: ShopifyProduct[] = products;
    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.node.title.toLowerCase().includes(term) ||
          p.node.tags.some((t) => t.toLowerCase().includes(term)) ||
          p.node.productType?.toLowerCase().includes(term),
      );
    }
    if (priceMax > 0) {
      list = list.filter((p) => parseFloat(p.node.priceRange.minVariantPrice.amount) <= priceMax);
    }
    const sort = search.sort ?? "featured";
    if (sort === "price-asc") list = [...list].sort((a, b) => +a.node.priceRange.minVariantPrice.amount - +b.node.priceRange.minVariantPrice.amount);
    if (sort === "price-desc") list = [...list].sort((a, b) => +b.node.priceRange.minVariantPrice.amount - +a.node.priceRange.minVariantPrice.amount);
    if (sort === "discount") {
      list = [...list].sort((a, b) => {
        const da = a.node.variants.edges[0]?.node?.compareAtPrice
          ? +a.node.variants.edges[0].node.compareAtPrice!.amount - +a.node.variants.edges[0].node.price.amount
          : 0;
        const db = b.node.variants.edges[0]?.node?.compareAtPrice
          ? +b.node.variants.edges[0].node.compareAtPrice!.amount - +b.node.variants.edges[0].node.price.amount
          : 0;
        return db - da;
      });
    }
    return list;
  }, [products, q, priceMax, search.sort]);

  return (
    <div className="container-px mx-auto max-w-7xl py-10 sm:py-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-[0.4em] text-gold-deep">Catalog</span>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">{cat?.title ?? "Shop All"}</h1>
          <p className="text-sm text-muted-foreground mt-1">{cat?.blurb ?? "Premium retail across every category."}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { v: undefined as string | undefined, l: "All" },
            ...CATEGORIES.map((c) => ({ v: c.slug, l: c.title })),
          ].map((opt) => (
            <button
              key={opt.l}
              onClick={() => navigate({ search: { ...search, category: opt.v } as never })}
              className={`px-3 h-9 rounded-full border text-xs font-semibold transition ${
                search.category === opt.v ? "bg-ink text-white border-ink" : "border-border hover:border-gold hover:text-gold-deep"
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="space-y-5 lg:sticky lg:top-28 self-start">
          <div className="rounded-2xl border border-border bg-card p-4">
            <label className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" /> Search
            </label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="mt-2 w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-gold"
            />
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <label className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Max Price (R)
            </label>
            <input
              type="number"
              min={0}
              value={priceMax || ""}
              onChange={(e) => setPriceMax(Number(e.target.value) || 0)}
              placeholder="No limit"
              className="mt-2 w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-gold"
            />
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Sort</label>
            <select
              value={search.sort ?? "featured"}
              onChange={(e) => navigate({ search: { ...search, sort: e.target.value as never } })}
              className="mt-2 w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-gold"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
          <div className="rounded-2xl bg-ink text-white p-5">
            <h3 className="font-display text-lg text-gradient-gold">Need help?</h3>
            <p className="text-xs text-white/70 mt-1">Chat with our team on WhatsApp.</p>
            <Link to="/contact" className="mt-3 inline-flex text-xs text-gold hover:underline">Contact support →</Link>
          </div>
        </aside>

        <div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => <div key={i} className="rounded-2xl bg-muted aspect-[3/4] animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-secondary/40 p-10 text-center">
              <p className="text-muted-foreground">No products found.</p>
              <p className="text-sm mt-1">Try clearing filters or pick a different category.</p>
            </div>
          ) : (
            <>
              <div className="text-xs text-muted-foreground mb-4">{filtered.length} products</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filtered.map((p) => <ProductCard key={p.node.id} p={p} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
