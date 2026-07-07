import { describe, expect, it } from "vitest";
import {
  isValidEventType,
  isValidPassportId,
  isValidRepairIssue,
  PASSPORT_IDS,
  passportLabel,
  passportShort,
  resolveRevenue,
} from "@/lib/events";

describe("resolveRevenue", () => {
  it("uses the fixed table for repair and resale", () => {
    expect(resolveRevenue("repair_requested")).toBe(20);
    expect(resolveRevenue("resale_clicked")).toBe(12);
  });

  it("looks up cross-sell revenue by productId", () => {
    expect(
      resolveRevenue("crosssell_purchase_clicked", {
        productId: "block-heel-mule",
      }),
    ).toBe(190);
    expect(
      resolveRevenue("crosssell_purchase_clicked", {
        productId: "plume-mini-skirt",
      }),
    ).toBe(120);
  });

  it("returns undefined for unknown products and non-conversion events", () => {
    expect(
      resolveRevenue("crosssell_purchase_clicked", { productId: "mystery" }),
    ).toBeUndefined();
    expect(resolveRevenue("crosssell_purchase_clicked")).toBeUndefined();
    expect(resolveRevenue("passport_viewed")).toBeUndefined();
  });
});

describe("validators", () => {
  it("validates passport ids against the fixed set", () => {
    expect(isValidPassportId(PASSPORT_IDS[0])).toBe(true);
    expect(isValidPassportId("not-a-real-id")).toBe(false);
    expect(isValidPassportId(123)).toBe(false);
  });

  it("validates event types", () => {
    expect(isValidEventType("repair_requested")).toBe(true);
    expect(isValidEventType("nope")).toBe(false);
  });

  it("validates repair issues", () => {
    expect(isValidRepairIssue("torn_seam")).toBe(true);
    expect(isValidRepairIssue("banana")).toBe(false);
  });
});

describe("labels", () => {
  it("maps ids to friendly unit labels", () => {
    expect(passportLabel(PASSPORT_IDS[0])).toBe("Unit 001");
    expect(passportLabel(PASSPORT_IDS[4])).toBe("Unit 005");
    expect(passportLabel("unknown")).toBe("Unknown");
  });

  it("shortens ids for subtitles", () => {
    expect(passportShort(PASSPORT_IDS[0])).toBe(PASSPORT_IDS[0].slice(0, 8));
    expect(passportShort(PASSPORT_IDS[0])).toHaveLength(8);
  });
});
