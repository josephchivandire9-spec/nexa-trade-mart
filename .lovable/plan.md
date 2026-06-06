
# Two-System Auth + Rewards Upgrade

Non-destructive extension of the current platform. No existing products, orders, banners, AI assistant, or design tokens are removed. Today's `/auth` page already supports email+password signup; the database trigger `handle_new_user` already assigns `customer` role by default and `admin` only to the first user. We extend this rather than replace it.

## 1. Two separate auth surfaces

| | Customer | Admin |
|---|---|---|
| Route | `/login`, `/register` (rename of `/auth`) | `/admin/login` (hidden, noindex) |
| Default after sign-in | `/account` | `/admin` |
| Role required | `customer` | `admin` |
| Header link | "Account" / "Sign in" (existing) | Hidden — admin link only shows when `isAdmin` |

Both use Supabase Auth under the hood (one identity table), but the UI, redirect targets, and access gates are separate. A logged-in customer hitting `/admin/login` or `/admin/*` gets the existing "Not authorized" screen — unchanged.

### Customer ID
Add `customer_code` to `profiles` (format `NXA-XXXXXX`, generated in `handle_new_user` trigger). Backfill existing customers. Surfaced in account header + admin customer detail page.

## 2. Customer dashboard (`/account/*`)

Existing `/account` (Profile) and `/account/orders` stay. Add:
- `/account/addresses` — multiple saved addresses (new `customer_addresses` table; default address auto-fills OrderModal)
- `/account/tracking` — order tracking by status timeline (uses existing `orders.status`)
- `/account/rewards` — points balance + history
- `/account/referrals` — share link + referred users + earned points
- `/account/settings` — change password, email preferences

Sidebar in `src/routes/account.tsx` gets new nav entries.

## 3. Rewards + referrals

New tables:
- `reward_points` — running ledger: `customer_id`, `points`, `reason`, `order_id?`, `status (pending|approved|rejected)`, `created_at`
- `referrals` — `referrer_id`, `referred_id`, `code`, `status`, `reward_points`, `created_at`
- `profiles.referral_code` (unique, auto-generated)
- `profiles.referred_by` (nullable, references profiles)

Rules (admin-approved):
- Signup via referral link: 100 pts to referrer (pending until referred user's first order is delivered → approved)
- Each completed order: 1 pt per R10 spent (pending → approved when status='delivered')
- Admin can approve/reject any entry from `/admin/rewards`

Registration page reads `?ref=CODE` from URL, stores in `referred_by`.

## 4. Admin additions

- `/admin/rewards` — pending points queue, approve/reject
- `/admin/customers` already exists — extend with search by name / phone / email / customer_code, show points balance, referral stats
- Admin sidebar gets "Rewards" entry

## 5. Safety

- All new tables: RLS enabled, GRANTs, customer-only-sees-own + admin-sees-all policies via existing `has_role()`.
- No edits to: existing orders flow, OrderModal pricing, banners, AI assistant, products, Shopify integration.
- `/auth` route kept as redirect to `/login` for backwards compatibility.

## Technical file map

**Migrations (one SQL file):**
- `profiles`: add `customer_code`, `referral_code`, `referred_by`, `points_balance` (computed via trigger from `reward_points`)
- new table `customer_addresses`
- new table `reward_points`
- new table `referrals`
- update `handle_new_user` to generate `customer_code` + `referral_code` and apply `referred_by` from raw_user_meta_data
- triggers: award points on order status → delivered; award referrer on referred user's first delivered order
- RLS + GRANTs on all new tables

**New routes:**
- `src/routes/login.tsx` (customer)
- `src/routes/register.tsx` (customer, supports `?ref=`)
- `src/routes/admin.login.tsx` (admin-only, noindex)
- `src/routes/account.addresses.tsx`
- `src/routes/account.tracking.tsx`
- `src/routes/account.rewards.tsx`
- `src/routes/account.referrals.tsx`
- `src/routes/account.settings.tsx`
- `src/routes/admin.rewards.tsx`

**Edited:**
- `src/routes/auth.tsx` → thin redirect to `/login`
- `src/routes/account.tsx` → expanded sidebar, show customer_code
- `src/components/AdminLayout.tsx` → add "Rewards" nav
- `src/routes/admin.customers.tsx` → multi-field search, points column
- `src/components/Header.tsx` → "Sign in" → `/login`, "Register" → `/register`
- `src/components/OrderModal.tsx` → pull default address from `customer_addresses`
- `src/hooks/useAuth.ts` → expose `isCustomer` helper

**New hooks:**
- `src/hooks/useAddresses.ts`
- `src/hooks/useRewards.ts`
- `src/hooks/useReferrals.ts`

## Out of scope (Phase 2)
Discount code redemption at checkout, point-to-discount conversion, email notifications for reward approvals, mobile push, advanced analytics. These are tee'd up by the data model but not built this round.
