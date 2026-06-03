import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
  .inputValidator((d) => inputSchema.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI assistant is not configured.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Too many messages. Please wait a moment and try again.");
      if (res.status === 402) throw new Error("Assistant temporarily unavailable.");
      throw new Error("Assistant could not respond. Please try again.");
    }

    const json = await res.json();
    const content: string = json.choices?.[0]?.message?.content ?? "";
    const escalate = /\[ESCALATE\]/i.test(content);
    const clean = content.replace(/\[ESCALATE\]/gi, "").trim();
    return { reply: clean, escalate };
  });
