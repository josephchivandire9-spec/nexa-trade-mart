import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ShoppingBag, MessageCircle, Star, ShieldCheck, Truck, Gift } from "lucide-react";
import { useProductBySlug } from "@/hooks/useProducts";
import { formatZAR } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { OrderModal } from "@/components/OrderModal";

export const Route = createFileRoute("/product/$handle")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.handle.replace(/-/g, " ")} — NEXA TRADE MART` },
      { name: "description", content: "Premium product from NEXA TRADE MART. Add to cart or order via WhatsApp." },
      { property: "og:url", content: `/product/${params.handle}` },
    ],
    links: [{ rel: "canonical", href: `/product/${params.handle}` }],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { handle } = Route.useParams();
  const { data: product, isLoading } = useProductBySlug(handle);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  if (isLoading) {
    return <div className="container-px mx-auto max-w-7xl py-20 text-center text-muted-foreground">Loading…</div>;
  }
  if (!product) {
    return (
      <div className="container-px mx-auto max-w-7xl py-20 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Link to="/shop" className="mt-4 inline-flex items-center gap-1 text-gold-deep">
          <ChevronLeft className="h-4 w-4" /> Back to shop
        </Link>
      </div>
    );
  }

  const gallery = [product.image_url, ...(product.gallery ?? [])].filter(Boolean) as string[];
  const currentImg = gallery[imgIdx] ?? product.image_url;
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPct = product.discount_pct
    ? product.discount_pct
    : hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  function handleAdd() {
    addItem({
      productId: product!.id,
      name: product!.name,
      slug: product!.slug,
      price: product!.price,
      image_url: product!.image_url,
      stock: product!.stock,
      quantity: qty,
    });
    toast.success("Added to cart", { description: product!.name });
  }

  const waMsg = `Hi NEXA TRADE MART, I'd like to order:\n\n• ${product.name}\n• Qty: ${qty}\n• Price: ${formatZAR(product.price)} each\n• Total: ${formatZAR(product.price * qty)}\n\nMy details:\nName:\nPhone:\nDelivery Address:\nNotes:`;

  return (
    <div className="container-px mx-auto max-w-7xl py-10 sm:py-14">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gold-deep">
        <ChevronLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="mt-6 grid lg:grid-cols-2 gap-10">
        <div>
          <div className="relative rounded-3xl overflow-hidden bg-secondary aspect-square border">
            {currentImg ? (
              <img src={currentImg} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
            )}
            {discountPct > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-destructive text-destructive-foreground font-bold text-sm">
                -{discountPct}% OFF
              </span>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {gallery.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`aspect-square rounded-lg overflow-hidden border ${i === imgIdx ? "border-gold ring-2 ring-gold/40" : "border-border"}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.category?.name && (
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">{product.category.name}</div>
          )}
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-1 text-gold">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
            <span className="text-xs text-muted-foreground ml-2">
              {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold">{formatZAR(product.price)}</span>
            {hasDiscount && (
              <>
                <span className="text-base text-muted-foreground line-through">{formatZAR(product.compare_at_price!)}</span>
                <span className="text-xs font-bold text-destructive">
                  Save {formatZAR(product.compare_at_price! - product.price)}
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="mt-5 text-sm text-muted-foreground whitespace-pre-line">{product.description}</p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Qty</label>
            <div className="inline-flex items-center border rounded-lg">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="h-10 w-10 hover:bg-muted">−</button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="h-10 w-10 hover:bg-muted">+</button>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="h-12 rounded-lg gradient-gold text-ink font-bold inline-flex items-center justify-center gap-2 shadow-gold disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" />
              Add to Cart
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`}
              target="_blank"
              rel="noreferrer"
              className="h-12 rounded-lg bg-[#25D366] text-white font-bold inline-flex items-center justify-center gap-2 hover:opacity-95"
            >
              <MessageCircle className="h-4 w-4" /> Order on WhatsApp
            </a>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              { Icon: Truck, t: "Local delivery" },
              { Icon: ShieldCheck, t: "Safe checkout" },
              { Icon: Gift, t: "Loyalty rewards" },
            ].map(({ Icon, t }, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-3">
                <Icon className="mx-auto h-5 w-5 text-gold-deep" />
                <div className="mt-1 text-[11px] text-muted-foreground">{t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
