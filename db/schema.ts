import { randomUUID } from "node:crypto";
import { pgTable, text, timestamp, doublePrecision } from "drizzle-orm/pg-core";

export const picks = pgTable("picks", {
  id: text("id").primaryKey().$defaultFn(randomUUID),
  sport: text("sport").notNull(),
  competition: text("competition").notNull(),
  matchName: text("match_name").notNull(),
  matchDate: timestamp("match_date", { withTimezone: true }).notNull(),
  scenarioSummary: text("scenario_summary").notNull().default(""),
  keyPoints: text("key_points").notNull().default("[]"),
  keyStats: text("key_stats").notNull().default("[]"),
  alternativeScenario: text("alternative_scenario"),
  market: text("market").notNull().default(""),
  selection: text("selection").notNull().default(""),
  line: text("line"),
  odds: doublePrecision("odds"),
  verdict: text("verdict").notNull().default("JE_JOUE"),
  confidence: text("confidence").notNull().default("MODERE"),
  condition: text("condition"),
  synthesis: text("synthesis").notNull().default(""),
  status: text("status").notNull().default("DRAFT"),
  result: text("result").notNull().default("PENDING"),
  resultNote: text("result_note"),
  settledAt: timestamp("settled_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: text("id").primaryKey().$defaultFn(randomUUID),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
