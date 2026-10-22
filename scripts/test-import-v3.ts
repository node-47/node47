/**
 * Test parseur v3 — robustesse étendue :
 *  RÉGRESSION : les 3 formats réels v1/v2 doivent toujours passer (portage test-import-v2)
 *  NOUVEAUX CAS :
 *   4. Valencia variante — date numérique 17/10/2026, « Confiance : » sans « niveau de »
 *   5. Sections numérotées « 1. 2. 3. » sans lettres
 *   6. Collage plat sans aucune section (labels seuls, multi-lignes)
 *   7. « Pronostic : » comme sélection + « Compétition : » sans ligne « Sport : »
 *   8. « Marché : Under 2,5 » → sélection déduite du marché
 */
import { parseAnalyzeText } from "../src/lib/analyze-import";

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, extra?: string) {
  if (cond) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    console.log(`  ✗ ${name}${extra ? ` — ${extra}` : ""}`);
  }
}

/* ------------------------------------------------------------------ */
/* CAS 4 — date numérique + confiance sans préfixe                     */
/* ------------------------------------------------------------------ */
console.log("\n== Cas 4 : Valencia variante (date numérique, Confiance :) ==");
const VALENCIA_V2 = `**A. MATCH ET CONTEXTE**

- Match : Valencia vs Athletic Bilbao
- Sport / compétition : Football / La Liga (Journée 9)
- Date : 17/10/2026 à 20h00 (Mestalla)

**B. SCÉNARIO SPORTIF**

- Équipe supérieure : Athletic Bilbao
- Raisons principales : Meilleure solidité défensive, qualité collective supérieure. Valencia est en grande difficulté offensive.

**E. MARCHÉ RETENU**

- Marché : Under (total de buts)
- Sélection : Under 2,5
- Cote : 1,70

**F. VERDICT**

**JE JOUE — Under 2,5**

Confiance : Élevé
`;
{
  const r = parseAnalyzeText(VALENCIA_V2);
  check("date numérique 17/10/2026 → 2026-10-17T18:00 (CEST→UTC->local)", (r.values.matchDate ?? "").includes("-10-17"), r.values.matchDate);
  check("sport FOOTBALL", r.values.sport === "FOOTBALL", r.values.sport);
  check("compétition LaLiga", r.values.competition === "LaLiga", r.values.competition);
  check("marché Under (total de buts)", r.values.market === "Under (total de buts)", r.values.market);
  check("sélection Under 2,5", r.values.selection === "Under 2,5", r.values.selection);
  check("cote 1.70", r.values.odds === "1.70", r.values.odds);
  check("confiance ELEVE sans préfixe « niveau de »", r.values.confidence === "ELEVE", r.values.confidence);
}

/* ------------------------------------------------------------------ */
/* CAS 5 — sections numérotées sans lettres                            */
/* ------------------------------------------------------------------ */
console.log("\n== Cas 5 : sections numérotées « 1. 2. 3. » ==");
const NUMBERED = `Analyse : Bayern vs Dortmund

1. MATCH ET CONTEXTE

- Match : Bayern Munich vs Borussia Dortmund
- Sport / compétition : Football / Bundesliga
- Date : 21 novembre 2026, 18h30 CET

2. SCÉNARIO SPORTIF

- Équipe supérieure : Bayern Munich
- Raisons principales : Profondeur d'effectif, forme à domicile, efficacité offensive nettement supérieure.

3. CONVERGENCE DES PREUVES

- Statistiques : xG domicile 2,4 par match sur les 6 dernières rencontres.

4. COMPARAISON DES MARCHÉS

1X2 : Bayern favori autour de 1,45. Over 2,5 autour de 1,55.

5. MARCHÉ RETENU

- Marché : Vainqueur du match
- Sélection : Bayern Munich
- Cote : environ 1.45

6. VERDICT

**JE JOUE — Bayern Munich**

Niveau de confiance : ÉLEVÉ

7. SYNTHÈSE

Le Bayern enchaîne à domicile ; la profondeur d'effectif fait la différence face à une Dortmund irrégulière.
`;
{
  const r = parseAnalyzeText(NUMBERED);
  check("affiche", (r.values.matchName ?? "").includes("Bayern Munich vs Borussia"), r.values.matchName);
  check("sport FOOTBALL", r.values.sport === "FOOTBALL", r.values.sport);
  check("compétition Bundesliga", r.values.competition === "Bundesliga", r.values.competition);
  check("date 21 novembre 2026 reconnue", (r.values.matchDate ?? "").includes("-11-21"), r.values.matchDate);
  check("marché Vainqueur du match", r.values.market === "Vainqueur du match", r.values.market);
  check("sélection Bayern Munich", r.values.selection === "Bayern Munich", r.values.selection);
  check("cote 1.45", r.values.odds === "1.45", r.values.odds);
  check("confiance ELEVE", r.values.confidence === "ELEVE", r.values.confidence);
  check("verdict JE_JOUE", r.values.verdict === "JE_JOUE", r.values.verdict);
  check("synthèse G captée", (r.values.synthesis ?? "").length > 40, r.values.synthesis?.slice(0, 40));
}

