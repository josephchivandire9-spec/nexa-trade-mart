import { Link } from "@tanstack/react-router";
import { Facebook, MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { Logo } from "./Logo";
import { WHATSAPP_DISPLAY, WHATSAPP_NUMBER, SUPPORT_EMAIL, SUPPORT_PHONE, CATEGORIES } from "@/lib/shopify";

export function Footer() {
  return (
    <footer className="bg-ink text-white/80 mt-20">
      <div className="border-t border-gold/30">
        <div className="container-px mx-auto max-w-7xl py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo className="h-14 w-auto mb-4" />
            <p className="text-sm text-white/65 max-w-xs">
              A trusted retail business in Port Elizabeth / Gqeberha — affordable quality, rewarding loyalty,
              and shopping you can trust.
            </p>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-gold hover:text-gold-soft"
            >
              <Facebook className="h-4 w-4" /> Follow on Facebook
            </a>
          </div>

          <div>
            <h4 className="text-gold uppercase tracking-widest text-xs mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link to="/shop" search={{ category: c.slug }} className="hover:text-gold">
                    {c.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/promotions" className="hover:text-gold">
                  Promotions & Rewards
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-gold uppercase tracking-widest text-xs mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-gold">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-gold">FAQ</Link></li>
              <li><Link to="/support" className="hover:text-gold">Help Center</Link></li>
              <li><Link to="/support" className="hover:text-gold">Report Fraud</Link></li>
              <li><Link to="/support" className="hover:text-gold">Trust & Safety</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gold uppercase tracking-widest text-xs mb-4">Reach Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2"><MapPin className="h-4 w-4 text-gold mt-0.5" /> Port Elizabeth / Gqeberha, South Africa</li>
              <li className="flex gap-2"><Mail className="h-4 w-4 text-gold mt-0.5" /> <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-gold">{SUPPORT_EMAIL}</a></li>
              <li className="flex gap-2"><MessageCircle className="h-4 w-4 text-gold mt-0.5" /> <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="hover:text-gold">WhatsApp {WHATSAPP_DISPLAY}</a></li>
              <li className="flex gap-2"><Phone className="h-4 w-4 text-gold mt-0.5" /> Support: {SUPPORT_PHONE}</li>
              <li className="flex gap-2"><Clock className="h-4 w-4 text-gold mt-0.5" /> Mon – Sat · 08:00 – 18:00</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 py-6">
          <div className="container-px mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
            <span>© {new Date().getFullYear()} NEXA TRADE MART. All rights reserved.</span>
            <span className="tracking-[0.3em] uppercase text-gold/70">Shop More · Save More · Get Rewarded</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
