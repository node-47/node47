import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";

const SETTLED = ["WON", "LOST", "PUSH", "VOID"];

const updateSchema = z.object({
  sport: z.enum(["FOOTBALL", "BASKETBALL", "TENNIS"]).optional(),
  competition: z.string().min(1).max(120).optional(),
  matchName: z.string().min(1).max(160).optional(),
  matchDate: z.string().optional(),
  scenarioSummary: z.string().max(4000).optional(),
  expectedScenario: z.string().max(4000).optional(),
  keyPoints: z.array(z.string().max(500)).max(12).optional(),
  keyStats: z
    .array(
      z.object({
        label: z.string().min(1).max(120),
        value: z.string().min(1).max(60),
        detail: z.string().max(300).optional(),
      })
    )
    .max(12)
    .optional(),
  alternativeScenario: z.string().max(2000).nullish(),
  market: z.string().max(120).optional(),
  selection: z.string().max(120).optional(),
  line: z.string().max(60).nullish(),
  odds: z.number().min(1).max(1000).nullish(),
  verdict: z.enum(["JE_JOUE", "JE_JOUE_SOUS_CONDITION"]).optional(),
  confidence: z.enum(["FAIBLE", "MODERE", "ELEVE", "TRES_ELEVE"]).optional(),
  condition: z.string().max(2000).nullish(),
  synthesis: z.string().max(4000).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  result: z.enum(["PENDING", "WON", "LOST", "PUSH", "VOID"]).optional(),
  resultNote: z.string().max(300).nullish(),
});

function isAdmin(request: NextRequest): boolean {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await db.pick.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Analyse introuvable." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstError ? firstError.message : "Données invalides." },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const update: Record<string, unknown> = {};

  if (data.sport !== undefined) update.sport = data.sport;
  if (data.competition !== undefined) update.competition = data.competition;
  if (data.matchName !== undefined) update.matchName = data.matchName;
  if (data.matchDate !== undefined) {
    const d = new Date(data.matchDate);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: "Date du match invalide." }, { status: 400 });
    }
    update.matchDate = d;
  }
  if (data.scenarioSummary !== undefined) update.scenarioSummary = data.scenarioSummary;
  if (data.expectedScenario !== undefined) update.expectedScenario = data.expectedScenario;
  if (data.keyPoints !== undefined) update.keyPoints = JSON.stringify(data.keyPoints);
  if (data.keyStats !== undefined) update.keyStats = JSON.stringify(data.keyStats);
  if (data.alternativeScenario !== undefined)
    update.alternativeScenario = data.alternativeScenario || null;
  if (data.market !== undefined) update.market = data.market;
  if (data.selection !== undefined) update.selection = data.selection;
  if (data.line !== undefined) update.line = data.line || null;
  if (data.odds !== undefined) update.odds = data.odds ?? null;
  if (data.verdict !== undefined) update.verdict = data.verdict;
  if (data.confidence !== undefined) update.confidence = data.confidence;
  if (data.condition !== undefined) update.condition = data.condition || null;
  if (data.synthesis !== undefined) update.synthesis = data.synthesis;
  if (data.resultNote !== undefined) update.resultNote = data.resultNote || null;

  // Statut : horodater la première publication
  if (data.status !== undefined) {
    update.status = data.status;
    if (data.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      update.publishedAt = new Date();
    }
  }

  // Résultat : horodater le règlement
  if (data.result !== undefined) {
    update.result = data.result;
    const wasSettled = SETTLED.includes(existing.result);
    const willBeSettled = SETTLED.includes(data.result);
    if (willBeSettled && !wasSettled) update.settledAt = new Date();
    if (!willBeSettled) update.settledAt = null;
  }

  const pick = await db.pick.update({ where: { id }, data: update });
  return NextResponse.json({ pick });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const { id } = await context.params;
  const existing = await db.pick.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Analyse introuvable." }, { status: 404 });
  }
  await db.pick.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
