import { describe, expect, it } from "vitest";
import {
  filterByPassport,
  funnel,
  kpis,
  perPassportRows,
  repairIssueCounts,
  revenueByAction,
  sectionEngagement,
  viewsOverTime,
} from "@/lib/analytics";
import { type DppEvent, type EventType, PASSPORT_IDS } from "@/lib/events";

const A = PASSPORT_IDS[0];
const B = PASSPORT_IDS[1];

let seq = 0;
function ev(
  passportId: string,
  eventType: EventType,
  sessionId: string,
  extra: Partial<DppEvent> = {},
): DppEvent {
  seq += 1;
  return {
    id: `id-${seq}`,
    passportId,
    eventType,
    sessionId,
    timestamp: Date.now(),
    ...extra,
  };
}

// 4 sessions across 2 passports.
const events: DppEvent[] = [
  // s1 (A): view + care + repair(2 issues)
  ev(A, "passport_viewed", "s1"),
  ev(A, "care_section_opened", "s1"),
  ev(A, "repair_requested", "s1", {
    revenue: 20,
    metadata: { issues: ["snagged_thread", "torn_seam"] },
  }),
  // s2 (A): view + resale
  ev(A, "passport_viewed", "s2"),
  ev(A, "resale_clicked", "s2", { revenue: 12 }),
  // s3 (B): view + crosssell section + crosssell purchase
  ev(B, "passport_viewed", "s3"),
  ev(B, "crosssell_section_viewed", "s3"),
  ev(B, "crosssell_purchase_clicked", "s3", {
    revenue: 190,
    metadata: { productId: "block-heel-mule" },
  }),
  // s4 (B): view only
  ev(B, "passport_viewed", "s4"),
];

describe("kpis", () => {
  it("aggregates views, unique visitors, conversions and revenue", () => {
    expect(kpis(events)).toEqual({
      views: 4,
      uniqueVisitors: 4,
      conversions: 3,
      revenue: 222,
    });
  });
});

describe("filterByPassport", () => {
  it("scopes events to one passport", () => {
    const scoped = filterByPassport(events, A);
    expect(scoped).toHaveLength(5);
    expect(kpis(scoped)).toMatchObject({
      views: 2,
      conversions: 2,
      revenue: 32,
    });
  });

  it("returns everything for 'all'", () => {
    expect(filterByPassport(events, "all")).toHaveLength(events.length);
  });
});

describe("perPassportRows", () => {
  it("returns one row per passport with correct totals", () => {
    const rows = perPassportRows(events);
    expect(rows).toHaveLength(PASSPORT_IDS.length);
    const a = rows.find((r) => r.passportId === A);
    const b = rows.find((r) => r.passportId === B);
    expect(a).toMatchObject({
      views: 2,
      conversions: 2,
      revenue: 32,
      label: "Unit 001",
    });
    expect(b).toMatchObject({
      views: 2,
      conversions: 1,
      revenue: 190,
      crosssellViewed: 1,
    });
  });
});

describe("revenueByAction", () => {
  it("splits revenue by conversion type", () => {
    const byAction = revenueByAction(events);
    expect(byAction).toEqual([
      { key: "repair_requested", action: "Repair", revenue: 20, count: 1 },
      { key: "resale_clicked", action: "Resale", revenue: 12, count: 1 },
      {
        key: "crosssell_purchase_clicked",
        action: "Cross-sell",
        revenue: 190,
        count: 1,
      },
    ]);
  });
});

describe("repairIssueCounts", () => {
  it("counts every issue in the arrays, sorted by frequency", () => {
    const counts = repairIssueCounts(events);
    const map = Object.fromEntries(counts.map((c) => [c.issue, c.count]));
    expect(map.snagged_thread).toBe(1);
    expect(map.torn_seam).toBe(1);
    expect(map.stain).toBe(0);
    // Sorted descending — the two present issues lead.
    expect(counts[0].count).toBe(1);
    expect(counts.at(-1)?.count).toBe(0);
  });
});

describe("sectionEngagement", () => {
  it("counts opens per section", () => {
    expect(sectionEngagement(events)).toEqual([
      { section: "Care", count: 1 },
      { section: "Supply chain", count: 0 },
      { section: "Cross-sell", count: 1 },
    ]);
  });
});

describe("funnel", () => {
  it("computes session-level view → engage → convert", () => {
    const stages = funnel(events);
    expect(stages.map((s) => s.sessions)).toEqual([4, 2, 3]);
    expect(stages[0].pct).toBe(100);
    expect(Math.round(stages[2].pct)).toBe(75); // 3 of 4 sessions converted
  });
});

describe("viewsOverTime", () => {
  it("buckets today's activity and returns the requested window", () => {
    const trend = viewsOverTime(events, 14);
    expect(trend).toHaveLength(14);
    const today = trend.at(-1);
    expect(today?.views).toBe(4);
    expect(today?.conversions).toBe(3);
  });
});
