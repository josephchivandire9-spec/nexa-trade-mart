import { createFileRoute } from "@tanstack/react-router";
import { Award, Target, Eye, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Nexa Trade Mart — Online Shopping in South Africa" },
      { name: "description", content: "Nexa Trade Mart is an online shopping platform in South Africa founded by Thulani Joseph Chivandire (TJC), offering electronics, clothing, shoes, beauty, home & living, phones and accessories." },
      { property: "og:title", content: "About Nexa Trade Mart" },
      { property: "og:description", content: "Learn about Nexa Trade Mart, our founder Thulani Joseph Chivandire (TJC), our mission and our online store serving South Africa." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          url: "https://nexa-trade-mart.lovable.app/about",
          name: "About Nexa Trade Mart",
          description:
            "Nexa Trade Mart is an online shopping platform in South Africa offering electronics, clothing, shoes, beauty products, home & living, phones and accessories.",
          about: {
            "@type": "Organization",
            name: "Nexa Trade Mart",
            founder: { "@type": "Person", name: "Thulani Joseph Chivandire", alternateName: "TJC", jobTitle: "Founder & CEO" },
            url: "https://nexa-trade-mart.lovable.app",
          },
        }),
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div>
      <section className="bg-ink-radial text-white">
        <div className="container-px mx-auto max-w-7xl py-16 sm:py-24 text-center">
          <span className="text-[11px] uppercase tracking-[0.4em] text-gold">Our Story</span>
          <h1 className="mt-3 font-display text-4xl sm:text-6xl text-gradient-gold">About NEXA TRADE MART</h1>
          <p className="mt-5 max-w-3xl mx-auto text-white/75 text-lg leading-relaxed">
            NEXA TRADE MART is a trusted retail business focused on providing affordable quality products and
            rewarding loyal customers. We believe shopping should be affordable, reliable, and rewarding for everyone.
          </p>
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-16 grid md:grid-cols-2 gap-6">
        {[
          { Icon: Target, t: "Our Mission", d: "Make premium retail accessible to every household in South Africa through quality products, fair prices and rewarding experiences." },
          { Icon: Eye, t: "Our Vision", d: "Become the most trusted local online retailer in the Eastern Cape — known for value, integrity and loyalty." },
          { Icon: Award, t: "Customer Trust", d: "Verified products, transparent pricing, real human support, and a community we genuinely care about." },
          { Icon: TrendingUp, t: "Future Growth", d: "Expanding into a physical store, full delivery network, loyalty app and broader product lines — built with our customers in mind." },
        ].map((b, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-7 card-hover">
            <div className="h-12 w-12 rounded-xl gradient-gold text-ink inline-flex items-center justify-center">
              <b.Icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-2xl">{b.t}</h3>
            <p className="mt-2 text-muted-foreground">{b.d}</p>
          </div>
        ))}
      </section>

      <section className="bg-secondary/50">
        <div className="container-px mx-auto max-w-5xl py-16 text-center">
          <h2 className="font-display text-3xl">Built in Port Elizabeth / Gqeberha</h2>
          <p className="mt-3 text-muted-foreground">
            From WhatsApp orders and Facebook Marketplace to a growing online storefront — NEXA TRADE MART is built
            for the community, by the community.
          </p>
        </div>
      </section>
    </div>
  );
}
