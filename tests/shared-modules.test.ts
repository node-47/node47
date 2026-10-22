/// <reference types="bun-types" />
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { Glob } from "bun";
import { db } from "../src/lib/db";
import { cn } from "../src/lib/utils";
import { truncateForMeta } from "../src/lib/site";
import { decodePick, editionDayOf, editionCalendarDays, editionWindow, isInTrackingWindow, trackingWindowStart, summarize, unitsProfit } from "../src/lib/picks";
import type { picks } from "../db/schema";

const pick = (overrides: Partial<typeof picks.$inferSelect> = {}): typeof picks.$inferSelect => ({
  id: "test", sport: "FOOTBALL", competition: "Test", matchName: "A vs B", matchDate: new Date("2026-10-22T19:00:00Z"),
  scenarioSummary: "", keyPoints: "[]", keyStats: "[]", alternativeScenario: null, market: "", selection: "", line: null,
  odds: 1.92, verdict: "JE_JOUE", confidence: "ELEVE", condition: null, synthesis: "", status: "PUBLISHED", result: "WON",
  resultNote: null, settledAt: new Date("2026-10-22T21:00:00Z"), publishedAt: new Date("2026-10-22T08:00:00Z"),
  createdAt: new Date(), updatedAt: new Date(), ...overrides,
});

describe("deploy module resolution", () => {
  test("every source alias points to an existing module", () => {
    for (const file of new Glob("src/**/*.{ts,tsx}").scanSync()) {
      const source = readFileSync(file, "utf8");
      for (const match of source.matchAll(/["'](@\/[^"']+)["']/g)) {
        const path = match[1].replace("@/", "src/");
        expect([path, `${path}.ts`, `${path}.tsx`, `${path}/index.ts`, `${path}/index.tsx`].some(existsSync)).toBe(true);
      }
    }
  });
  test("database imports without opening a connection", () => {
    expect(typeof db.pick.findMany).toBe("function");
    expect(typeof db.newsletterSubscriber.create).toBe("function");
  });
});

test("edition rollover occurs at 08:00 UTC and spans three days", () => {
  expect(editionDayOf("2026-10-22T07:59:59Z").toISOString()).toBe("2026-10-21T00:00:00.000Z");
  expect(editionDayOf("2026-10-22T08:00:00Z").toISOString()).toBe("2026-10-22T00:00:00.000Z");
  const days = editionCalendarDays(3, new Date("2026-10-22T09:00:00Z"));
  expect(days.map((d) => d.getUTCDate())).toEqual([22, 21, 20]);
  expect(editionWindow(days[2]).start.toISOString()).toBe("2026-10-20T08:00:00.000Z");
});

test("performance weights stakes and excludes drafts, refunds and voids", () => {
  expect(unitsProfit(pick())).toBeCloseTo(1.38);
  expect(unitsProfit(pick({ confidence: "FAIBLE", result: "LOST" }))).toBe(-0.5);
  expect(unitsProfit(pick({ result: "PENDING" }))).toBeNull();
  const summary = summarize([pick(), pick({ confidence: "FAIBLE", result: "LOST" }), pick({ result: "VOID" }), pick({ result: "PUSH" }), pick({ status: "DRAFT" })]);
  expect(summary.settledCount).toBe(2);
  expect(summary.staked).toBe(2);
  expect(summary.units).toBeCloseTo(0.88);
  expect(summary.roi).toBeCloseTo(44);
  expect(summary.winRate).toBe(50);
});

test("tracking uses settlement for settled picks and publication for pending picks", () => {
  const from = trackingWindowStart(new Date("2026-10-22T12:00:00Z"));
  expect(from.toISOString()).toBe("2026-09-23T00:00:00.000Z");
  expect(isInTrackingWindow(pick({ publishedAt: new Date("2026-09-01") }), from)).toBe(true);
  expect(isInTrackingWindow(pick({ result: "PENDING", publishedAt: new Date("2026-09-22T23:59:59Z") }), from)).toBe(false);
});

test("malformed analysis JSON fails safely", () => {
  expect(decodePick(pick({ keyPoints: "invalid", keyStats: "{}" })).keyPoints).toEqual([]);
  expect(decodePick(pick({ keyPoints: '["Point",42]', keyStats: '[{"label":"Shots","value":"12"},null]' })).keyStats).toEqual([{ label: "Shots", value: "12" }]);
});

test("shared formatting resolves utility classes and bounds metadata", () => {
  expect(cn("px-2", false, "px-4")).toBe("px-4");
  expect(truncateForMeta("a".repeat(200))).toHaveLength(158);
});
