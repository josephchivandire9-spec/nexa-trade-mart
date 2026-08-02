import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { getChatModel } from "@/lib/ai/provider.server";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const inputSchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
});

const SYSTEM_PROMPT = `You are NEXA AI, the friendly 24/7 support assistant for NEXA TRADE MART — a premium retail store in Port Elizabeth / Gqeberha, South Africa.

You help customers with:
- How to place an order (browse Shop → Add to Cart → checkout via WhatsApp, or use Order on WhatsApp directly)
- Delivery: local delivery in PE/Gqeberha. Free local delivery on orders over R500. Pickup available.
- Products sold: Clothing, Shoes, Cellphones & Accessories, Electronics, Household, Beauty
- Loyalty: Shop more, save more — vouchers automatically applied, monthly giveaways, Customer of the Month rewards
- Referrals: Invite 5 friends/family to shop with NEXA TRADE MART → get free gifts, discount vouchers and bonus rewards
- Promotions: Buy 5, get a free gift. Hot deals refreshed weekly.
- Business hours: Mon–Sat, 08:00 – 18:00 SAST
- Contact: WhatsApp +27 68 496 3972, Call 065 619 1335, Email nexatrademart@gmail.com
- Trust & safety: secure ordering, trusted seller, customer satisfaction guarantee

RULES:
- Keep replies short, warm, professional. Use plain language.
- NEVER invent product prices, stock levels, or specific products. If asked, say "Please check the Shop page for current pricing and availability."
- If a customer needs human help (refund, complaint, missing order, unique request, anything you don't know), reply EXACTLY with this on its own line at the end of your message:
[ESCALATE]
Then politely tell them: "I'll forward your request to our support team — please share your name and phone number so we can follow up."`;

export const chatWithAssistant = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => inputSchema.parse(d))
  .handler(async ({ data }) => {
    try {
      const { text } = await generateText({
        model: getChatModel(),
        system: SYSTEM_PROMPT,
        messages: data.messages.map((m) => ({ role: m.role, content: m.content })),
      });
      const escalate = /\[ESCALATE\]/i.test(text);
      const clean = text.replace(/\[ESCALATE\]/gi, "").trim();
      return { reply: clean || "I'm here to help — could you rephrase that?", escalate };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/429|rate.?limit/i.test(msg)) throw new Error("Too many messages. Please wait a moment and try again.");
      if (/402|credit|payment/i.test(msg)) throw new Error("Assistant temporarily unavailable — please contact support.");
      throw new Error("Assistant could not respond. Please try again or contact support.");
    }
  });
