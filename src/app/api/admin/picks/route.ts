import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";

/* ---------- Validation ---------- */

const keyStatSchema = z.object({
  label: z.string().min(1).max(120),
  value: z.string().min(1).max(60),
  detail: z.string().max(300).optional(),
});

const pickSchema = z.object({
  sport: z.enum(["FOOTBALL", "BASKETBALL", "TENNIS"]),
  competition: z.string().min(1, "Compétition requise").max(120),
  matchName: z.string().min(1, "Affiche requise").max(160),
  matchDate: z.string().datetime({ offset: true }).or(z.string().min(1)),
  scenarioSummary: z.string().max(4000).default(""),
  expectedScenario: z.string().max(4000).default(""),
  keyPoints: z.array(z.string().max(500)).max(12).default([]),
  keyStats: z.array(keyStatSchema).max(12).default([]),
  alternativeScenario: z.string().max(2000).nullish(),
  market: z.string().max(120).default(""),
  selection: z.string().max(120).default(""),
  line: z.string().max(60).nullish(),
  odds: z.number().min(1).max(1000).nullish(),
  verdict: z.enum(["JE_JOUE", "JE_JOUE_SOUS_CONDITION"]),
  confidence: z.enum(["FAIBLE", "MODERE", "ELEVE", "TRES_ELEVE"]),
  condition: z.string().max(2000).nullish(),
  synthesis: z.string().max(4000).default(""),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  result: z.enum(["PENDING", "WON", "LOST", "PUSH", "VOID"]).default("PENDING"),
  resultNote: z.string().max(300).nullish(),
});

export type PickPayload = z.infer<typeof pickSchema>;

/* ---------- Helpers ---------- */

export function isAdmin(request: NextRequest): boolean {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}

/* ---------- GET : liste complète (console analyste) ---------- */

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const picks = await db.pick.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ picks });
}

/* ---------- POST : création ---------- */

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = pickSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstError ? firstError.message : "Données invalides." },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const matchDate = new Date(data.matchDate);
  if (Number.isNaN(matchDate.getTime())) {
    return NextResponse.json({ error: "Date du match invalide." }, { status: 400 });
  }

  const pick = await db.pick.create({
    data: {
      sport: data.sport,
      competition: data.competition,
      matchName: data.matchName,
      matchDate,
      scenarioSummary: data.scenarioSummary,
      expectedScenario: data.expectedScenario,
      keyPoints: JSON.stringify(data.keyPoints),
      keyStats: JSON.stringify(data.keyStats),
      alternativeScenario: data.alternativeScenario || null,
      market: data.market,
      selection: data.selection,
      line: data.line || null,
      odds: data.odds ?? null,
      verdict: data.verdict,
      confidence: data.confidence,
      condition: data.condition || null,
      synthesis: data.synthesis,
      status: data.status,
      result: data.result,
      resultNote: data.resultNote || null,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      settledAt: ["WON", "LOST", "PUSH", "VOID"].includes(data.result) ? new Date() : null,
    },
  });

  return NextResponse.json({ pick }, { status: 201 });
}
