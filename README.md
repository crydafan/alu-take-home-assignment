# Loom Collective — Digital Product Passport

A Next.js prototype of a **Digital Product Passport (DPP)** for a fictitious fashion brand. It has three parts:

1. **Passport pages** — a public page per physical garment (reached by scanning a QR code) showing product info, supply-chain journey, cross-sell, and end-of-life repair/resale actions.
2. **Event tracking** — visitor views and interactions are stored in Upstash Redis, attributed to the specific unit.
3. **Analytics dashboard** — a marketer-facing view of how the five passports are performing.

Product used throughout: **The Serpentine Knit Top** ($140), chartreuse snake-print jacquard.

## Tech stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** + **shadcn** (base-nova style, built on **Base UI**) for components
- **hugeicons** for iconography, **Recharts** for dashboard charts
- **Upstash Redis** (REST) for event storage
- **Biome** for lint/format · **pnpm** as the package manager

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create `.env` in the project root with your Upstash Redis REST credentials (a free database at [upstash.com](https://upstash.com)):

   ```bash
   UPSTASH_REDIS_REST_URL=...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

   The client is created with `Redis.fromEnv()`, so these exact names are required.
3. Run the dev server:

   ```bash
   pnpm dev
   ```

4. Load demo data so the dashboard isn't empty:

   ```bash
   pnpm seed
   ```

Then open:

- `/` — landing page with the five passport **QR codes** and a link to the dashboard
- `/product?id=<passportId>` — a passport page
- `/dashboard` — the analytics dashboard

Other scripts: `pnpm build`, `pnpm start`, `pnpm lint` (Biome), `pnpm format`, `pnpm test` (Vitest).

## Solution summary

- **Five passports, one product.** All five units share the same product data (`src/app/product/lib/mockup.ts`); they differ only by a unique **passport id**. The ids are five fixed UUIDs (`src/lib/events.ts`), surfaced everywhere as friendly labels **"Unit 001"–"Unit 005"** with the short UUID as a subtitle.
- **Passport page** (`src/app/product/page.tsx`) — a Server Component with the four required sections. `?id=` is validated against the five ids; an unknown id renders a "Could not find product" screen. The repair modal, resale button, and cross-sell "Add" buttons are the three conversion moments.
- **QR codes** — pre-generated PNGs in `public/qr/` (`qr-code-0…4.png`, one per unit) are shown on the landing page; each also links through to its passport. Scanning opens the passport, which fires a view attributed to that unit.
- **Storage** — a single Redis list, `events:all`. Events are `RPUSH`ed on write and read back once with `LRANGE 0 -1`; all aggregation happens in application code, never in Redis.
- **Dashboard** (`/dashboard`) reads that list once and derives every number from the events.

Routes at a glance:

| Route | Purpose |
| --- | --- |
| `/` | Landing + QR codes |
| `/product?id=<uuid>` | Passport page |
| `/dashboard` | Analytics |
| `POST /api/events` | Record an event |
| `GET /api/events` | Read the full event log |

## Event tracking

Events follow a single typed contract (`DppEvent` in `src/lib/events.ts`):

```ts
type DppEvent = {
  id: string;          // uuid, stamped server-side
  passportId: string;  // which of the five units
  eventType: EventType;
  timestamp: number;   // ms epoch, stamped server-side
  sessionId: string;   // random id, persisted in localStorage
  revenue?: number;    // resolved server-side for conversions
  metadata?: Record<string, string | number | string[]>;
};
```

**Tracked event types**

| Event | Trigger | Revenue | Notes |
| --- | --- | --- | --- |
| `passport_viewed` | Passport page mounts | — | |
| `care_section_opened` | Care section scrolls into view (once/session) | — | |
| `supply_chain_viewed` | Supply-chain section into view (once/session) | — | |
| `crosssell_section_viewed` | Cross-sell section into view (once/session) | — | |
| `repair_requested` | Repair form submitted | $20 | `metadata.issues: string[]` (+ optional `comment`) |
| `resale_clicked` | "Resell this item" clicked | $12 | |
| `crosssell_purchase_clicked` | Companion "Add" clicked | product price | `metadata.productId` |

**Design choices**

- **Server-authoritative fields.** `id`, `timestamp`, and `revenue` are stamped/resolved on the server (`src/app/api/events/route.ts`), so a visitor can't spoof revenue from devtools. Cross-sell revenue is looked up from a product-price table by `productId`.
- **Engagement events, not just views.** The three section-view events let the dashboard answer "which section gets the most engagement" and power a conversion funnel. They fire **once per passport view** (a client-side `Set` guard) to avoid inflating counts from re-scrolling.
- **Repair issues as an array.** The modal is multi-select ("select all that apply"), so one submission produces one `repair_requested` event (one $20 conversion) whose `metadata.issues` holds every selected issue — the issues chart counts each one.
- **Session id** (`localStorage`) is an optional extra that cheaply distinguishes **unique visitors** from total views and defines the funnel's session boundaries.
- **Client helper** (`src/lib/track.ts`) sends events with `fetch(..., { keepalive: true })` so they survive navigation right after a click; wiring lives in `src/components/tracking/` (`TrackingProvider`, `SectionInView`, `TrackedButton`).

## Dashboard metrics

`/dashboard` is a `force-dynamic` Server Component that reads the events **once** (`readAllEvents()`) and hands them to a client component. All aggregation is pure functions in `src/lib/analytics.ts`, so metrics are 100% event-derived and re-compute instantly when the filter changes.

Chosen for a marketer asking "how is the passport performing?":

- **KPI row** — passport views, unique visitors, conversions, total revenue.
- **Per-passport performance table** — one row per unit (views, visitors, section opens, conversions, revenue); rows are clickable to focus the whole dashboard. *(Answers "how is each individual passport performing", not just totals.)*
- **Revenue by action type** — repair / resale / cross-sell. *(Required.)*
- **Most common repair issues** — counts across all repair events' `metadata.issues`. *(Required.)*
- **Section engagement** — care vs supply-chain vs cross-sell. *(Answers "which section gets the most engagement".)*
- **Per-passport filter** — scope KPIs + charts to one unit or all.
- **Activity over time** — 14-day trend of views and conversions.
- **Conversion funnel** — sessions: viewed → engaged a section → converted, with drop-off.

## Assumptions

- Five units are enough to demonstrate per-passport analytics; all share one product.
- Passport ids are UUIDs (not human-readable serials like `LC-SER-001`); the "Unit 00N" labels bridge readability.
- Cross-sell prices are $120 / $190 / $34 (kept consistent with what the passport page displays; revenue equals the shown price).
- Simulated revenue values: $20 repair, $12 resale, product price for a cross-sell.
- Section "opened" is interpreted as "scrolled into view" (the sections are always rendered, not collapsed).

## Testing

Unit tests (Vitest) cover the two pure modules that hold the analytics logic — the highest-value, lowest-friction things to test, since a wrong aggregation silently corrupts every dashboard number:

- `src/lib/events.test.ts` — server-authoritative revenue resolution (fixed table + cross-sell lookup), the id/event/issue validators, and the passport label helpers.
- `src/lib/analytics.test.ts` — every aggregation (`kpis`, `perPassportRows`, `revenueByAction`, `repairIssueCounts`, `sectionEngagement`, `funnel`, `viewsOverTime`, `filterByPassport`) against a small fixed event fixture with known expected outputs.

```bash
pnpm test        # run once
pnpm test:watch  # watch mode
```

The `@` path alias is mapped in `vitest.config.ts`. These functions are deliberately pure (no Redis/React), which is what makes them trivially testable; UI and API routes are verified manually / by typecheck rather than with a component-test harness in this prototype.

## Known limitations / next steps

- **QR content isn't verified in-repo.** The PNGs were generated externally; the landing-page click-throughs are correct by construction (they use `PASSPORT_IDS`), but the images themselves must encode the **deployed absolute URLs** for phone scans to work in production. Next step: a `scripts/gen-qr.mts` that generates them from `PASSPORT_IDS` + `NEXT_PUBLIC_BASE_URL` so order and base URL are guaranteed.
- **No auth / rate limiting / bot filtering** on `/api/events` — fine for a prototype, not for production view counts.
- **Seed is not idempotent** — `pnpm seed` appends more demo data each run.
- **Section de-duplication is client-side only** (per passport view), and passport-id validity is enforced at the page rather than in the write API.
- **No pagination on reads** — the dashboard fetches the whole list; fine at this scale, would need windowing/pre-aggregation at volume.
- Charts render in the app's neutral (grayscale) theme; a brand accent palette could be introduced.

## AI tools

This prototype was built with **Claude Code** as a pair-programming assistant (scaffolding components, wiring the event pipeline, and drafting the dashboard). All code was reviewed and is understood/owned by the author; decisions where the spec was silent (event taxonomy, dashboard metrics, storage shape) were made deliberately and can be walked through during the recap.
