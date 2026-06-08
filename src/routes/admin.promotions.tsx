import { createFileRoute, Link } from "@tanstack/react-router";
import { ImageIcon, Megaphone, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin/promotions")({
  component: AdminPromotions,
});

function AdminPromotions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Promotions</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage banners, campaigns, and featured offers.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/admin/banners" className="rounded-2xl border bg-card p-6 hover:shadow-lg transition flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-700 text-white inline-flex items-center justify-center">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="font-display text-lg">Homepage Banners</div>
            <div className="text-xs text-muted-foreground">Create, schedule and reorder hero banners.</div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link to="/admin/products" className="rounded-2xl border bg-card p-6 hover:shadow-lg transition flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white inline-flex items-center justify-center">
            <Megaphone className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="font-display text-lg">Featured Products</div>
            <div className="text-xs text-muted-foreground">Mark products as featured to highlight on the homepage.</div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
