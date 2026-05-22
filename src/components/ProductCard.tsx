import { Link } from "@tanstack/react-router";
import { ShoppingBag, Star, MessageCircle, Loader2 } from "lucide-react";
import { ShopifyProduct, formatZAR, WHATSAPP_NUMBER } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

export function ProductCard({ p }: { p: ShopifyProduct }) {
  const variant = p.node.variants.edges[0]?.node;
  const image = p.node.images.edges[0]?.node;
  const price = variant?.price.amount ?? p.node.priceRange.minVariantPrice.amount;
  const compareAt = variant?.compareAtPrice?.amount;
  const hasDiscount = compareAt && parseFloat(compareAt) > parseFloat(price);
  const discountPct = hasDiscount
    ? Math.round(((parseFloat(compareAt) - parseFloat(price)) / parseFloat(compareAt)) * 100)
    : 0;

  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const badge = p.node.tags.find((t) =>
    ["Best Seller", "Hot Deal", "Limited Offer", "Free Gift Eligible", "New"].includes(t),
  );

  async function handleAdd() {
    if (!variant) return;
    await addItem({
      product: p,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Added to cart", { description: p.node.title, position: "top-center" });
  }

  const waMsg = `Hi NEXA TRADE MART, I'd like to order:\n\n• ${p.node.title}\n• Price: ${formatZAR(price)}\n• Link: ${typeof window !== "undefined" ? window.location.origin : ""}/product/${p.node.handle}`;

  return (
    <article className="group relative bg-card border border-border rounded-2xl overflow-hidden card-hover">
      <Link to="/product/$handle" params={{ handle: p.node.handle }} className="block">
        <div className="relative aspect-square bg-secondary overflow-hidden">
          {image ? (
            <img
              src={image.url}
              alt={image.altText ?? p.node.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {hasDiscount && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-destructive text-destructive-foreground shadow-premium">
                -{discountPct}%
              </span>
            )}
            {badge && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold gradient-gold text-ink shadow-gold">
                {badge}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="p-4">
        <div className="text-[10px] uppercase tracking-widest text-gold-deep mb-1">{p.node.productType}</div>
        <Link to="/product/$handle" params={{ handle: p.node.handle }}>
          <h3 className="font-semibold text-sm sm:text-base leading-tight line-clamp-2 hover:text-gold-deep transition">
            {p.node.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mt-1.5 text-gold">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-current" />
          ))}
          <span className="text-[11px] text-muted-foreground ml-1">In stock</span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-display text-lg font-bold text-ink">{formatZAR(price)}</span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">{formatZAR(compareAt!)}</span>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleAdd}
            disabled={isLoading || !variant?.availableForSale}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-lg bg-ink text-white text-xs font-semibold hover:bg-ink-soft transition disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
            Add to Cart
          </button>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Order on WhatsApp"
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-[#25D366] text-white hover:opacity-90 transition"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
