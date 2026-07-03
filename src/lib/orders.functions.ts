import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const itemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(999),
});

const inputSchema = z.object({
  customer_name: z.string().trim().min(1).max(120),
  customer_phone: z.string().trim().min(7).max(30),
  customer_address: z.string().trim().min(1).max(300),
  notes: z.string().trim().max(500).optional().nullable(),
  fulfillment: z.enum(["delivery", "pickup"]),
  payment_method: z.enum(["online", "cod", "pickup"]).default("cod"),
  source: z.string().trim().max(40).default("whatsapp"),
  items: z.array(itemSchema).min(1).max(50),
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((d) => inputSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getRequestHeader } = await import("@tanstack/react-start/server");

    let customerId: string | null = null;
    try {
      const auth = getRequestHeader("authorization");
      const token = auth?.toLowerCase().startsWith("bearer ") ? auth.slice(7) : null;
      if (token) {
        const { data: userData } = await supabaseAdmin.auth.getUser(token);
        if (userData?.user) customerId = userData.user.id;
      }
    } catch {
      // guest checkout
    }


    const ids = Array.from(new Set(data.items.map((i) => i.product_id)));
    const { data: products, error: prodErr } = await supabaseAdmin
      .from("products")
      .select("id, name, price, is_active")
      .in("id", ids);
    if (prodErr) throw new Error("Could not validate products");
    if (!products || products.length !== ids.length) {
      throw new Error("One or more products are unavailable");
    }

    const priceMap = new Map(products.map((p) => [p.id, p]));
    const orderItems = data.items.map((i) => {
      const p = priceMap.get(i.product_id)!;
      if (!p.is_active) throw new Error(`Product "${p.name}" is no longer available`);
      const price = Number(p.price);
      return {
        product_id: p.id,
        name: p.name,
        price,
        quantity: i.quantity,
        line_total: price * i.quantity,
      };
    });
    const subtotal = orderItems.reduce((s, i) => s + i.line_total, 0);

    const { data: inserted, error } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_address: data.fulfillment === "delivery" ? data.customer_address : "Pickup in-store",
        notes: data.notes || null,
        items: orderItems,
        subtotal,
        total: subtotal,
        source: data.source,
        customer_id: customerId,
        payment_method: data.payment_method,
        payment_status:
          data.payment_method === "online" ? "pending"
          : data.payment_method === "cod" ? "cash_pending"
          : "awaiting_pickup",
      })
      .select("id")
      .single();
    if (error) throw new Error("Could not save order");

    return {
      id: inserted.id,
      items: orderItems,
      subtotal,
      total: subtotal,
    };
  });
