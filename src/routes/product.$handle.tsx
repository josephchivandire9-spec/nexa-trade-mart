import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ShoppingBag, MessageCircle, Star, Loader2, ShieldCheck, Truck, Gift } from "lucide-react";
import { useProductByHandle } from "@/hooks/useProducts";
import { formatZAR, WHATSAPP_NUMBER } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

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
  const { data: product, isLoading } = useProductByHandle(handle);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const cartLoading = useCartStore((s) => s.isLoading);

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

  const variants = product.variants.edges.map((e: { node: { id: string; title: string; price: { amount: string; currencyCode: string }; compareAtPrice?: { amount: string } | null; availableForSale: boolean; selectedOptions: Array<{ name: string; value: string }> } }) => e.node);
  const selectedVariant = variants.find((v: { id: string }) => v.id === variantId) ?? variants[0];
  const images = product.images.edges.map((e: { node: { url: string; altText: string | null } }) => e.node);
  const compareAt = selectedVariant.compareAtPrice?.amount;
  const hasDiscount = compareAt && parseFloat(compareAt) > parseFloat(selectedVariant.price.amount);
  const discountPct = hasDiscount
    ? Math.round(((parseFloat(compareAt!) - parseFloat(selectedVariant.price.amount)) / parseFloat(compareAt!)) * 100)
    : 0;

  async function handleAdd() {
    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: qty,
      selectedOptions: selectedVariant.selectedOptions || [],
    });
    toast.success("Added to cart", { description: product.title });
  }

  const waMsg = `Hi NEXA TRADE MART, I'd like to order:\n\n• ${product.title}\n• Variant: ${selectedVariant.title}\n• Qty: ${qty}\n• Price: ${formatZAR(selectedVariant.price.amount)} each\n• Total: ${formatZAR(parseFloat(selectedVariant.price.amount) * qty)}\n\nMy details:\nName:\nPhone:\nDelivery Address:\nDelivery or Pickup?:\nNotes:`;

  return (
    <div className="container-px mx-auto max-w-7xl py-10 sm:py-14">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gold-deep">
        <ChevronLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="mt-6 grid lg:grid-cols-2 gap-10">
        <div>
          <div className="relative rounded-3xl overflow-hidden bg-secondary aspect-square border">
            {images[imgIdx] && (
              <img src={images[imgIdx].url} alt={images[imgIdx].altText ?? product.title} className="w-full h-full object-cover" />
            )}
            {hasDiscount && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-destructive text-destructive-foreground font-bold text-sm">
                -{discountPct}% OFF
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((img: { url: string; altText: string | null }, i: number) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`aspect-square rounded-lg overflow-hidden border ${i === imgIdx ? "border-gold ring-2 ring-gold/40" : "border-border"}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">{product.productType}</div>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">{product.title}</h1>
          <div className="mt-2 flex items-center gap-1 text-gold">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
            <span className="text-xs text-muted-foreground ml-2">No reviews yet</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold">{formatZAR(selectedVariant.price.amount)}</span>
            {hasDiscount && <span className="text-base text-muted-foreground line-through">{formatZAR(compareAt!)}</span>}
            {hasDiscount && <span className="text-xs font-bold text-destructive">Save {formatZAR(parseFloat(compareAt!) - parseFloat(selectedVariant.price.amount))}</span>}
          </div>

          <p className="mt-5 text-sm text-muted-foreground whitespace-pre-line">{product.description}</p>

          {variants.length > 1 && (
            <div className="mt-6">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Choose Option</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {variants.map((v: { id: string; title: string; availableForSale: boolean }) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantId(v.id)}
                    disabled={!v.availableForSale}
                    className={`px-4 h-10 rounded-lg border text-sm transition ${
                      selectedVariant.id === v.id ? "bg-ink text-white border-ink" : "border-border hover:border-gold hover:text-gold-deep"
                    } disabled:opacity-40`}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            </div>
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
              disabled={cartLoading || !selectedVariant.availableForSale}
              className="h-12 rounded-lg gradient-gold text-ink font-bold inline-flex items-center justify-center gap-2 shadow-gold disabled:opacity-50"
            >
              {cartLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
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
