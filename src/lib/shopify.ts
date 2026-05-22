import { toast } from "sonner";

export const SHOPIFY_API_VERSION = "2025-07";
export const SHOPIFY_STORE_PERMANENT_DOMAIN = "nexa-trade-hub-y8bhk.myshopify.com";
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
export const SHOPIFY_STOREFRONT_TOKEN = "b1a8aa59243693f7cd2636cd3c649e0b";

export const WHATSAPP_NUMBER = "27684963972";
export const WHATSAPP_DISPLAY = "+27 68 496 3972";
export const SUPPORT_PHONE = "065 619 1335";
export const SUPPORT_EMAIL = "nexatrademart@gmail.com";

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    productType: string;
    tags: string[];
    priceRange: {
      minVariantPrice: { amount: string; currencyCode: string };
    };
    compareAtPriceRange?: {
      minVariantPrice: { amount: string; currencyCode: string };
    };
    images: { edges: Array<{ node: { url: string; altText: string | null } }> };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: { amount: string; currencyCode: string };
          compareAtPrice?: { amount: string; currencyCode: string } | null;
          availableForSale: boolean;
          selectedOptions: Array<{ name: string; value: string }>;
        };
      }>;
    };
    options: Array<{ name: string; values: string[] }>;
  };
}

export const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id title description handle productType tags
          priceRange { minVariantPrice { amount currencyCode } }
          compareAtPriceRange { minVariantPrice { amount currencyCode } }
          images(first: 5) { edges { node { url altText } } }
          variants(first: 10) {
            edges {
              node {
                id title
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                availableForSale
                selectedOptions { name value }
              }
            }
          }
          options { name values }
        }
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id title description handle productType tags
      priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount currencyCode } }
      images(first: 8) { edges { node { url altText } } }
      variants(first: 20) {
        edges {
          node {
            id title
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            availableForSale
            selectedOptions { name value }
          }
        }
      }
      options { name values }
    }
  }
`;

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 402) {
    toast.error("Shopify: Payment required", {
      description:
        "Shopify API access requires an active billing plan. Visit https://admin.shopify.com to upgrade.",
    });
    return;
  }

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  if (data.errors) throw new Error(data.errors.map((e: { message: string }) => e.message).join(", "));
  return data;
}

export function formatZAR(amount: string | number, currency = "ZAR") {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  const symbol = currency === "ZAR" ? "R" : currency + " ";
  return `${symbol}${n.toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export const CATEGORIES = [
  { slug: "clothing", title: "Clothing", type: "Clothing", blurb: "Premium fashion & everyday wear" },
  { slug: "shoes", title: "Shoes & Footwear", type: "Shoes", blurb: "Sneakers, formal & lifestyle" },
  { slug: "electronics", title: "Electronics", type: "Electronics", blurb: "TVs, audio, gaming & more" },
  { slug: "phones", title: "Phones & Accessories", type: "Phones", blurb: "Smartphones, watches, audio" },
  { slug: "household", title: "Household", type: "Household", blurb: "Kitchen, decor & essentials" },
  { slug: "beauty", title: "Beauty & Essentials", type: "Beauty", blurb: "Skincare, fragrance & care" },
] as const;

export function buildWhatsAppOrderLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
