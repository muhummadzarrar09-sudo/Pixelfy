# betapixelfy.vercel.app — Pixelfy Beta Pioneers

**Live URL:** https://betapixelfy.vercel.app  
**Hosted:** Vercel Free / Hobby — $0 — perfect for pre-revenue — upgrade to Pro ($20/mo) at Beta Open 2k users

Next.js 16 • React 19 • Node 24/26 • Tailwind 4.3 • TypeScript 5.8 • Supabase

**Stack — July 2026 — ZERO deprecated**
- next **16.2.10** LTS (Jul 1 2026) — App Router — Turbopack
- react **19.2.7** / react-dom 19.2.7
- node **24.4.0 LTS “Krypton”** — recommended prod — also supports **26.4.0 Current**
- typescript **5.8.3**
- tailwindcss **4.3.2** — @tailwindcss/postcss
- @supabase/supabase-js **2.52.1** + @supabase/ssr **0.6.1**
- framer-motion 12.9.2 • sonner 2.0.3 • zod 3.25.76 • react-hook-form 7.58.1
- pnpm 10.12.1

```
pnpm i
cp .env.local.example .env.local
# fill NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (sb_publishable_xxx)
pnpm dev
# http://localhost:3000
```

Deploy:
- **Vercel Hobby — FREE** — perfect while cash-tight
  - `vercel --prod`
  - Framework preset: Next.js — Node 24.x
  - Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Domain: **`betapixelfy.vercel.app`** (auto) — custom `beta.pixelfy.app` later → Vercel Domains → Add → CNAME
  - Free tier limits: 100GB bandwidth/mo — ~600k page views — enough for Beta 1+2
  - Upgrade path: Vercel Pro $20/mo when >2k DAU

Supabase:
- Run `supabase/waitlist.sql` in SQL Editor
- Table: `beta_waitlist` — RLS: anon INSERT only
- Realtime OFF — simple insert

Features:
- Pixelfy branded — purple #8B5CF6 / teal #06FFA5 / pink #FF3B9A / dark #0F0B1A
- Waitlist form: email • android_version • device_model • photographer_type • current_apps[] • pain_point • consent_marketing • agree_nda
- On submit → Supabase insert → returns Pioneer Pro code: `PXFY-BETA-PIONEER-2026-XXXX`
- Auth standby notice everywhere — matches Android app Local Mode
- SEO: OpenGraph `og-pixelfy.png` 1200×630
- Security headers: X-Frame-Options DENY, CSP ready, Permissions-Policy camera=(), microphone=(), geolocation=()
- Privacy: footer links /legal/privacy — GDPR/CCPA copy

Owner: all features unlocked — no paywall in Beta site — use code `PXFY-OWNER-2026-UNLIMITED` for internal bypass if needed.