/* ------------------------------------------------------------------ */
/* CAS 6 — collage plat, aucune section                                */
/* ------------------------------------------------------------------ */
console.log("\n== Cas 6 : collage plat sans sections ==");
const FLAT = `Real Madrid vs FC Barcelone
Sport : Football / El Clásico
Compétition : LaLiga
Date : 29/11/2026 à 21h00 CET
Stade : Santiago Bernabéu
Marché : Total de buts
Sélection : Over 2,5
Cote : 1.85
Verdict : JE JOUE
Niveau de confiance : TRÈS ÉLEVÉ
Les deux équipes produisent un volume offensif très élevé depuis la reprise, avec des défenses friables sur transitions.
`;
{
  const r = parseAnalyzeText(FLAT);
  check("affiche Real Madrid vs FC Barcelone", (r.values.matchName ?? "").includes("Real Madrid"), r.values.matchName);
  check("compétition LaLiga (dictionnaire)", r.values.competition === "LaLiga", r.values.competition);
  check("sport FOOTBALL", r.values.sport === "FOOTBALL", r.values.sport);
  check("date 29/11/2026 reconnue", (r.values.matchDate ?? "").includes("-11-29"), r.values.matchDate);
  check("marché Total de buts", r.values.market === "Total de buts", r.values.market);
  check("sélection Over 2,5", r.values.selection === "Over 2,5", r.values.selection);
  check("cote 1.85", r.values.odds === "1.85", r.values.odds);
  check("verdict JE_JOUE (repli)", r.values.verdict === "JE_JOUE", r.values.verdict);
  check("confiance TRES_ELEVE (repli)", r.values.confidence === "TRES_ELEVE", r.values.confidence);
  check("scénario non vide", (r.values.scenarioSummary ?? "").length > 20, r.values.scenarioSummary?.slice(0, 40));
  check("scénario SANS lignes de champs", !/[•]\s*(Sport|Date|Marché|Sélection|Cote)\s*:/.test(r.values.scenarioSummary ?? ""), r.values.scenarioSummary?.slice(0, 80));
  check("scénario garde la narration", (r.values.scenarioSummary ?? "").includes("volume offensif"), r.values.scenarioSummary?.slice(0, 60));
  check("points clés SANS affiche « vs »", !(r.values.keyPoints ?? "").includes("vs"), r.values.keyPoints);
  check("synthèse finale NON remplie par tout le texte", !r.values.synthesis, r.values.synthesis?.slice(0, 60));
}

/* ------------------------------------------------------------------ */
/* CAS 7 — « Pronostic : » + « Compétition : » sans « Sport : »        */
/* ------------------------------------------------------------------ */
console.log("\n== Cas 7 : Pronostic + Compétition sans Sport ==");
const NOPORT = `A. MATCH ET CONTEXTE

Match : Alcaraz vs Sinner
Compétition : ATP Masters 1000 Paris
Date : 2 novembre 2026, 15h00

B. SCÉNARIO SPORTIF

- Raisons principales : Alcaraz en meilleure forme sur indoor cette saison, service plus solide en moments clés.

E. MARCHÉ RETENU

Pronostic : Alcaraz
Cote : 1.75

F. VERDICT

JE JOUE
Niveau de confiance : Modéré
`;
{
  const r = parseAnalyzeText(NOPORT);
  check("sport TENNIS via compétition", r.values.sport === "TENNIS", r.values.sport);
  check("compétition ATP Masters 1000", r.values.competition === "ATP Masters 1000", r.values.competition);
  check("sélection Alcaraz via « Pronostic »", r.values.selection === "Alcaraz", r.values.selection);
  check("cote 1.75", r.values.odds === "1.75", r.values.odds);
  check("confiance MODERE", r.values.confidence === "MODERE", r.values.confidence);
}

/* ------------------------------------------------------------------ */
/* CAS 8 — « Marché : Under 2,5 » → sélection déduite                  */
/* ------------------------------------------------------------------ */
console.log("\n== Cas 8 : marché compact sans sélection explicite ==");
const COMPACT = `Match : Ajax vs PSV
Sport : Football / Eredivisie
Date : 8 février 2027, 14h30 UTC
Marché : Under 2,5
Cote : 1.90
Verdict : JE JOUE
Niveau de confiance : Faible
Les deux équipes manquent de rythme offensif, le match s'annonce fermé et tactique avec peu d'occasions franches.
`;
{
  const r = parseAnalyzeText(COMPACT);
  check("marché Under 2,5", r.values.market === "Under 2,5", r.values.market);
  check("sélection déduite = Under 2,5", r.values.selection === "Under 2,5", r.values.selection);
  check("warning sélection déduite", r.warnings.some((w) => w.includes("sélection déduite")), r.warnings.join("|"));
  check("compétition Eredivisie", r.values.competition === "Eredivisie", r.values.competition);
  check("date 8 février 2027", (r.values.matchDate ?? "").includes("-02-08"), r.values.matchDate);
  check("synthèse finale NON remplie par tout le texte", !r.values.synthesis, r.values.synthesis?.slice(0, 60));
}

console.log(`\n========================================`);
console.log(`RÉSULTAT : ${pass} OK / ${fail} ÉCHEC(S)`);
console.log(fail === 0 ? "✅ TOUS LES TESTS V3 PASSENT" : "❌ CORRIGER LES ÉCHECS");
process.exit(fail === 0 ? 0 : 1);
