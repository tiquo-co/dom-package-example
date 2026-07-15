# Tiquo Example — DOM Package × Next.js

A from-scratch Next.js example showing how a hospitality brand can build a native member experience with [`@tiquo/dom-package`](https://www.npmjs.com/package/@tiquo/dom-package).

The visual direction takes broad inspiration from the supplied Webflow reference—editorial typography, full-bleed hospitality imagery, an experience grid, and an embedded member area—but contains no Webflow HTML, CSS, scripts, classes, or exported code. Only approved image assets from the reference site are included locally in `public/images`.

## Stack

- Next.js `16.2.10` — latest stable release on 14 July 2026 (16.3 is still a preview)
- React / React DOM `19.2.7`
- Tiquo DOM Package `1.6.1`
- TypeScript `6.0.3` — newest release supported by the current Next.js ESLint parser
- ESLint `9.39.5` with Next.js Core Web Vitals and TypeScript rules

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

When the Website SDK public key is not configured, the profile page displays a configuration alert instead of placeholder member data. To use authentication and live customer data, replace the placeholder in `.env.local`:

```bash
NEXT_PUBLIC_TIQUO_PUBLIC_KEY=pk_dom_your_key_here
```

Get the key from **Tiquo Dashboard → Settings → Website SDK**. Add `localhost` and each deployed domain to the Website SDK allowlist; Tiquo rejects SDK requests from domains that are not configured.

The `pk_dom_` key is intentionally public and is bundled into the browser. Do not put server secrets in any variable beginning with `NEXT_PUBLIC_`.

## Integration architecture

- `src/components/tiquo-provider.tsx` creates one browser-only SDK instance, restores the session, subscribes to auth changes, enables analytics, synchronizes tabs, and destroys listeners during cleanup.
- `src/components/member-portal.tsx` implements email OTP login, session-aware UI, upcoming bookings, order history, and wallet ticket links as native React components.
- `src/components/trackable-link.tsx` demonstrates custom first-party analytics events while the SDK records pageviews automatically.
- `src/app/profile/page.tsx` is statically rendered and hands interactive customer work to client components, keeping the public marketing page server-rendered by default.

The live package published to npm currently exposes `TiquoAuth`, while the newest documentation refers to the main class as `Tiquo` and states that `TiquoAuth` remains supported for compatibility. This example imports the export that actually exists in `@tiquo/dom-package@1.6.1`, so it builds against the published package without type shims.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

See the [DOM Package overview](https://docs.tiquo.co/en/docs/api-reference/dom-package/overview) and [setup guide](https://docs.tiquo.co/en/docs/api-reference/dom-package/setup) for dashboard configuration and the full SDK API.
