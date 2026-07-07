import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MessageCircle, MapPin, Loader2, Send } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { WHATSAPP_NUMBER, SUPPORT_EMAIL, SUPPORT_PHONE } from "@/lib/shopify";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Nexa Trade Mart — WhatsApp, Phone & Email Support" },
      { name: "description", content: "Get in touch with Nexa Trade Mart in South Africa. Reach us fast via WhatsApp, phone or email for orders, delivery and product support." },
      { property: "og:title", content: "Contact Nexa Trade Mart" },
      { property: "og:description", content: "WhatsApp, phone and email support for Nexa Trade Mart customers across South Africa." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          url: "https://nexa-trade-mart.lovable.app/contact",
          name: "Contact Nexa Trade Mart",
          mainEntity: {
            "@type": "Organization",
            name: "Nexa Trade Mart",
            email: "nexatrademart@gmail.com",
            telephone: "+27684963972",
            url: "https://nexa-trade-mart.lovable.app",
            contactPoint: [
              {
                "@type": "ContactPoint",
                telephone: "+27684963972",
                contactType: "customer service",
                areaServed: "ZA",
                availableLanguage: ["English"],
              },
            ],
          },
        }),
      },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(1).max(2000),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      return toast.error(parsed.error.issues[0].message);
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        subject: parsed.data.subject || null,
        message: parsed.data.message,
      });
      if (error) throw error;
      toast.success("Message sent! We'll get back to you shortly.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send message");
    } finally {
      setSubmitting(false);
    }
  }

  const input = "w-full h-11 rounded-lg border bg-background px-3 text-sm outline-none focus:border-gold";

  return (
    <div className="container-px mx-auto max-w-5xl py-12 sm:py-16">
      <div className="text-center">
        <span className="text-[11px] uppercase tracking-[0.4em] text-gold-deep">Get In Touch</span>
        <h1 className="mt-2 font-display text-4xl">We're here to help</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
          Reach out by WhatsApp for the fastest response, or send us a message below.
        </p>
      </div>

      <div className="mt-10 grid lg:grid-cols-[1fr_1fr] gap-8">
        <form onSubmit={submit} className="rounded-2xl border bg-card p-6 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Your name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
            <input type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} />
            <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={input} />
          </div>
          <textarea
            placeholder="Your message *"
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <button disabled={submitting} className="w-full h-11 rounded-lg gradient-gold text-ink font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send Message
          </button>
        </form>

        <div className="space-y-3">
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border bg-card p-5 card-hover">
            <div className="h-12 w-12 rounded-full bg-[#25D366]/15 inline-flex items-center justify-center"><MessageCircle className="h-5 w-5 text-[#25D366]" /></div>
            <div>
              <div className="font-semibold">WhatsApp</div>
              <div className="text-sm text-muted-foreground">Chat with us instantly</div>
            </div>
          </a>
          <a href={`tel:${SUPPORT_PHONE}`} className="flex items-center gap-3 rounded-2xl border bg-card p-5 card-hover">
            <div className="h-12 w-12 rounded-full bg-gold/15 inline-flex items-center justify-center"><Phone className="h-5 w-5 text-gold-deep" /></div>
            <div>
              <div className="font-semibold">{SUPPORT_PHONE}</div>
              <div className="text-sm text-muted-foreground">Call our support line</div>
            </div>
          </a>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-3 rounded-2xl border bg-card p-5 card-hover">
            <div className="h-12 w-12 rounded-full bg-gold/15 inline-flex items-center justify-center"><Mail className="h-5 w-5 text-gold-deep" /></div>
            <div>
              <div className="font-semibold">{SUPPORT_EMAIL}</div>
              <div className="text-sm text-muted-foreground">Email us anytime</div>
            </div>
          </a>
          <div className="flex items-center gap-3 rounded-2xl border bg-card p-5">
            <div className="h-12 w-12 rounded-full bg-gold/15 inline-flex items-center justify-center"><MapPin className="h-5 w-5 text-gold-deep" /></div>
            <div>
              <div className="font-semibold">Port Elizabeth / Gqeberha</div>
              <div className="text-sm text-muted-foreground">Reliable local delivery</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
