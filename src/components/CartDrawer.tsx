import { useState } from "react";
import { ShoppingCart, Minus, Plus, Trash2, MessageCircle, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatZAR } from "@/lib/shopify";
import { OrderModal } from "@/components/OrderModal";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative h-10 px-3 inline-flex items-center gap-2 rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-ink transition"
        aria-label="Open cart"
      >
        <ShoppingCart className="h-4 w-4" />
        <span className="text-xs font-semibold">Cart</span>
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-gold text-ink text-[10px] font-bold inline-flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-background text-foreground shadow-2xl flex flex-col">
            <header className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="font-display text-xl">Your Cart</h3>
                <p className="text-xs text-muted-foreground">
                  {totalItems === 0 ? "Empty for now" : `${totalItems} item${totalItems > 1 ? "s" : ""}`}
                </p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="p-2 rounded-full hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mb-3 text-gold/60" />
                  <p>Your cart is empty.</p>
                  <p className="text-xs mt-1">Add premium picks from our shop.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((it) => (
                    <li key={it.productId} className="flex gap-3 border-b pb-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary shrink-0">
                        {it.image_url && (
                          <img src={it.image_url} alt={it.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{it.name}</h4>
                        <p className="text-sm font-semibold mt-1">{formatZAR(it.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(it.productId, it.quantity - 1)}
                            className="h-7 w-7 rounded border inline-flex items-center justify-center hover:bg-muted"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm w-6 text-center">{it.quantity}</span>
                          <button
                            onClick={() => updateQuantity(it.productId, it.quantity + 1)}
                            className="h-7 w-7 rounded border inline-flex items-center justify-center hover:bg-muted"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeItem(it.productId)}
                            className="ml-auto h-7 w-7 inline-flex items-center justify-center text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="p-5 border-t space-y-3 bg-secondary/40">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-display text-xl font-bold">{formatZAR(subtotal)}</span>
                </div>
                <button
                  onClick={() => setOrderOpen(true)}
                  className="w-full h-12 rounded-lg gradient-gold text-ink font-bold inline-flex items-center justify-center gap-2 shadow-gold hover:opacity-95"
                >
                  <MessageCircle className="h-4 w-4" />
                  Checkout via WhatsApp
                </button>
                <p className="text-[11px] text-center text-muted-foreground">
                  Enter your details on the next step — takes under 30 seconds.
                </p>
              </footer>
            )}
          </aside>
        </div>
      )}

      <OrderModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        title="Complete your order"
        items={items.map((i) => ({
          product_id: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        }))}
        onSuccess={() => {
          clearCart();
          setOpen(false);
        }}
      />
    </>
  );
}
