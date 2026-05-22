import { useQuery } from "@tanstack/react-query";
import { PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY, ShopifyProduct, storefrontApiRequest } from "@/lib/shopify";

export function useProducts(query?: string, first = 50) {
  return useQuery({
    queryKey: ["products", query ?? "all", first],
    queryFn: async () => {
      const data = await storefrontApiRequest(PRODUCTS_QUERY, { first, query: query ?? null });
      return (data?.data?.products?.edges ?? []) as ShopifyProduct[];
    },
    staleTime: 60_000,
  });
}

export function useProductByHandle(handle: string) {
  return useQuery({
    queryKey: ["product", handle],
    queryFn: async () => {
      const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
      return data?.data?.product ?? null;
    },
    enabled: !!handle,
  });
}
