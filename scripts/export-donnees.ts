/**
 * NODE.47 — Export des données locales (SQLite) vers un fichier SQL PostgreSQL.
 *
 * Produit : deploiement/02-remplir-avec-mes-donnees.sql
 * Ce fichier est OPTIONNEL à l'installation : il sert à retrouver sur le site
 * en ligne les analyses déjà saisies dans la base locale.
 *
 * Lancement :  bun run scripts/export-donnees.ts
 */
import { PrismaClient } from "@prisma/client";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";

const db = new PrismaClient();

/** Échappe une valeur texte pour un littéral SQL PostgreSQL. */
const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
/** Texte nullable. */
const txt = (v: string | null) => (v === null ? "NULL" : q(v));
/** Horodatage nullable, formaté en UTC sans suffixe de fuseau. */
const ts = (d: Date | null) =>
  d === null ? "NULL" : `'${d.toISOString().slice(0, 23)}'`;
/** Nombre flottant nullable. */
const num = (v: number | null) => (v === null ? "NULL" : String(v));

const PICK_COLUMNS = [
  "id", "sport", "competition", "matchName", "matchDate",
  "scenarioSummary", "keyPoints", "keyStats", "alternativeScenario",
  "market", "selection", "line", "odds", "verdict", "confidence",
  "condition", "synthesis", "status", "result", "resultNote",
  "settledAt", "publishedAt", "createdAt", "updatedAt",
].map((c) => `"${c}"`).join(", ");

async function main() {
  const picks = await db.pick.findMany({ orderBy: { createdAt: "asc" } });
  const subs = await db.newsletterSubscriber.findMany({
    orderBy: { createdAt: "asc" },
  });

  const lines: string[] = [
    "-- =============================================================================",
    "-- NODE.47 — Remplissage de la base avec les données actuelles (OPTIONNEL)",
    "-- À exécuter dans Supabase → SQL Editor, APRÈS 01-creer-les-tables.sql.",
    "-- Si vous préférez partir d'une base vide, ignorez simplement ce fichier.",
    "-- =============================================================================",
    "",
    "-- --------------------------- Analyses (Pick) --------------------------------",
    "",
  ];

  for (const p of picks) {
    const values = [
      q(p.id), q(p.sport), q(p.competition), q(p.matchName), ts(p.matchDate),
      q(p.scenarioSummary), q(p.keyPoints), q(p.keyStats), txt(p.alternativeScenario),
      q(p.market), q(p.selection), txt(p.line), num(p.odds), q(p.verdict),
      q(p.confidence), txt(p.condition), q(p.synthesis), q(p.status), q(p.result),
      txt(p.resultNote), ts(p.settledAt), ts(p.publishedAt), ts(p.createdAt),
      ts(p.updatedAt),
    ].join(", ");
    lines.push(`INSERT INTO "Pick" (${PICK_COLUMNS}) VALUES (${values}) ON CONFLICT DO NOTHING;`);
  }

  lines.push("", "-- ------------------------ Abonnés newsletter --------------------------------", "");

  for (const s of subs) {
    lines.push(
      `INSERT INTO "NewsletterSubscriber" ("id", "email", "createdAt") VALUES (${q(s.id)}, ${q(s.email)}, ${ts(s.createdAt)}) ON CONFLICT DO NOTHING;`,
    );
  }

  lines.push("");
  const out = path.join(process.cwd(), "deploiement", "02-remplir-avec-mes-donnees.sql");
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, lines.join("\n"), "utf8");
  console.log(`Export terminé : ${picks.length} analyse(s), ${subs.length} abonné(s) newsletter.`);
  console.log(`Fichier écrit : ${out}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
