import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://nexa-trade-mart.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  lastmod?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/shop", changefreq: "daily", priority: "0.9" },
          { path: "/categories", changefreq: "weekly", priority: "0.8" },
          { path: "/promotions", changefreq: "daily", priority: "0.8" },
          { path: "/about", changefreq: "monthly", priority: "0.6" },
          { path: "/contact", changefreq: "monthly", priority: "0.6" },
          { path: "/faq", changefreq: "monthly", priority: "0.5" },
          { path: "/support", changefreq: "monthly", priority: "0.5" },
          { path: "/whatsapp-orders", changefreq: "monthly", priority: "0.5" },
        ];

        // Dynamic products & categories from Supabase
        try {
          const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
          const supabaseKey =
            process.env.SUPABASE_PUBLISHABLE_KEY ||
            process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
            process.env.SUPABASE_ANON_KEY;
          if (supabaseUrl && supabaseKey) {
            const [productsRes, categoriesRes] = await Promise.all([
              fetch(
                `${supabaseUrl}/rest/v1/products?select=slug,updated_at&is_active=eq.true`,
                { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } },
              ),
              fetch(
                `${supabaseUrl}/rest/v1/categories?select=slug&is_active=eq.true`,
                { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } },
              ),
            ]);
            if (productsRes.ok) {
              const products = (await productsRes.json()) as Array<{ slug: string; updated_at?: string }>;
              for (const p of products) {
                entries.push({
                  path: `/product/${p.slug}`,
                  changefreq: "weekly",
                  priority: "0.7",
                  lastmod: p.updated_at ? new Date(p.updated_at).toISOString() : undefined,
                });
              }
            }
            if (categoriesRes.ok) {
              const cats = (await categoriesRes.json()) as Array<{ slug: string }>;
              for (const c of cats) {
                entries.push({ path: `/shop?category=${c.slug}`, changefreq: "weekly", priority: "0.6" });
              }
            }
          }
        } catch {
          // fall back to static entries silently
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=1800",
          },
        });
      },
    },
  },
});
