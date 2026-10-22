import { parseAnalyzeText } from "../src/lib/analyze-import";

const sample = `NODE.47 — Analyse : FC Porto vs PSV Eindhoven

A. MATCH ET CONTEXTE
• Match : FC Porto vs PSV Eindhoven
• Sport / compétition : Football — UEFA Champions League, phase de ligue, journée 3
• Date et heure : mardi 20 octobre 2026, 21h00 CET, Estádio do Dragão (Porto, 50 033 places) — arbitre : Daniel Siebert
• État des informations : actuelles (compositions probables vérifiées le jour du match)

B. SCÉNARIO SPORTIF
• Équipe supérieure : FC Porto, dans ce contexte précis.
• Raisons principales :
  - Forme nationale écrasante : 8 victoires en 8 matches de Primeira Liga, 5 points d'avance en tête.
  - Domination à domicile : 6 victoires sur les 7 derniers matches compétitifs au Dragão.
  - Effectif du PSV décimé : Pepi, Wanner, Lammers absents ; l'axe offensif est remanié.
  - PSV en mauvaise dynamique : 2 défaites consécutives toutes compétitions.
• Scénario attendu : victoire de Porto avec buts des deux côtés possible (2-1 projeté par WhoScored).
• Scénario alternatif : nul — le PSV reste champion des Pays-Bas avec du talent offensif.
• Facteurs susceptibles de modifier la lecture : première titularisation possible de Samu Omorodion ; retour de Bednarek en charnière ; statut de Guus Til à l'heure du match.

C. CONVERGENCE DES PREUVES
• Statistiques : Porto marque en moyenne 2,33 buts/match (3,83 buts totaux par match), 83 % de ses matches en +2,5 buts ; PSV : 3 buts totaux/match, 50 % de +2,5. Les 5 derniers matches de Porto : +2,5 et BTTS à chaque fois.
• Forme et contexte : Porto sur 5 victoires (14-7) ; PSV sur W-L-W-L-L (7-9).
• Marché observé : Porto 1.50–1.57, nul ~4.60, PSV 5.75–5.90 ; AH Porto -1 à 1.825.

D. COMPARAISON DES MARCHÉS

1X2 — Porto @ 1.50
• Compatibilité : totale avec le scénario central.
• Risque : 0 point en C1, cote basse.

E. MARCHÉ RETENU
• Marché : Handicap asiatique
• Sélection : FC Porto -1
• Ligne : -1 (remboursement sur victoire d'un but exact)
• Cote observée : 1.825
• Pourquoi ce marché : meilleur véhicule du scénario « domination de Porto contre un PSV amputé ».

F. VERDICT NODE.47

JE JOUE — FC Porto -1 (handicap asiatique) @ 1.825

• Niveau de confiance : ÉLEVÉ.
• Raisons déterminantes : (1) infirmerie massive du PSV ; (2) convergence forme + modèles + marché ; (3) la ligne -1 protège le scénario de victoire courte.
• Principale limite : Porto reste sur 2 défaites en C1 avec 1 but marqué.

Rappel : un niveau de confiance élevé ne garantit ni le résultat ni la rentabilité.

Sources : Sofascore WhoScored Wincomparator`;

const r = parseAnalyzeText(sample);
console.log("=== CHAMPS REMPLIS ==="); console.log(r.filled.join(", "));
console.log("=== AVERTISSEMENTS ==="); console.log(r.warnings.join("\n") || "(aucun)");
console.log("=== ERREURS ==="); console.log(r.parseErrors.join("\n") || "(aucune)");
console.log("=== VALEURS ===");
for (const [k, v] of Object.entries(r.values)) {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  console.log(`-- ${k}: ${s.length > 140 ? s.slice(0, 140) + "…" : s}`);
}
