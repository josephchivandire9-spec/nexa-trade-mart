import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatZAR } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

export const Route = createFileRoute("/account/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — NEXA TRADE MART" }, { name: "robots", content: "noindex" }] }),
  component: WishlistPage,
});

const KEY = "ntm-wishlist";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function writeIds(ids: string[]) { localStorage.setItem(KEY, JSON.stringify(ids)); }

interface P { id: string; name: string; slug: string; price: number; image_url: string | null; stock: number }

function WishlistPage() {
  const [items, setItems] = useState<P[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const ids = readIds();
    if (ids.length === 0) { setLoading(false); return; }
    supabase.from("products").select("id,name,slug,price,image_url,stock").in("id", ids)
      .then(({ data }) => { setItems((data as P[]) ?? []); setLoading(false); });
  }, []);

  function remove(id: string) {
    const next = readIds().filter((x) => x !== id);
    writeIds(next);
    setItems((items) => items.filter((i) => i.id !== id));
    toast.success("Removed from wishlist");
  }

  function toCart(p: P) {
    addItem({ productId: p.id, name: p.name, slug: p.slug, price: Number(p.price), image_url: p.image_url, stock: p.stock });
    toast.success("Added to cart");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-6 shadow-premium">
        <h1 className="font-display text-2xl flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-500" /> My Wishlist
        </h1>
        <p className="text-sm text-muted-foreground">Items you've saved for later.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card p-3 animate-pulse">
              <div className="aspect-square bg-muted rounded-xl" />
              <div className="h-3 bg-muted rounded mt-3 w-3/4" />
              <div className="h-3 bg-muted rounded mt-2 w-1/2" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-3 font-display text-xl">Your wishlist is empty</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any product to save it here.</p>
          <Link to="/shop" className="mt-4 inline-flex h-10 px-5 rounded-lg gradient-gold text-ink font-bold items-center text-sm">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((p) => (
            <div key={p.id} className="group rounded-2xl border bg-card p-3 card-hover flex flex-col">
              <Link to="/product/$handle" params={{ handle: p.slug }} className="block relative aspect-square rounded-xl overflow-hidden bg-muted">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-muted-foreground text-xs">No image</div>
                )}
                <button onClick={(e) => { e.preventDefault(); remove(p.id); }}
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/90 hover:bg-destructive hover:text-white grid place-items-center transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </Link>
              <div className="mt-3 flex-1 min-w-0">
                <div className="text-sm font-semibold line-clamp-2">{p.name}</div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="font-display text-base">{formatZAR(Number(p.price))}</div>
                  <span className={`text-[10px] uppercase tracking-widest ${p.stock > 0 ? "text-emerald-600" : "text-destructive"}`}>
                    {p.stock > 0 ? "In stock" : "Out"}
                  </span>
                </div>
              </div>
              <button onClick={() => toCart(p)} disabled={p.stock === 0}
                className="mt-3 h-9 rounded-lg gradient-gold text-ink font-bold inline-flex items-center justify-center gap-1.5 text-xs disabled:opacity-50">
                <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
