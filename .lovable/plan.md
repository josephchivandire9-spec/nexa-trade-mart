# Nexa Trade Mart — Read-only Infrastructure Audit (2026-09-30)

Nothing was edited or deployed. F = verified fact (evidence given). H = hypothesis.

## 1. Latest project / commit state
- F: HEAD `745bee1` "Fixed browser crash on load" (2026-09-28 16:45 UTC). Prior: `412b33e`, `b8a9521`, `a0093e9` ("Changes"), `4e91c46` "Work in progress", `7dc29a4` "Update wrangler config name to nexa-trade-mart".
- F: Last 5 commits touched: `src/server.ts` (client-abort handling), `src/routes/__root.tsx`, `src/integrations/supabase/client.ts` + new `previewAuthStorage.ts`, `types.ts`, `package.json`/`bun.lock`, `wrangler.jsonc` (name), `AI_RULES.md`, `AI_START.md`, `ROADMAP.md`, `routeTree.gen.ts`.
- F: Current working branch is a Lovable edit branch; other branches: `main`, `update_worker_name_to_nexa-trade-mart`.

## 2. GitHub connection
- F: Git remotes visible in the sandbox are only Lovable-owned: `origin` = Lovable private git storage (`git.private.lovable-gcp.code.storage/<project-id>.git`), `secondary` = `s3://lovable-repositories/...`. No github.com remote is visible.
- H: The branch `update_worker_name_to_nexa-trade-mart` and commits "Create AI_RULES.md…" look like they came from an external editor (GitHub-style commit titles), suggesting GitHub sync may exist, but GitHub sync is not visible from inside the sandbox. I cannot confirm repo/owner/branch — check Plus (+) → GitHub in the editor.

## 3. Managed vs external infrastructure
| Area | Status | Evidence |
|---|---|---|
| Database | F: Lovable Cloud-managed | `supabase/config.toml` project_id, `.env` SUPABASE_URL/VITE_* |
| Auth (email/password) | F: same Lovable Cloud project | `src/routes/login.tsx`, `admin.login.tsx` use `supabase.auth` |
| Google login | F: Lovable OAuth broker | `@lovable.dev/cloud-auth-js`, `src/integrations/lovable/index.ts`, called from `login.tsx:61`, `register.tsx:76`, `WelcomeModal.tsx:33` |
| Storage | F: Lovable Cloud bucket `store-media` | `src/lib/storage.ts` |
| AI assistant | F: Lovable AI Gateway | `src/lib/ai-assistant.functions.ts:38` reads `LOVABLE_API_KEY`, uses `src/lib/ai-gateway.server.ts` (`ai.gateway.lovable.dev`). Note: the `src/lib/ai/providers/*` Gemini layer mentioned earlier does NOT exist in the current code. |
| Shopify helpers | F: present (`src/lib/shopify.ts`), external | — |
| Hosting | F: Lovable (`nexa-trade-mart.lovable.app`) | project URLs |

## 4. Lovable-specific items that can break a Cloudflare deploy
1. F: `vite.config.ts` depends on `@lovable.dev/vite-tanstack-config` (devDependency, pinned 2.23.1) — bundles tanstackStart, cloudflare plugin, env injection, `@` alias. Works outside Lovable only if installed; H: its sandbox detection/env injection may behave differently on Cloudflare CI.
2. F: `@lovable.dev/cloud-auth-js` calls `~oauth/initiate` on the current origin and `oauth.lovable.app`. The `/~oauth/*` path is served by Lovable hosting, not by this app (no such route in `src/routes`).
3. F: `LOVABLE_API_KEY` needed by the AI assistant — not present in a Cloudflare environment unless manually added (and keys are tied to Lovable).
4. F: `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` are baked at build time from `.env`; server code reads `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` from `process.env`. `.env` is tracked in git, but server-side vars must also be set as Cloudflare Worker vars — `client.ts` throws "Missing Supabase environment variable(s)" otherwise.
5. F: `src/integrations/supabase/previewAuthStorage.ts` — harmless off Lovable domains (falls back to localStorage).
6. F: Hardcoded `https://nexa-trade-mart.lovable.app` in `sitemap[.]xml.ts:4`, `about.tsx`, `product.$handle.tsx`, `__root.tsx` JSON-LD; og:image points to a Lovable preview screenshot. SEO-only, not a crash.
7. F: `wrangler.jsonc` main = `src/server.ts`, `nodejs_compat`; `nitro` beta also in deps. H: mismatch between Lovable's build pipeline and a raw `wrangler deploy` can produce a Worker without assets binding → static/route 404s.

## 5. Forbidden / 404 after moving to Cloudflare — likely mechanism (H, not code-changed)
- H1 (strongest, supported by F in 4.2): Google "Continue with Google" calls `/~oauth/initiate` on the Cloudflare domain. That path only exists on Lovable hosting → Cloudflare returns **404**. If it reaches `oauth.lovable.app`, the broker only accepts registered Lovable origins/redirect URIs → **Forbidden**.
- H2: Email/password sign-in succeeds, but the auth backend's allowed Site URL / redirect list contains only Lovable domains, so email confirmation / reset links redirect back to Lovable or are rejected.
- H3: If Worker env vars `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY` are missing, protected server functions (`requireSupabaseAuth`, e.g. `src/lib/orders.functions.ts`) error, and SSR returns the branded 500 page.
- F: Admin/account gating is client-side only (`AdminLayout.tsx:54-81` redirects to `/admin/login`; `account.tsx` uses `useAuth`); there is no `_authenticated` route layout. So the Forbidden/404 is not produced by the app's own route guards — it comes from the broker/hosting layer (H1/H2) or missing assets/env (H3, 4.7).
- To confirm (next step, needs your input): exact URL shown when the error appears, and whether it happens on Google login, email login, or just opening /admin.

## Security note
- F: No secret values were printed in this report. The Lovable git remote URL contains an access token in the sandbox; it is not reproduced here.
