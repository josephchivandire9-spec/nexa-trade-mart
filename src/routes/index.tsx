import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Truck, ShieldCheck, Sparkles, Gift, Tag, Users, Star, Phone, Mail } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ProductCard } from "@/components/ProductCard";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { WHATSAPP_NUMBER, SUPPORT_EMAIL, SUPPORT_PHONE } from "@/lib/shopify";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEXA TRADE MART — Shop More. Save More. Get Rewarded." },
      { name: "description", content: "Premium retail in Port Elizabeth / Gqeberha. Clothing, shoes, electronics, phones, household & beauty with fast WhatsApp ordering and local delivery." },
      { property: "og:title", content: "NEXA TRADE MART — Everything you need, in one place." },
      { property: "og:description", content: "Shop more, save more, get rewarded. Loyalty rewards & free gifts on selected orders." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const categoryGradients: Record<string, string> = {
  clothing: "from-amber-200/30 via-amber-400/20 to-amber-600/10",
  shoes: "from-yellow-200/30 via-yellow-400/20 to-yellow-700/10",
  electronics: "from-amber-100/30 via-amber-300/20 to-amber-500/10",
  cellphones: "from-yellow-100/30 via-yellow-300/20 to-yellow-600/10",
  household: "from-amber-200/30 via-amber-500/20 to-amber-700/10",
  beauty: "from-yellow-200/30 via-amber-300/20 to-amber-500/10",
};

const categoryEmoji: Record<string, string> = {
  clothing: "👕",
  shoes: "👟",
  electronics: "📺",
  cellphones: "📱",
  household: "🏠",
  beauty: "💄",
};

function Home() {
  const { data: products = [], isLoading } = useProducts({ limit: 12 });
  const { data: categories = [] } = useCategories();
  const featured = products.filter((p) => p.is_featured).slice(0, 8);
  const featuredList = featured.length > 0 ? featured : products.slice(0, 8);
  const deals = products.filter((p) => p.compare_at_price && p.compare_at_price > p.price).slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink-radial text-white">
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(212,175,55,0.25), transparent 45%), radial-gradient(circle at 80% 80%, rgba(212,175,55,0.15), transparent 50%)" }}
        />
        <div className="container-px mx-auto max-w-7xl py-16 sm:py-24 lg:py-32 grid lg:grid-cols-2 gap-12 items-center relative">
          <div className="fade-up">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 text-gold text-[11px] tracking-[0.3em] uppercase">
              <Sparkles className="h-3 w-3" /> Premium Retail · Gqeberha
            </span>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-7xl leading-[1.05] tracking-tight">
              Everything you need,
              <br />
              <span className="text-gradient-gold">in one place.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/70 max-w-xl">
              Shop more. Save more. Get rewarded. Browse premium clothing, electronics, phones, household
              and beauty essentials — with fast WhatsApp ordering and reliable local delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 h-12 px-6 rounded-full gradient-gold text-ink font-bold shadow-gold hover:opacity-95 transition">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi NEXA, I'd like to order...")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full border border-white/20 text-white hover:border-gold hover:text-gold transition"
              >
                <MessageCircle className="h-4 w-4" /> Order on WhatsApp
              </a>
            </div>
          </div>

          <div className="relative fade-up">
            <div className="absolute -inset-10 bg-gold/10 blur-3xl rounded-full" />
            <div className="relative rounded-3xl border border-gold/20 bg-black/60 p-8 sm:p-12 ring-gold-glow float-slow backdrop-blur">
              <Logo className="w-full max-w-md mx-auto" />
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gold/20 bg-white/5 p-3 text-center">
                  <Gift className="mx-auto h-5 w-5 text-gold" />
                  <div className="mt-1 text-xs font-semibold">Loyalty Rewards</div>
                  <div className="text-[10px] text-white/60">Big rewards for loyal customers</div>
                </div>
                <div className="rounded-xl border border-gold/20 bg-white/5 p-3 text-center">
                  <Truck className="mx-auto h-5 w-5 text-gold" />
                  <div className="mt-1 text-xs font-semibold">Local Delivery</div>
                  <div className="text-[10px] text-white/60">Fast & reliable in PE</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border bg-background">
        <div className="container-px mx-auto max-w-7xl py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: ShieldCheck, title: "Secure Ordering", body: "Safe & encrypted checkout" },
            { icon: Star, title: "Trusted Seller", body: "Hundreds of happy customers" },
            { icon: Truck, title: "Fast Local Delivery", body: "Free over R500 in PE" },
            { icon: Gift, title: "Satisfaction Guarantee", body: "Quality you can trust" },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gold/10 text-gold-deep inline-flex items-center justify-center shrink-0">
                <t.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold leading-tight">{t.title}</div>
                <div className="text-[11px] text-muted-foreground leading-tight">{t.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-px mx-auto max-w-7xl py-16 sm:py-20">
        <SectionTitle eyebrow="Browse" title="Featured Categories" />
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card aspect-square card-hover"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${categoryGradients[c.slug] ?? "from-amber-200/30 to-amber-600/10"}`} />
              <div className="absolute inset-0 bg-ink/85 group-hover:bg-ink/70 transition" />
              <div className="relative h-full flex flex-col items-center justify-center text-white p-4 text-center">
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">{categoryEmoji[c.slug] ?? "🛍️"}</span>
                <h3 className="font-display text-sm sm:text-base text-gradient-gold">{c.name}</h3>
                <p className="text-[10px] text-white/60 mt-1 line-clamp-2">{c.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-secondary/50">
        <div className="container-px mx-auto max-w-7xl py-16 sm:py-20">
          <div className="flex items-end justify-between gap-4">
            <SectionTitle eyebrow="Trending" title="Featured Products" />
            <Link to="/shop" className="hidden sm:inline-flex items-center gap-1 text-sm text-gold-deep hover:text-ink font-semibold">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <div key={i} className="rounded-2xl bg-muted aspect-[3/4] animate-pulse" />)}
            </div>
          ) : featuredList.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed bg-secondary/40 p-10 text-center">
              <p className="text-muted-foreground">No products yet.</p>
              <p className="text-sm mt-1">Sign in and add your first products from the admin dashboard.</p>
              <Link to="/auth" className="mt-4 inline-flex h-10 px-5 rounded-full bg-ink text-white text-sm">Go to admin</Link>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredList.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* PROMOTIONS */}
      <section className="container-px mx-auto max-w-7xl py-16 sm:py-20">
        <SectionTitle eyebrow="Rewards" title="Promotions & Loyalty" />
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Gift, title: "Buy 5, Get a Free Gift", body: "Mix any 5 qualifying items and unlock an exclusive free gift on us." },
            { icon: Users, title: "Refer 5 Friends, Earn Rewards", body: "Invite 5 friends or family to shop with us and receive vouchers and bonus products." },
            { icon: Tag, title: "Monthly Giveaways", body: "Loyal customers win exclusive prizes every month." },
            { icon: Star, title: "Customer of the Month", body: "Our top shopper receives a premium reward package & VIP treatment." },
            { icon: Sparkles, title: "Discount Vouchers", body: "Unlock vouchers for every order — applied automatically." },
            { icon: ShieldCheck, title: "Trust Guarantee", body: "Quality products, safe shopping, real customer support." },
          ].map((r, i) => (
            <div key={i} className="group relative rounded-2xl border border-border bg-card p-6 overflow-hidden card-hover">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/10 blur-2xl group-hover:bg-gold/20 transition" />
              <r.icon className="h-7 w-7 text-gold-deep" />
              <h3 className="mt-3 font-display text-lg">{r.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOT DEALS */}
      {deals.length > 0 && (
        <section className="bg-secondary/50">
          <div className="container-px mx-auto max-w-7xl py-16 sm:py-20">
            <SectionTitle eyebrow="Limited Time" title="Hot Deals" />
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {deals.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* SUPPORT */}
      <section className="container-px mx-auto max-w-7xl py-16 sm:py-20">
        <div className="rounded-3xl bg-ink text-white p-8 sm:p-12 grid md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <span className="text-[11px] uppercase tracking-[0.3em] text-gold">Support & Trust</span>
            <h3 className="mt-2 font-display text-3xl">Help when you need it.</h3>
            <p className="mt-2 text-white/70 max-w-xl">
              Real support during working hours. Reach out by WhatsApp, phone or email — we're here to help.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-2 hover:text-gold"><Mail className="h-4 w-4 text-gold" /> {SUPPORT_EMAIL}</a>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="flex items-center gap-2 hover:text-gold"><MessageCircle className="h-4 w-4 text-gold" /> WhatsApp Support</a>
            <a href={`tel:${SUPPORT_PHONE}`} className="flex items-center gap-2 hover:text-gold"><Phone className="h-4 w-4 text-gold" /> {SUPPORT_PHONE}</a>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <span className="text-[11px] uppercase tracking-[0.4em] text-gold-deep">{eyebrow}</span>
      <h2 className="mt-2 font-display text-3xl sm:text-4xl">{title}</h2>
      <div className="mt-3 h-px w-16 gradient-gold" />
    </div>
  );
}
