/**
 * Diagnostic — variantes « monde réel » qui cassent le remplissage.
 * Simule des collages tels qu'un analyste les copie depuis ChatGPT/WhatsApp/Word.
 */
import { parseAnalyzeText } from "../src/lib/analyze-import";

let fail = 0;
function check(label: string, cond: boolean, extra?: unknown) {
  if (cond) console.log(`  ✓ ${label}`);
  else {
    fail++;
    console.log(`  ✗ ${label}${extra !== undefined ? ` → ${JSON.stringify(extra)}` : ""}`);
  }
}

/* ---- Variante EMOJI : émojis devant les titres de sections ---- */
const EMOJI = `⚽ NODE.47 — Analyse : Real Madrid vs FC Barcelone

📌 A. MATCH ET CONTEXTE

- Match : Real Madrid vs FC Barcelone
- Sport / compétition : Football / La Liga (Journée 11)
- Date et heure : Dimanche 26 octobre 2026, 21h00 CET (Santiago Bernabéu)

🎯 B. SCÉNARIO SPORTIF

- Équipe supérieure : Real Madrid
- Raisons principales : Attaque en forme historique, + de 3 buts par match à domicile ; Barça fragile en défense hors de son stade.
- Scénario alternatif : Le Barça ouvre le score sur contre-attaque et le match bascule vers un échange ouvert.

📊 C. CONVERGENCE DES PREUVES

- Statistiques et données sportives : Real Madrid 2,8 buts par match à domicile ; xG 2,10 ; H2H 3-1 la saison dernière.

💰 E. MARCHÉ RETENU

- Marché : Over 2,5 buts
- Sélection : Over 2,5
- Cote observée : 1,85

🏆 F. VERDICT NODE.47

JE JOUE — Over 2,5
• Niveau de confiance : ÉLEVÉ

📝 G. SYNTHÈSE NODE.47

Classico très ouvert entre la meilleure attaque et une défense vulnérable en déplacement. Le Over 2,5 est le marché le plus direct.`;

console.log("== Variante ÉMOJIS (collage ChatGPT) ==");
{
  const r = parseAnalyzeText(EMOJI);
  const v = r.values;
  console.log(`  filled: ${r.filled.join(" · ")}`);
  console.log(`  warn: ${r.warnings.slice(0, 4).join(" · ")}`);
  check("affiche Real Madrid vs FC Barcelone", v.matchName === "Real Madrid vs FC Barcelone", v.matchName);
  check("sport FOOTBALL", v.sport === "FOOTBALL", v.sport);
  check("compétition LaLiga", v.competition === "LaLiga", v.competition);
  check("date 26/10/2026", (v.matchDate ?? "").startsWith("2026-10-26T"), v.matchDate);
  check("marché Over 2,5 buts", v.market === "Over 2,5 buts", v.market);
  check("sélection Over 2,5", v.selection === "Over 2,5", v.selection);
  check("cote 1.85", v.odds === "1.85", v.odds);
  check("verdict JE_JOUE", v.verdict === "JE_JOUE", v.verdict);
  check("confiance ELEVE", v.confidence === "ELEVE", v.confidence);
  check("synthèse G", (v.synthesis ?? "").startsWith("Classico"), v.synthesis?.slice(0, 40));
  check("points clés ≥ 2", (v.keyPoints ?? "").split("\n").length >= 2);
}

/* ---- Variante TIRETS LONGS + numérotation mélange ---- */
const MIXTE = `NODE.47 – Analyse : Bayern Munich vs Borussia Dortmund

I. MATCH ET CONTEXTE

Match : Bayern Munich vs Borussia Dortmund
Sport / compétition : Football / Bundesliga (Journée 8)
Date et heure : Samedi 31 octobre 2026, 19h30 CET

II. SCÉNARIO SPORTIF

Équipe supérieure : Bayern Munich
Raisons principales : Domination historique à domicile (Klassiker), attaque la plus prolifique d'Europe.

III. CONVERGENCE DES PREUVES

Statistiques et données sportives : Bayern 3,1 buts par match ; xG 2,30 sur 7 journées.

IV. MARCHÉ RETENU

Marché : Over 3,5 buts
Sélection : Over 3,5
Cote observée : 2,05

V. VERDICT

JE JOUE — Over 3,5
Niveau de confiance : MODÉRÉ`;

console.log("\n== Variante CHIFFRES ROMAINS + pas de gras ==");
{
  const r = parseAnalyzeText(MIXTE);
  const v = r.values;
  console.log(`  filled: ${r.filled.join(" · ")}`);
  check("affiche Bayern vs Dortmund", v.matchName === "Bayern Munich vs Borussia Dortmund", v.matchName);
  check("compétition Bundesliga", v.competition === "Bundesliga", v.competition);
  check("date 31/10/2026", (v.matchDate ?? "").startsWith("2026-10-31T"), v.matchDate);
  check("marché Over 3,5 buts", v.market === "Over 3,5 buts", v.market);
  check("cote 2.05", v.odds === "2.05", v.odds);
  check("confiance MODERE", v.confidence === "MODERE", v.confidence);
}

console.log(`\n${fail === 0 ? "✅ AUCUNE RÉGRESSION DÉTECTÉE" : `❌ ${fail} PROBLÈME(S) RÉEL(S) IDENTIFIÉ(S)`}`);
