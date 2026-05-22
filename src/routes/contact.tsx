import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Mail, Phone, MapPin, MessageCircle, Clock, Send } from "lucide-react";
import { WHATSAPP_NUMBER, WHATSAPP_DISPLAY, SUPPORT_EMAIL, SUPPORT_PHONE, buildWhatsAppOrderLink } from "@/lib/shopify";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — NEXA TRADE MART" },
      { name: "description", content: "Reach NEXA TRADE MART by WhatsApp, email or phone. We're here to help during working hours." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(7).max(20),
  message: z.string().trim().min(1).max(1000),
});

function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      toast.error("Please fill all fields correctly.");
      return;
    }
    const msg = `New enquiry from NEXA website:\n\nName: ${form.name}\nPhone: ${form.phone}\n\nMessage:\n${form.message}`;
    window.open(buildWhatsAppOrderLink(msg), "_blank");
    toast.success("Opening WhatsApp…");
  }

  return (
    <div className="container-px mx-auto max-w-7xl py-14">
      <div className="text-center">
        <span className="text-[11px] uppercase tracking-[0.4em] text-gold-deep">Reach out</span>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Contact Us</h1>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Questions, orders or feedback — we'd love to hear from you.</p>
      </div>

      <div className="mt-12 grid lg:grid-cols-[1fr_1.2fr] gap-8">
        <div className="space-y-4">
          {[
            { Icon: MessageCircle, t: "WhatsApp", d: WHATSAPP_DISPLAY, href: `https://wa.me/${WHATSAPP_NUMBER}` },
            { Icon: Phone, t: "Support Call Line", d: SUPPORT_PHONE, href: `tel:${SUPPORT_PHONE}` },
            { Icon: Mail, t: "Email", d: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` },
            { Icon: MapPin, t: "Location", d: "Port Elizabeth / Gqeberha, ZA" },
            { Icon: Clock, t: "Hours", d: "Mon – Sat · 08:00 – 18:00" },
          ].map((c, i) => {
            const Wrap = c.href ? "a" : "div";
            return (
              <Wrap key={i} {...(c.href ? { href: c.href, target: "_blank", rel: "noreferrer" } : {})} className="block rounded-2xl border border-border bg-card p-5 card-hover">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg gradient-gold text-ink inline-flex items-center justify-center"><c.Icon className="h-5 w-5" /></div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.t}</div>
                    <div className="font-medium mt-0.5">{c.d}</div>
                  </div>
                </div>
              </Wrap>
            );
          })}
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
          <h2 className="font-display text-2xl">Send us a message</h2>
          <p className="text-sm text-muted-foreground">Submitting opens a pre-filled WhatsApp message to our team.</p>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Full name</label>
            <input maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full h-11 rounded-lg border bg-background px-3" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Phone</label>
            <input maxLength={20} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full h-11 rounded-lg border bg-background px-3" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Message</label>
            <textarea maxLength={1000} rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-1 w-full rounded-lg border bg-background p-3" />
          </div>
          <button className="w-full h-12 rounded-lg gradient-gold text-ink font-bold inline-flex items-center justify-center gap-2 shadow-gold">
            <Send className="h-4 w-4" /> Send via WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
}
