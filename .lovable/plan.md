
# NEXA TRADE MART — Bug fixes & professional upgrades

Only fixes and additive upgrades. No feature removal, no rebuild.

## 1. Product editing (critical)

The editor form code is correct — it already calls `UPDATE ... WHERE id = form.id`. The most likely cause of "can't edit existing products" is either an RLS policy gap on UPDATE/DELETE or a silent failure on the storage upload.

Actions:
- Migration: audit and (re)create RLS policies on `public.products` so admins (`has_role(auth.uid(), 'admin')`) can `UPDATE` and `DELETE`. Same audit for `storage.objects` under the `store-media/products/` prefix.
- Add clearer error surfacing in `ProductEditor.save()` — log `error.code`, `error.message`, and `error.details` to a toast so future failures are visible.
- Add an explicit "Delete product" button inside the editor (currently only on the list row).
- Verify by editing a real product end-to-end after the migration.

## 2. NEXA AI assistant "Failed to fetch"

`src/lib/ai-assistant.functions.ts` uses raw fetch against the AI gateway. Failure is most likely 402 (credits) or a transient network error surfaced as generic "Failed to fetch".

Actions:
- Rewrite the server fn to use the Lovable AI SDK gateway helper (`createLovableAiGatewayProvider` in `src/lib/ai-gateway.server.ts`) with `google/gemini-3-flash-preview`. Map 429/402 to friendly messages.
- In `AIAssistant.tsx`: add one automatic retry with backoff, a persistent typing indicator, and when a call fails twice show inline **Contact Support** and **WhatsApp Support** buttons (open `contact_messages` escalation form / `wa.me` link).
- Verify `LOVABLE_API_KEY` is present (already listed in secrets).

## 3. Floating buttons overlap bottom nav

`WhatsAppFab` uses `bottom-5` and `AIAssistant` FAB uses `bottom-24` — both sit under the mobile bottom nav (56 px + safe-area).

Actions:
- Bump on mobile: WhatsApp `bottom-20 lg:bottom-5`, AI FAB `bottom-36 lg:bottom-24`, both including `pb-[env(safe-area-inset-bottom)]` clearance.
- Add `lg:pb-0` reset on `<main>` so desktop is unchanged.

## 4. International phone number input

Actions:
- Add `libphonenumber-js` and build a small `<PhoneInput>` component: country selector (flag + name + dial code) + national number input, output as E.164 string.
- Use it in: `OrderModal`, `/account` profile, `/account/addresses`, `/contact`, and admin customer edit.
- Migration: no schema change (`phone TEXT` already stores strings); backfill nothing — new entries save E.164.

## 5. WhatsApp notifications use stored international number

Actions:
- In `admin.orders.tsx` and `admin.customers.*`, add a "Notify on WhatsApp" button that opens `https://wa.me/<digits-only from stored E.164>?text=...` with an order-status template.
- Guard: if a legacy customer's phone isn't E.164, prompt admin to update it via the new PhoneInput before sending.

## 6. Dynamic social media manager

Actions:
- Migration: `public.social_links(id, platform, label, url, icon, sort_order, is_enabled)` + GRANTs + RLS (`SELECT` public for enabled, admin manages).
- New admin page `/admin/social` with add/edit/delete/reorder/toggle.
- `Footer.tsx` fetches from `social_links` where `is_enabled = true` and renders icons (lucide + fallback generic link icon).

## 7. Payment method scaffolding

Actions:
- Extend the order flow (`OrderModal` → `placeOrder`): add radio group **Pay Online / Cash on Delivery / Store Pickup**.
- Migration: add `payment_method` (`'online'|'cod'|'pickup'`) and `payment_status` (`'pending'|'cash_pending'|'awaiting_pickup'|'paid'|'failed'`) and `payment_reference TEXT` on `orders`.
- Server fn sets `payment_status` based on method (`cod → cash_pending`, `pickup → awaiting_pickup`, `online → pending`).
- Online provider integration is out of scope for this turn — leave a clearly-marked TODO and a placeholder confirmation screen. Ask the user which provider (PayFast / Peach / Stripe) after this batch lands.
- Admin orders table shows the new fields with color chips.

## 8. Mobile polish

Actions:
- Add bottom padding (`pb-24 lg:pb-6`) to primary scroll containers (account, admin, shop) so content isn't hidden under the nav.
- Audit `AdminLayout` sidebar to collapse cleanly on <lg (already partly done).
- Ensure product grid uses `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` and buttons wrap.

## 9. Final QA

Manual pass in preview after each group (product edit, AI, FAB position, phone input, social manager, payment radios). Report the checks with screenshots via Playwright before ending.

## Technical notes

- Migrations touched: `products` RLS audit, new `social_links` table, `orders` payment columns.
- New deps: `libphonenumber-js` (small, edge-safe).
- New files: `src/components/PhoneInput.tsx`, `src/lib/ai-gateway.server.ts`, `src/routes/admin.social.tsx`, `src/hooks/useSocialLinks.ts`.
- Files edited: `admin.products.tsx`, `ai-assistant.functions.ts`, `AIAssistant.tsx`, `WhatsAppFab.tsx`, `BottomNav.tsx` (unchanged), `Footer.tsx`, `OrderModal.tsx`, `orders.functions.ts`, `admin.orders.tsx`, profile/address/contact routes.
- Nothing removed; all existing features preserved.

## One open question

For **Pay Online**, do you want me to wire up **PayFast** (best for ZA), **Peach Payments**, or **Stripe** in the next batch? This turn only scaffolds the method selection.
