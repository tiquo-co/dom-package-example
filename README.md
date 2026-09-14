<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./public/images/tiquo-white.svg">
    <img src="./public/images/tiquo-black.svg" height="64" alt="Tiquo">
  </picture>
</div>

<div align="center">
  <p><strong>DOM Package × Next.js example</strong></p>
  <p>A native hospitality member experience powered by <code>@tiquo/dom-package</code>.</p>

  <p>
    <a href="https://www.tiquo.co"><img src="https://img.shields.io/badge/Website-tiquo.co-blue" alt="Website"></a>
    <a href="https://docs.tiquo.co/en/docs/api-reference/dom-package/overview"><img src="https://img.shields.io/badge/Docs-DOM_Package-green" alt="DOM Package documentation"></a>
    <a href="https://www.npmjs.com/package/@tiquo/dom-package"><img src="https://img.shields.io/badge/%40tiquo%2Fdom--package-1.8.2-6F42C1" alt="@tiquo/dom-package 1.8.2"></a>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16.2-black" alt="Next.js 16.2"></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.2-149ECA" alt="React 19.2"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-6.0-blue" alt="TypeScript 6.0"></a>
  </p>
</div>

---

## Contents

- [Overview](#overview)
- [Architecture and tech stack](#architecture-and-tech-stack)
- [Repository structure](#repository-structure)
- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Integration architecture](#integration-architecture)
- [Development commands](#development-commands)
- [Testing and quality](#testing-and-quality)
- [Documentation](#documentation)

## Overview

This is a from-scratch Next.js example showing how a hospitality brand can build a native member experience with [`@tiquo/dom-package`](https://www.npmjs.com/package/@tiquo/dom-package).

The visual direction takes broad inspiration from the supplied Webflow reference—editorial typography, full-bleed hospitality imagery, an experience grid and an embedded member area—but contains no Webflow HTML, CSS, scripts, classes or exported code. Only approved image assets from the reference site are included locally in `public/images`.

## Architecture and tech stack

| Layer     | Current implementation                                                                      |
| --------- | ------------------------------------------------------------------------------------------- |
| Web       | Next.js `16.2.10` App Router                                                                |
| UI        | React and React DOM `19.2.7`                                                                |
| Tiquo SDK | `@tiquo/dom-package` `1.8.2` for authentication, customer data, bookings, orders and events |
| Language  | TypeScript `6.0.3`                                                                          |
| Quality   | ESLint `9.39.5` with Next.js Core Web Vitals and TypeScript rules                           |

## Repository structure

```text
dom-package-example/
├── public/images/                 # Local brand and hospitality assets
├── src/
│   ├── app/                       # App Router pages and global styles
│   │   ├── booking/               # Booking widget example
│   │   ├── booking-embedded/      # Service Catalog (service), calendar-first
│   │   ├── service-catalog-calendar/ # Service Catalog (calendar)
│   ├── form/                  # Embedded Tiquo form
│   │   ├── membership/            # Membership options
│   │   ├── order-pick-up/         # Collection ordering flow
│   │   └── profile/               # Authenticated member area
│   ├── components/                # Site UI and Tiquo integration components
│   └── lib/                       # Shared application utilities
├── .env.example                   # Website SDK environment template
├── package.json                   # Dependencies and development commands
└── next.config.ts                 # Next.js configuration
```

## Getting started

### Prerequisites

- Node.js `20.9.0` or newer, as required by Next.js 16.
- npm, included with Node.js.
- A Tiquo Website SDK public key for authentication and live customer data.

### Install and run

```bash
git clone <repository-url>
cd dom-package-example
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment configuration

Set the Website SDK public key in `.env.local`:

```bash
NEXT_PUBLIC_TIQUO_PUBLIC_KEY=pk_dom_your_key_here
```

Get the key from **Tiquo Dashboard → Settings → Website SDK**. Add `localhost` and every deployed domain to the Website SDK allowlist; Tiquo rejects SDK requests from domains that are not configured.

The `pk_dom_` key is intentionally public and is bundled into the browser. Do not put server secrets in any variable beginning with `NEXT_PUBLIC_`.

When the public key is not configured, every page displays a slim configuration bar and profile login actions remain disabled.

## Integration architecture

- `src/components/tiquo-provider.tsx` creates one browser-only SDK instance, restores the session, subscribes to authentication changes, enables analytics, synchronizes tabs and destroys listeners during cleanup.
- `src/components/member-portal.tsx` implements email OTP login, session-aware UI, upcoming bookings, order history and wallet ticket links as native React components.
- `src/components/trackable-link.tsx` demonstrates custom first-party analytics events while the SDK records page views automatically.
- `src/app/profile/page.tsx` is statically rendered and hands interactive customer work to client components, keeping the public marketing page server-rendered by default.

The integration uses the package's primary `Tiquo` class. `TiquoAuth` remains available as a backwards-compatible alias for older integrations.

## Development commands

| Command             | What it does                               |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Starts the Next.js development server      |
| `npm run build`     | Creates an optimized production build      |
| `npm run start`     | Serves the production build                |
| `npm run typecheck` | Checks TypeScript without emitting files    |
| `npm run lint`      | Runs ESLint across the repository           |

## Testing and quality

Run the full local validation set before opening a pull request:

```bash
npm run typecheck
npm run lint
npm run build
```

## Documentation

- [DOM Package overview](https://docs.tiquo.co/en/docs/api-reference/dom-package/overview)
- [DOM Package setup guide](https://docs.tiquo.co/en/docs/api-reference/dom-package/setup)
- [`@tiquo/dom-package` on npm](https://www.npmjs.com/package/@tiquo/dom-package)
