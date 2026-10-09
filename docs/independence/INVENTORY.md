
# Nexa Trade Mart — Lovable Independence Inventory

**Status:** Read-only audit baseline; documentation only  
**Branch:** `independence-audit`  
**Baseline commit:** `4de8753cecaedc2050d4791925e7183cb28c69dc`  
**Last reviewed:** 2026-10-09

## 1. Purpose

This inventory records the verified architecture and remaining work required to make Nexa Trade Mart maintainable and deployable without depending on Lovable's editor or proprietary runtime services.

This document does not authorize production changes.

The independence project must preserve the existing application, customer accounts, business data, authentication, authorization, storage, and integrations. Work on a dedicated branch first. Never commit credentials, production data, or secret values.

## 2. Current architecture — verified findings

| Area | Current finding | Required independence work |
|---|---|---|
| Source control | GitHub repository: `josephchivandire9-spec/nexa-trade-mart`. | Keep GitHub as the source of truth. Review changes through diffs and pull requests. |
| Application | React and TypeScript using TanStack Router, TanStack Start, and Vite. | Preserve the existing application. Do not rebuild from scratch. |
| Build and hosting | `vite.config.ts` imports `@cloudflare/vite-plugin`; `wrangler.jsonc` configures a Cloudflare Worker. | Prove an alternative build and hosting path before removing Cloudflare-specific configuration. |
| Server entry | `src/server.ts` uses the TanStack Start server entry. | Investigate how the application can run on an alternative supported server or hosting platform. |
| Database | Supabase project ID: `ljweqsofsbmrooxgchch`. | Preserve database schema, records, migrations, and existing application behavior. Plan backups and recovery before database changes. |
| Authentication | The application uses Supabase authentication. | Test registration, login, logout, sessions, OAuth callbacks, and protected pages on any alternative deployment. |
| Browser Supabase client | `src/integrations/supabase/client.ts` reads public Supabase URL and publishable-key settings. | Keep browser configuration public-key-only. Never expose privileged credentials through `VITE_*` variables. |
| Server admin client | `src/integrations/supabase/client.server.ts` reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The admin client bypasses RLS. | Keep the service-role key server-only. Inspect authorization checks and call sites before changing this client. |
| Authentication middleware | `src/integrations/supabase/auth-middleware.ts` expects Supabase URL and publishable-key configuration. | Verify configuration in every target runtime and test protected routes. |
| AI provider abstraction | `src/lib/ai/provider.server.ts` selects the provider through `AI_PROVIDER` and the model through `AI_MODEL`. | Retain a provider-independent architecture where practical. Test each provider before enabling it. |
| Google AI adapter | `src/lib/ai/providers/google.ts` uses `@ai-sdk/google` and expects `GOOGLE_GENERATIVE_AI_API_KEY`. | Configure the key only in the trusted server environment if Google AI is enabled. |
| OpenAI adapter | `src/lib/ai/providers/openai.ts` currently throws an error saying the adapter is not configured. | Do not claim OpenAI support is operational or select it for production until implemented and tested. |
| Historical Lovable AI plan | `.lovable/plan.md` references an older AI gateway and `LOVABLE_API_KEY`. The referenced gateway file was not found in the inspected code. | Treat this plan as historical until reconciled with the actual implementation. Do not restore an old gateway based only on this document. |
| Package installation | `bun.lock` contains some package tarball URLs hosted under `europe-west1-npm.pkg.dev/lovable-core-prod/sandbox-npm-cache`. | Verify that a clean install works using independently accessible package sources before declaring the project portable. |
| Lovable-branded URLs | Lovable-hosted URLs appear in sitemap generation, metadata, structured data, and social-preview references. | Choose the permanent public domain, verify asset ownership, then update affected URLs consistently. |
| Social-preview asset | Root metadata references an R2-hosted image whose filename contains `lovable.app`. | Verify that the asset is accessible and controlled by the project. Replace it only after a suitable alternative is verified. |
| Supabase Edge Functions | The inspected Supabase listing returned no deployed Edge Functions. | Recheck if future features introduce Edge Functions. Do not assume application server logic lives there. |
| Environment example | `.env.example` documents Supabase project and public-key settings but does not document all server-side variables found during inspection. | Improve environment documentation in a later reviewed change without adding actual secret values. |

## 3. Supabase security observations

The Supabase security advisor reported these findings during the audit:

1. `public.has_role(_user_id uuid, _role public.app_role)` is executable by the `authenticated` role and is a `SECURITY DEFINER` function.
2. Leaked-password protection is disabled.

These findings require investigation, not automatic changes.

Before changing the function's permissions, inspect its definition, existing grants, RLS policy dependencies, and intended access. Do not blindly revoke permissions or change policies because the function may be needed by existing authorization rules.

Evaluate leaked-password protection separately, considering its effect on authentication and password-reset workflows. No security settings were changed as part of this inventory.

## 4. Outstanding investigations

- [ ] Inspect the complete `package.json`, `bun.lock`, registry configuration, build scripts, and deployment workflows.
- [ ] Search the repository for Lovable SDKs, direct API calls, environment variables, hosted assets, and editor-only assumptions.
- [ ] Inspect every use of the Supabase service-role client and the authorization checks surrounding it.
- [ ] Verify Supabase Auth providers, OAuth redirect URLs, storage buckets, storage policies, backups, and recovery options.
- [ ] Confirm the intended permanent domain and preferred alternative hosting platform with the project owner.
- [ ] Establish a reproducible clean-install, build, and deployment test plan.
- [ ] Verify that all required package dependencies can be installed without relying on unavailable private caches.
- [ ] Check whether runtime environment variables work correctly on the alternative host; do not assume Cloudflare bindings and Node-style `process.env` behave identically.
- [ ] Test all critical customer and administration workflows in a non-production environment.

## 5. Definition of independence

Nexa Trade Mart must not be considered independent merely because Lovable branding has been removed.

Independence is achieved only when:

- [ ] The source code can be cloned and installed using documented, independently accessible package sources.
- [ ] A reproducible build and deployment succeeds without Lovable-only editor services or runtime gateways.
- [ ] Required public and server-only environment variables are documented and configured securely.
- [ ] Registration, login, OAuth, session persistence, customer accounts, product browsing, checkout, order workflows, and administration are tested.
- [ ] Existing Supabase data, authentication users, RLS policies, and storage are preserved.
- [ ] Database backup and recovery procedures have been tested.
- [ ] Canonical URLs, sitemap, robots directives, structured data, and social previews use the approved permanent domain.
- [ ] A rollback path is tested before any production cutover.

## 6. Safety rules

1. Do not edit `main` during the independence audit.
2. Do not change production deployment settings without explicit approval.
3. Do not run destructive SQL or change Supabase policies as part of documentation work.
4. Do not put service-role keys, API keys, passwords, tokens, or other secrets into Git.
5. Do not remove existing functionality simply to remove a provider dependency.
6. Do not delete Cloudflare configuration until an alternative build and deployment has been demonstrated.
7. Make small, reviewable changes and verify each step before proceeding.
8. Keep a record of completed work, outstanding risks, and the next approved step.

## 7. Change log

- **2026-10-09:** Prepared the initial independence inventory from the read-only repository and Supabase audit. This file records findings and planned investigations; it does not itself implement independence or change application behavior.
