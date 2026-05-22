import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, AlertTriangle, MessageCircle, Mail, Phone, BookOpen } from "lucide-react";
import { WHATSAPP_NUMBER, WHATSAPP_DISPLAY, SUPPORT_EMAIL, SUPPORT_PHONE } from "@/lib/shopify";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Customer Support — NEXA TRADE MART" },
      { name: "description", content: "Help Center, Report Fraud, Customer Protection and Trust & Safety support from NEXA TRADE MART." },
      { property: "og:url", content: "/support" },
    ],
    links: [{ rel: "canonical", href: "/support" }],
  }),
  component: Support,
});

function Support() {
  return (
    <div>
      <section className="bg-ink-radial text-white">
        <div className="container-px mx-auto max-w-7xl py-16 sm:py-20 text-center">
          <span className="text-[11px] uppercase tracking-[0.4em] text-gold">Help · Trust · Safety</span>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl text-gradient-gold">Customer Support</h1>
          <p className="mt-4 max-w-2xl mx-auto text-white/75">
            Reliable, friendly support during working hours. Reach us by WhatsApp, phone or email.
          </p>
        </div>
      </section>

      <section className="container-px mx-auto max-w-7xl py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { Icon: BookOpen, t: "Help Center", d: "Browse FAQs and ordering guides." },
          { Icon: AlertTriangle, t: "Report Fraud", d: "Report suspicious activity or impersonation accounts." },
          { Icon: ShieldCheck, t: "Customer Protection", d: "Your orders are protected with verified delivery." },
          { Icon: ShieldCheck, t: "Trust & Safety", d: "We operate transparently and protect your data." },
        ].map((b, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 card-hover">
            <div className="h-10 w-10 rounded-lg gradient-gold text-ink inline-flex items-center justify-center"><b.Icon className="h-5 w-5" /></div>
            <h3 className="mt-3 font-semibold">{b.t}</h3>
            <p className="text-sm text-muted-foreground mt-1">{b.d}</p>
          </div>
        ))}
      </section>

      <section className="bg-secondary/50">
        <div className="container-px mx-auto max-w-5xl py-14">
          <h2 className="font-display text-3xl text-center">Contact Support</h2>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="rounded-2xl bg-card border p-5 text-center card-hover">
              <MessageCircle className="mx-auto h-6 w-6 text-gold-deep" />
              <div className="mt-2 font-semibold">WhatsApp</div>
              <div className="text-xs text-muted-foreground">{WHATSAPP_DISPLAY}</div>
            </a>
            <a href={`tel:${SUPPORT_PHONE}`} className="rounded-2xl bg-card border p-5 text-center card-hover">
              <Phone className="mx-auto h-6 w-6 text-gold-deep" />
              <div className="mt-2 font-semibold">Call Line</div>
              <div className="text-xs text-muted-foreground">{SUPPORT_PHONE}</div>
            </a>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="rounded-2xl bg-card border p-5 text-center card-hover">
              <Mail className="mx-auto h-6 w-6 text-gold-deep" />
              <div className="mt-2 font-semibold">Email</div>
              <div className="text-xs text-muted-foreground">{SUPPORT_EMAIL}</div>
            </a>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">Support available during working hours · Mon – Sat · 08:00 – 18:00</p>
        </div>
      </section>
    </div>
  );
}
