import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — NEXA TRADE MART" },
      { name: "description", content: "Answers to common questions about ordering, delivery, payment, returns and rewards at NEXA TRADE MART." },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: FAQ,
});

const faqs = [
  { q: "How do I place an order?", a: "Add items to your cart and check out securely via Shopify, or message us on WhatsApp using the WhatsApp Order button on any product." },
  { q: "Which areas do you deliver to?", a: "We deliver across Port Elizabeth / Gqeberha. Outside the metro, contact us on WhatsApp for arrangements and quotes." },
  { q: "What payment methods do you accept?", a: "Secure card payments via Shopify checkout, plus EFT and WhatsApp payment confirmation for WhatsApp orders." },
  { q: "How long does delivery take?", a: "Most local orders are delivered within 1–3 business days. You'll receive updates via WhatsApp." },
  { q: "Do you offer returns?", a: "Yes — defective or incorrect items can be returned within 7 days of delivery. Contact support to start the process." },
  { q: "How do loyalty rewards work?", a: "Every order earns rewards. Refer 5 friends and family for vouchers and free gifts. Top shoppers win monthly giveaways." },
  { q: "Are my payments safe?", a: "Yes. Card checkout is processed by Shopify with full encryption. We never store your card details." },
  { q: "Where are you located?", a: "Port Elizabeth / Gqeberha, South Africa. A physical store is part of our future expansion plans." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="container-px mx-auto max-w-3xl py-14">
      <div className="text-center">
        <span className="text-[11px] uppercase tracking-[0.4em] text-gold-deep">Help Center</span>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Frequently Asked Questions</h1>
      </div>
      <div className="mt-10 space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
              <span className="font-semibold">{f.q}</span>
              <ChevronDown className={`h-5 w-5 text-gold-deep transition ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && <div className="px-5 pb-5 text-sm text-muted-foreground">{f.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
