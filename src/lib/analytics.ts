// Pure aggregation helpers over the raw event log. No Redis / no React, so they
// run identically on the server and re-run cheaply on the client when the
// passport filter changes.

import {
  type DppEvent,
  type EventType,
  PASSPORT_IDS,
  passportLabel,
  passportShort,
  REPAIR_ISSUES,
  type RepairIssue,
} from "@/lib/events";

export const CONVERSION_TYPES: EventType[] = [
  "repair_requested",
  "resale_clicked",
  "crosssell_purchase_clicked",
];

export const SECTION_TYPES: EventType[] = [
  "care_section_opened",
  "supply_chain_viewed",
  "crosssell_section_viewed",
];

export type PassportFilter = string | "all";

export function filterByPassport(
  events: DppEvent[],
  passport: PassportFilter,
): DppEvent[] {
  if (passport === "all") return events;
  return events.filter((e) => e.passportId === passport);
}

function uniqueSessions(events: DppEvent[]): number {
  return new Set(events.map((e) => e.sessionId)).size;
}

export type Kpis = {
  views: number;
  uniqueVisitors: number;
  conversions: number;
  revenue: number;
};

export function kpis(events: DppEvent[]): Kpis {
  return {
    views: events.filter((e) => e.eventType === "passport_viewed").length,
    uniqueVisitors: uniqueSessions(events),
    conversions: events.filter((e) => CONVERSION_TYPES.includes(e.eventType))
      .length,
    revenue: events.reduce((sum, e) => sum + (e.revenue ?? 0), 0),
  };
}

export type PassportRow = {
  passportId: string;
  label: string;
  short: string;
  views: number;
  uniqueVisitors: number;
  careOpened: number;
  supplyViewed: number;
  crosssellViewed: number;
  repairs: number;
  resales: number;
  purchases: number;
  conversions: number;
  revenue: number;
};

export function perPassportRows(events: DppEvent[]): PassportRow[] {
  return PASSPORT_IDS.map((id) => {
    const scoped = events.filter((e) => e.passportId === id);
    const count = (t: EventType) =>
      scoped.filter((e) => e.eventType === t).length;
    const repairs = count("repair_requested");
    const resales = count("resale_clicked");
    const purchases = count("crosssell_purchase_clicked");
    return {
      passportId: id,
      label: passportLabel(id),
      short: passportShort(id),
      views: count("passport_viewed"),
      uniqueVisitors: uniqueSessions(scoped),
      careOpened: count("care_section_opened"),
      supplyViewed: count("supply_chain_viewed"),
      crosssellViewed: count("crosssell_section_viewed"),
      repairs,
      resales,
      purchases,
      conversions: repairs + resales + purchases,
      revenue: scoped.reduce((sum, e) => sum + (e.revenue ?? 0), 0),
    };
  });
}

export type RevenueByAction = {
  action: string;
  key: EventType;
  revenue: number;
  count: number;
};

export function revenueByAction(events: DppEvent[]): RevenueByAction[] {
  const labels: Record<string, string> = {
    repair_requested: "Repair",
    resale_clicked: "Resale",
    crosssell_purchase_clicked: "Cross-sell",
  };
  return CONVERSION_TYPES.map((key) => {
    const scoped = events.filter((e) => e.eventType === key);
    return {
      key,
      action: labels[key],
      revenue: scoped.reduce((sum, e) => sum + (e.revenue ?? 0), 0),
      count: scoped.length,
    };
  });
}

export type IssueCount = { issue: RepairIssue; label: string; count: number };

const ISSUE_LABELS: Record<RepairIssue, string> = {
  snagged_thread: "Snagged thread",
  hole_in_knit: "Hole in knit",
  torn_seam: "Torn seam",
  stretched_out_of_shape: "Stretched",
  stain: "Stain",
  other: "Other",
};

export function repairIssueCounts(events: DppEvent[]): IssueCount[] {
  const counts = new Map<RepairIssue, number>();
  for (const e of events) {
    if (e.eventType !== "repair_requested") continue;
    const issues = e.metadata?.issues;
    if (!Array.isArray(issues)) continue;
    for (const issue of issues) {
      counts.set(
        issue as RepairIssue,
        (counts.get(issue as RepairIssue) ?? 0) + 1,
      );
    }
  }
  return REPAIR_ISSUES.map((issue) => ({
    issue,
    label: ISSUE_LABELS[issue],
    count: counts.get(issue) ?? 0,
  })).sort((a, b) => b.count - a.count);
}

export type SectionEngagement = { section: string; count: number };

export function sectionEngagement(events: DppEvent[]): SectionEngagement[] {
  const labels: Record<string, string> = {
    care_section_opened: "Care",
    supply_chain_viewed: "Supply chain",
    crosssell_section_viewed: "Cross-sell",
  };
  return SECTION_TYPES.map((key) => ({
    section: labels[key],
    count: events.filter((e) => e.eventType === key).length,
  }));
}

export type TrendPoint = { date: string; views: number; conversions: number };

/** Per-day buckets of views + conversions for the last `days` days. */
export function viewsOverTime(events: DppEvent[], days = 14): TrendPoint[] {
  const dayMs = 86_400_000;
  const now = Date.now();
  const startOfToday = now - (now % dayMs);
  const buckets: TrendPoint[] = [];
  const index = new Map<string, TrendPoint>();

  for (let i = days - 1; i >= 0; i--) {
    const ts = startOfToday - i * dayMs;
    const date = new Date(ts).toISOString().slice(5, 10); // MM-DD
    const point: TrendPoint = { date, views: 0, conversions: 0 };
    buckets.push(point);
    index.set(new Date(ts).toISOString().slice(0, 10), point);
  }

  for (const e of events) {
    const key = new Date(e.timestamp).toISOString().slice(0, 10);
    const point = index.get(key);
    if (!point) continue;
    if (e.eventType === "passport_viewed") point.views += 1;
    else if (CONVERSION_TYPES.includes(e.eventType)) point.conversions += 1;
  }

  return buckets;
}

export type FunnelStage = { stage: string; sessions: number; pct: number };

/**
 * Session-level funnel: viewed → engaged (opened any section) → converted.
 * Percentages are relative to the number of sessions that viewed.
 */
export function funnel(events: DppEvent[]): FunnelStage[] {
  const bySession = new Map<string, Set<EventType>>();
  for (const e of events) {
    let set = bySession.get(e.sessionId);
    if (!set) {
      set = new Set();
      bySession.set(e.sessionId, set);
    }
    set.add(e.eventType);
  }

  let viewed = 0;
  let engaged = 0;
  let converted = 0;
  for (const set of bySession.values()) {
    const didView = set.has("passport_viewed");
    const didEngage = SECTION_TYPES.some((t) => set.has(t));
    const didConvert = CONVERSION_TYPES.some((t) => set.has(t));
    if (didView || didEngage || didConvert) viewed += 1; // count any session
    if (didEngage) engaged += 1;
    if (didConvert) converted += 1;
  }

  const base = viewed || 1;
  return [
    { stage: "Viewed", sessions: viewed, pct: 100 },
    {
      stage: "Engaged a section",
      sessions: engaged,
      pct: (engaged / base) * 100,
    },
    { stage: "Converted", sessions: converted, pct: (converted / base) * 100 },
  ];
}
