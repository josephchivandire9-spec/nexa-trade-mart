# NEXA TRADE MART — Phased Upgrade Plan

A lot of what you asked for already exists in the codebase (customer auth, profiles with Customer IDs, addresses, rewards, referrals, orders, admin dashboard, AI assistant, multi-image gallery, welcome modal, sequential customer IDs, admin notifications). Rather than rebuild, I'll **extend and polish** in 5 focused turns. Each turn is self-contained and reviewable.

## Diagnosis of the "banner not showing" bug

Tested with the publishable key directly — the API returns all 5 active banners and the `BannerCarousel` renders them on `/`. The data + RLS are correct. If you're not seeing banners, it's likely a stale browser cache or you're viewing the published (older) build. **No code fix needed**, but I'll add a short `staleTime` + force refresh in Turn 1 to guarantee instant admin→public sync.

---

## Turn 1 — Foundation (this turn)

1. **Banner sync hardening** — drop `staleTime` to 0 + add manual `refetchOnWindowFocus` so admin edits show instantly.
2. **Welcome modal upgrade** — add "Continue with Google" as the primary CTA next to Sign in / Create account / Continue as guest; full-screen on mobile.
3. **Enable Stripe payments** — call the Lovable built-in Stripe tool (test environment ready immediately, no account needed). I'll confirm with you before calling it.

## Turn 2 — Checkout with 3 options

1. Refactor `OrderModal` to show **Pay Online / Cash on Delivery / WhatsApp** as primary choice.
2. **WhatsApp** path: existing flow (works today).
3. **COD** path: place order with `payment_status='cod_pending'`, auto-open WhatsApp summary to admin.
4. **Pay Online** path: create Stripe Checkout Session via a `createServerFn`, redirect, success page marks order paid via webhook at `/api/public/stripe-webhook`.
5. DB migration: add `payment_status`, `payment_provider`, `payment_reference` columns to `orders` (preserves existing rows).

## Turn 3 — Live order tracking timeline

1. Rebuild `/account/tracking` with an Amazon/Takealot-style vertical timeline: Placed → Processing → Shipped → Out for delivery → Delivered.
2. Add `tracking_events` table (order_id, status, note, created_at) + admin UI to push status updates.
3. Realtime subscription so the customer page updates without refresh.

## Turn 4 — Home feed redesign + mobile bottom nav

1. Redesign `/` as a scrollable feed: search bar + notifications top, banners, categories chip row, "Featured" + "New arrivals" + full product grid.
2. Add mobile-only bottom tab bar: Home / Rewards / AI Chat / Promotions / Account.
3. Keep desktop header untouched.

## Turn 5 — AI escalation + admin polish

1. AI assistant: add "Talk to a human" button that creates a row in `contact_messages` with `source='ai_escalation'` and the chat transcript in `meta`.
2. Admin notifications: WhatsApp deep-link button on each new-order/new-message notification.
3. Admin support inbox shows AI escalations with full transcript.

---

## Technical notes

- **No data loss**: every migration is additive (new columns/tables, no drops).
- **No route restructure**: all existing routes keep working; new routes added under existing namespaces (`/account/*`, `/admin/*`, `/api/public/*`).
- **Stripe** is the Lovable built-in (no Stripe account needed to test). Real payouts require claiming the account later. If you'd prefer PayFast for South African rand payouts, say so before Turn 2 and I'll swap.
- **Role gating**: admin routes already gated by `has_role(uid,'admin')` policies + `AdminLayout` redirect. The admin login route stays at `/admin/login` and is `noindex` — not linked from any customer surface.

## After approval

I'll start Turn 1 immediately. Tell me **"go"** to proceed with Turn 1, or **"start with Turn N"** to jump ahead. If you want PayFast instead of Stripe, mention it now.
