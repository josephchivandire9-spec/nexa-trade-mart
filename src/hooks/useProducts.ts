import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Category } from "@/lib/shopify";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Category[];
    },
    staleTime: 60_000,
  });
}

interface ProductsFilter {
  categorySlug?: string;
  featured?: boolean;
  limit?: number;
}

export function useProducts(filter: ProductsFilter = {}) {
  return useQuery({
    queryKey: ["products", filter],
    queryFn: async (): Promise<Product[]> => {
      let q = supabase
        .from("products")
        .select("*, category:categories(name, slug)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (filter.featured) q = q.eq("is_featured", true);
      if (filter.limit) q = q.limit(filter.limit);
      const { data, error } = await q;
      if (error) throw error;
      let rows = (data ?? []) as unknown as Product[];
      if (filter.categorySlug) {
        rows = rows.filter((r) => r.category?.slug === filter.categorySlug);
      }
      return rows;
    },
    staleTime: 30_000,
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async (): Promise<Product | null> => {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(name, slug)")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Product | null;
    },
    enabled: !!slug,
  });
}
