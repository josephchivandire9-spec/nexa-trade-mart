## Phase 1 — non-destructive upgrade

Keeps current guest WhatsApp checkout, existing admin tools, AI assistant, and styling intact. Adds optional customer accounts, CRM, order lifecycle, fixes banners, and adds admin notifications. Phase 2 (analytics, web push, payments, loyalty) is scoped separately later.

### 1. Fix banners on the homepage (root cause)
The `banners` table has 4 active rows and a `Public view active banners` RLS policy that allows anon SELECT. The homepage never queries it — it renders a hardcoded hero only. Fix:
- Add `useBanners()` hook (TanStack Query, public read via anon client) ordered by `sort_order`, `is_active = true`.
- New `<BannerCarousel />` component: auto-rotating hero slides (image + title + subtitle + CTA), keyboard/swipe nav, falls back gracefully to current static hero when there are zero banners (preserves design).
- Mount above the current hero on `/`; current hero stays as secondary section so no visual regression if banners empty.
- Wire Supabase Realtime on `banners` so changes appear without refresh.
- Verify after deploy that the 4 existing banners render.

### 2. Customer accounts (optional)
- Reuse existing `auth.tsx` page; add `/account` route group: `/account` (profile), `/account/orders` (history).
- Header: when signed in as non-admin → show Account menu (Profile, Orders, Sign out). Admin link only when `isAdmin`. Guests see Sign in link.
- Extend `profiles` table with `phone`, `address` (migration). Auto-create row already handled by `handle_new_user` trigger.
- `OrderModal`: when signed in, prefill name/phone/address from profile; on submit, also persist updates back to profile. Guests continue unchanged.
- `placeOrder` server fn: accept optional `customer_id` from auth context; link order to the profile when present.

### 3. Order lifecycle + CRM
- Migration: add `status` enum (`pending|processing|shipped|delivered|cancelled`) and `payment_status` column to `orders` if missing; add `customer_id uuid references auth.users` (nullable).
- `/account/orders` page: customer sees own orders (RLS: `customer_id = auth.uid()`).
- Admin Orders page: add status dropdown (inline update), filter by status, search by name/phone/order ID.
- New admin page `/admin/customers`: list profiles + order count + lifetime spend; click → detail view with profile, full order history, AI conversation count.

### 4. Admin notifications (in-dashboard + WhatsApp link)
- New `notifications` table (`id, type, title, body, link, is_read, created_at`); RLS admin-only.
- Triggers (DB) insert a notification row on:
  - new `orders` row
  - new `contact_messages` row
  - new `profiles` row (registration)
- AdminLayout: bell icon with unread count (Realtime subscription); dropdown lists recent items, click marks read & navigates.
- For each new order notification, also surface a one-click "Notify on WhatsApp" link (pre-filled `wa.me` message with order summary) — admin clicks to send themselves/customer. No background sending this round.

### 5. AI escalation polish
- Existing escalation already writes to `contact_messages`. Add `priority: 'support_required'` flag and ensure it triggers the admin notification above. No other behavior changes.

### 6. Safety
- Every change additive. No deletions of existing routes/components/policies.
- All new RLS uses `has_role` pattern. New tables include GRANTs.
- All server-side order mutations stay in `orders.functions.ts` with price re-validation.

### Out of scope this round
Web push, email alerts, payment gateways, loyalty engine, delivery tracking, analytics dashboard, mobile app. Tee'd up for Phase 2.

### Technical file map
- New: `src/hooks/useBanners.ts`, `src/components/BannerCarousel.tsx`, `src/components/NotificationBell.tsx`, `src/routes/account.tsx`, `src/routes/account.orders.tsx`, `src/routes/admin.customers.tsx`, `src/routes/admin.customers.$id.tsx`.
- Edited: `src/routes/index.tsx` (mount carousel), `src/components/Header.tsx` (account menu), `src/components/OrderModal.tsx` (prefill + link to profile), `src/lib/orders.functions.ts` (link customer_id), `src/components/AdminLayout.tsx` (bell), `src/routes/admin.orders.tsx` (status + filter + search).
- Migrations: profile columns, orders.status/customer_id, notifications table + triggers + RLS + GRANTs.
