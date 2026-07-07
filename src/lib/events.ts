// Canonical analytics event model + shared constants. Safe to import from both
// server (API route, seed script) and client (tracking components).

export const PASSPORT_IDS = [
  "51fadda5-a86b-402c-b5a7-b9dd894fb569",
  "8b3c1d2e-4f5a-4b6c-9d7e-1a2b3c4d5e6f",
  "c2d4e6f8-1a3b-4c5d-8e9f-0a1b2c3d4e5f",
  "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "f9e8d7c6-b5a4-4938-a7b6-c5d4e3f2a1b0",
] as const;

export type PassportId = (typeof PASSPORT_IDS)[number];

export const EVENT_TYPES = [
  "passport_viewed",
  "care_section_opened",
  "supply_chain_viewed",
  "crosssell_section_viewed",
  "repair_requested",
  "resale_clicked",
  "crosssell_purchase_clicked",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const REPAIR_ISSUES = [
  "snagged_thread",
  "hole_in_knit",
  "torn_seam",
  "stretched_out_of_shape",
  "stain",
  "other",
] as const;

export type RepairIssue = (typeof REPAIR_ISSUES)[number];

/** Maps the repair modal's display labels to canonical enum slugs. */
export const REPAIR_ISSUE_SLUG: Record<string, RepairIssue> = {
  "Snagged thread": "snagged_thread",
  "Hole in knit": "hole_in_knit",
  "Torn seam": "torn_seam",
  "Stretched out of shape": "stretched_out_of_shape",
  Stain: "stain",
  Other: "other",
};

export type EventMetadata = Record<string, string | number | string[]>;

export type DppEvent = {
  id: string; // uuid, stamped server-side
  passportId: string;
  eventType: EventType;
  timestamp: number; // ms epoch, stamped server-side
  sessionId: string;
  revenue?: number; // resolved server-side, never trusted from client
  metadata?: EventMetadata; // e.g. { issues: [...] } | { productId: "..." }
};

/** Fixed revenue for conversion events with a flat value. */
export const FIXED_REVENUE: Partial<Record<EventType, number>> = {
  repair_requested: 20,
  resale_clicked: 12,
};

/** Cross-sell revenue = the item's displayed price, keyed by productId. */
export const CROSSSELL_REVENUE: Record<string, number> = {
  "plume-mini-skirt": 120,
  "block-heel-mule": 190,
  "knitwear-care-kit": 34,
};

/** Human-friendly label for a passport UUID, e.g. "Unit 001". */
export function passportLabel(id: string): string {
  const index = (PASSPORT_IDS as readonly string[]).indexOf(id);
  return index >= 0 ? `Unit ${String(index + 1).padStart(3, "0")}` : "Unknown";
}

/** Short form of a passport UUID for subtitles. */
export function passportShort(id: string): string {
  return id.slice(0, 8);
}

export function isValidPassportId(id: unknown): id is PassportId {
  return (
    typeof id === "string" && (PASSPORT_IDS as readonly string[]).includes(id)
  );
}

export function isValidEventType(t: unknown): t is EventType {
  return (
    typeof t === "string" && (EVENT_TYPES as readonly string[]).includes(t)
  );
}

export function isValidRepairIssue(i: unknown): i is RepairIssue {
  return (
    typeof i === "string" && (REPAIR_ISSUES as readonly string[]).includes(i)
  );
}

/**
 * Server-authoritative revenue. Clients never send revenue; it is resolved here
 * so a visitor cannot spoof it via devtools.
 */
export function resolveRevenue(
  eventType: EventType,
  metadata?: EventMetadata,
): number | undefined {
  if (eventType === "crosssell_purchase_clicked") {
    const productId = metadata?.productId;
    if (typeof productId === "string") return CROSSSELL_REVENUE[productId];
    return undefined;
  }
  return FIXED_REVENUE[eventType];
}
