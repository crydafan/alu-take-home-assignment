// Not idempotent. Running it again just appends more demo data.
import {
  type DppEvent,
  type EventType,
  PASSPORT_IDS,
  type RepairIssue,
  resolveRevenue,
} from "../src/lib/events";
import { EVENTS_KEY, redis } from "../src/lib/redis";

const DAY = 24 * 60 * 60 * 1000;
const MINUTE = 60 * 1000;
const SESSIONS = 45;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function chance(p: number): boolean {
  return Math.random() < p;
}

// Weighted repair-issue distribution (snags/holes most common).
const ISSUE_WEIGHTS: Array<[RepairIssue, number]> = [
  ["snagged_thread", 0.3],
  ["hole_in_knit", 0.2],
  ["torn_seam", 0.15],
  ["stretched_out_of_shape", 0.15],
  ["stain", 0.15],
  ["other", 0.05],
];

function pickIssue(): RepairIssue {
  const r = Math.random();
  let acc = 0;
  for (const [issue, w] of ISSUE_WEIGHTS) {
    acc += w;
    if (r <= acc) return issue;
  }
  return "other";
}

function pickIssues(): RepairIssue[] {
  const count = 1 + Math.floor(Math.random() * 3); // 1..3
  const set = new Set<RepairIssue>();
  while (set.size < count) set.add(pickIssue());
  return [...set];
}

const PRODUCT_IDS = [
  "plume-mini-skirt",
  "block-heel-mule",
  "knitwear-care-kit",
] as const;

function makeEvent(
  passportId: string,
  eventType: EventType,
  sessionId: string,
  timestamp: number,
  metadata?: DppEvent["metadata"],
): DppEvent {
  const event: DppEvent = {
    id: crypto.randomUUID(),
    passportId,
    eventType,
    timestamp,
    sessionId,
    ...(metadata ? { metadata } : {}),
  };
  const revenue = resolveRevenue(eventType, metadata);
  if (revenue !== undefined) event.revenue = revenue;
  return event;
}

function buildEvents(): DppEvent[] {
  const events: DppEvent[] = [];

  for (let s = 0; s < SESSIONS; s++) {
    const sessionId = crypto.randomUUID();
    const passportId = pick(PASSPORT_IDS);
    // Spread session start across the last ~14 days.
    const start = Date.now() - Math.floor(Math.random() * 14 * DAY);
    let offset = 0;
    const at = () => start + offset + Math.floor(Math.random() * MINUTE);
    const step = () => {
      offset += MINUTE + Math.floor(Math.random() * 4 * MINUTE);
    };

    // Every session starts with a view.
    events.push(makeEvent(passportId, "passport_viewed", sessionId, at()));
    step();

    if (chance(0.7)) {
      events.push(
        makeEvent(passportId, "care_section_opened", sessionId, at()),
      );
      step();
    }
    if (chance(0.55)) {
      events.push(
        makeEvent(passportId, "supply_chain_viewed", sessionId, at()),
      );
      step();
    }
    if (chance(0.5)) {
      events.push(
        makeEvent(passportId, "crosssell_section_viewed", sessionId, at()),
      );
      step();
    }

    // Conversions (not deduped; each counts + sums revenue independently).
    if (chance(0.15)) {
      events.push(
        makeEvent(passportId, "repair_requested", sessionId, at(), {
          issues: pickIssues(),
        }),
      );
      step();
    }
    if (chance(0.12)) {
      events.push(makeEvent(passportId, "resale_clicked", sessionId, at()));
      step();
    }
    if (chance(0.18)) {
      events.push(
        makeEvent(passportId, "crosssell_purchase_clicked", sessionId, at(), {
          productId: pick(PRODUCT_IDS),
        }),
      );
      step();
    }
  }

  return events.sort((a, b) => a.timestamp - b.timestamp);
}

async function main() {
  const events = buildEvents();
  await redis.rpush(EVENTS_KEY, ...events.map((e) => JSON.stringify(e)));
  console.log(`Seeded ${events.length} events across ${SESSIONS} sessions.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
