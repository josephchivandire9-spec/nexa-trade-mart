// Renamed in purpose but kept filename for compatibility.
// Storefront constants + product types for the dynamic (Supabase-backed) catalog.

export const WHATSAPP_NUMBER = "27684963972";
export const WHATSAPP_DISPLAY = "+27 68 496 3972";
export const SUPPORT_PHONE = "065 619 1335";
export const SUPPORT_EMAIL = "nexatrademart@gmail.com";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand?: string | null;
  price: number;
  compare_at_price: number | null;
  discount_pct: number | null;
  image_url: string | null;
  gallery: string[] | null;
  category_id: string | null;
  category?: { name: string; slug: string } | null;
  colours?: string[] | null;
  sizes?: string[] | null;
  specifications?: unknown[] | null;
  delivery_info?: string | null;
  stock: number;
  sku: string | null;
  is_active: boolean;
  is_featured: boolean;
}

export function formatZAR(amount: number | string | null | undefined) {
  const n = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  return `R${(n || 0).toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function buildWhatsAppOrderLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Fallback static category info (used until DB categories load) — also used by Header chips.
export const CATEGORIES = [
  { slug: "clothing", title: "Clothing", blurb: "Premium fashion & everyday wear" },
  { slug: "shoes", title: "Shoes & Footwear", blurb: "Sneakers, formal & lifestyle" },
  { slug: "electronics", title: "Electronics", blurb: "TVs, audio, gaming & more" },
  { slug: "cellphones", title: "Phones & Accessories", blurb: "Smartphones, watches, audio" },
  { slug: "household", title: "Household", blurb: "Kitchen, decor & essentials" },
  { slug: "beauty", title: "Beauty & Essentials", blurb: "Skincare, fragrance & care" },
] as const;
