import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, Star, MessageCircle } from "lucide-react";
import { type Product, formatZAR } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { OrderModal } from "@/components/OrderModal";
import { storageUrl } from "@/lib/storage";

export function ProductCard({ p }: { p: Product }) {
  const [orderOpen, setOrderOpen] = useState(false);
  const hasDiscount =
    p.compare_at_price && p.compare_at_price > p.price;
  const discountPct = p.discount_pct
    ? p.discount_pct
    : hasDiscount
    ? Math.round(((p.compare_at_price! - p.price) / p.compare_at_price!) * 100)
    : 0;

  const addItem = useCartStore((s) => s.addItem);

  function handleAdd() {
    addItem({
      productId: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      image_url: p.image_url,
      stock: p.stock,
    });
    toast.success("Added to cart", { description: p.name });
  }

  return (
    <article className="group relative bg-card border border-border rounded-2xl overflow-hidden card-hover">
      <Link to="/product/$handle" params={{ handle: p.slug }} className="block">
        <div className="relative aspect-square bg-secondary overflow-hidden">
          {p.image_url ? (
            <img
              src={storageUrl(p.image_url)}
              alt={p.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discountPct > 0 && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-destructive text-destructive-foreground shadow-premium">
                -{discountPct}%
              </span>
            )}
            {p.is_featured && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold gradient-gold text-ink shadow-gold">
                Featured
              </span>
            )}
            {p.stock === 0 && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-muted text-foreground">
                Out of stock
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="p-4">
        {p.category?.name && (
          <div className="text-[10px] uppercase tracking-widest text-gold-deep mb-1">{p.category.name}</div>
        )}
        <Link to="/product/$handle" params={{ handle: p.slug }}>
          <h3 className="font-semibold text-sm sm:text-base leading-tight line-clamp-2 hover:text-gold-deep transition">
            {p.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mt-1.5 text-gold">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-current" />
          ))}
          <span className="text-[11px] text-muted-foreground ml-1">
            {p.stock > 0 ? "In stock" : "Sold out"}
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-display text-lg font-bold text-ink">{formatZAR(p.price)}</span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatZAR(p.compare_at_price!)}
            </span>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleAdd}
            disabled={p.stock === 0}
            className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-lg bg-ink text-white text-xs font-semibold hover:bg-ink-soft transition disabled:opacity-50"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to Cart
          </button>
          <button
            type="button"
            onClick={() => setOrderOpen(true)}
            disabled={p.stock === 0}
            aria-label="Order on WhatsApp"
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-[#25D366] text-white hover:opacity-90 transition disabled:opacity-50"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      <OrderModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        title={`Order: ${p.name}`}
        items={[{ product_id: p.id, name: p.name, price: p.price, quantity: 1 }]}
      />
    </article>
  );
}
