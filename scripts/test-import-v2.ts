/**
 * Test du parseur d'import — 3 formats réels :
 *  1. Valencia vs Athletic Bilbao (puces « - », gras markdown, section G, cote en plage)
 *  2. Zverev vs Davidovich Fokina (gras markdown, séparateur « – », confiance « MODÉRÉ à ÉLEVÉ »)
 *  3. FC Porto vs PSV (style historique : puces « • », listes imbriquées, cote décimale)
 */
import { parseAnalyzeText } from "../src/lib/analyze-import";

const VALENCIA = `**A. MATCH ET CONTEXTE**

- Match : Valencia vs Athletic Bilbao  
- Sport / compétition : Football / La Liga (Journée 9)  
- Date et heure : Samedi 17 octobre 2026, environ 20h00-21h00 CEST (Mestalla)  
- État des informations : Actuelles (préviews du 15-16 octobre, statistiques de saison à jour, cotes disponibles, absences confirmées).  

**B. SCÉNARIO SPORTIF**

- Équipe supérieure : Athletic Bilbao  
- Raisons principales : Meilleure solidité défensive (6 buts encaissés en 6 matchs, parmi les meilleures de la ligue), qualité collective supérieure malgré absences, meilleure capacité à contrôler les matchs et à limiter les occasions adverses. Valencia est en grande difficulté offensive (6 buts en 8 matchs, xG faible) et n'a toujours pas gagné à domicile (0V-1N-3D, 2 buts marqués / 9 encaissés). Le changement d'entraîneur (Javier Aguirre) est trop récent pour transformer immédiatement les problèmes structurels.  
- Scénario attendu : Match fermé, faible volume de buts. Athletic impose son organisation et sa solidité, limite Valencia, et cherche à gagner par la marge minimale ou à obtenir au moins un résultat positif.  
- Scénario alternatif : Empate 0-0 ou 1-1 si Valencia parvient à rester compacte et si les absences offensives d'Athletic (Sancet, Nico Williams) freinent trop leur production.  
- Facteurs susceptibles de modifier la lecture : Confirmation de la disponibilité de Laporte pour Athletic ; impact réel du nouveau coach Aguirre sur l'intensité et l'organisation de Valencia ; efficacité des coups de pied arrêtés.  

**C. CONVERGENCE DES PREUVES**

- Statistiques et données sportives : Valencia affiche un xG faible (~0,98-1,13 par match) et un xGA élevé (~1,5-1,8). Athletic produit davantage d'xG (~1,5-1,6) pour un xGA plus bas (~1,1-1,4) et conserve mieux. Valencia a échoué à marquer dans 50 % de ses matchs et encaissé beaucoup à domicile.  
- Forme et contexte : Valencia 1V-2N-5D, dernière place. Athletic 2V-2N-2D, 10e, avec une dynamique plus stable et une défense plus fiable.  
- Compositions / blessures : Valencia sans Sadiq (meilleur buteur), Canós et Diego López ; Rioja et Foulquier douteux. Athletic sans Sancet et Nico Williams ; Laporte en test de fitness. Les absences offensives d'Athletic sont importantes, mais leur structure défensive reste plus solide.  
- Modèles prédictifs : Les prévisions accessibles (Sports Mole, The Stats Zone, Eurosport, etc.) convergent vers un match bas en buts (souvent 0-1 ou 1-1). Peu de modèles donnent une large domination.  
- Confrontations tactiques : Athletic mieux armé pour contrôler le rythme et les transitions. Valencia en reconstruction sous Aguirre, avec des problèmes de conversion et de solidité.  
- Marché et prix : Athletic est le léger favori (cotes 1X2 autour de 2,20-2,50 pour Athletic, 3,10-3,40 Valencia, 3,20-3,40 nul). Asian Handicap autour de Athletic -0,25. Totaux autour de 2,25/2,5 avec Under favorisé.  

Convergence nette vers un scénario de match serré et bas en buts, avec un avantage structurel pour Athletic. Contradiction principale : les absences offensives d'Athletic limitent leur potentiel de domination nette.  

**D. COMPARAISON DES MARCHÉS**

1. **Asian Handicap**  
   - Ligne typique : Athletic -0,25 / Valencia +0,25  
   - Compatibilité : Bonne. Traduit l'avantage d'Athletic sans exiger une large marge.  
   - Argument : Athletic est supérieur et plus solide ; la ligne protège partiellement en cas de nul.  
   - Risque : Match très serré ou absence de but peut faire perdre la moitié de la mise.  

2. **Over/Under**  
   - Ligne typique : Under 2,5 ou Under 2,25  
   - Compatibilité : Très bonne. Les deux équipes sont parmi les moins productives offensivement, Valencia très faible à domicile, Athletic défensivement solide.  
   - Argument : Volume de buts attendu faible, styles et absences favorisent un match fermé.  
   - Risque : Un match ouvert sous l'effet du nouveau coach ou d'une erreur individuelle.  

3. **BTTS**  
   - BTTS Non  
   - Compatibilité : Correcte. Valencia marque peu, Athletic peut garder sa cage.  
   - Argument : Faible capacité offensive de Valencia + solidité relative d'Athletic.  
   - Risque : Athletic marque et Valencia trouve un coup de pied arrêté.  

4. **1X2**  
   - Athletic ou Double chance Athletic/Nul  
   - Compatibilité : Moyenne. Athletic est favori mais la marge de victoire n'est pas claire.  
   - Argument : Supériorité structurelle.  
   - Risque : Empate très probable dans ce contexte.  

Les marchés les plus cohérents avec le scénario sont l'Under et l'AH Athletic léger. Le 1X2 pur est moins précis car le match peut facilement finir nul.  

**E. MARCHÉ RETENU**

- Marché : Under (total de buts)  
- Sélection : Under 2,5  
- Ligne si disponible : Under 2,5 (ou Under 2,25 si disponible et mieux cotée)  
- Cote observée : Autour de 1,70-1,85 selon bookmakers (Under 2,5) ; N/D pour certaines lignes précises asiatiques.  
- Pourquoi ce marché : Il traduit directement le scénario principal (match fermé, faible production offensive des deux côtés, solidité défensive d'Athletic, difficultés de Valencia à marquer). Il est moins exposé au risque de nul ou de marge minimale qu'un handicap trop ambitieux.  

**F. VERDICT NODE.47**

**JE JOUE — Under 2,5**

- Niveau de confiance : **MODÉRÉ**  
- Raisons déterminantes :  
  1. Valencia très faible offensivement et à domicile (0 victoire, 2 buts marqués en 4 matchs).  
  2. Athletic parmi les défenses les plus solides de la ligue, même avec absences offensives.  
  3. Convergence des données xG, forme et prévisions vers un match bas en buts.  
- Principale limite : Absences offensives d'Athletic (Sancet + Nico Williams) et effet possible du nouveau coach Aguirre sur l'intensité de Valencia.  

**G. SYNTHÈSE NODE.47**

Athletic Bilbao est supérieur par sa solidité défensive, son organisation et sa qualité collective globale, malgré des absences offensives. Valencia souffre d'un manque de production et n'a pas encore trouvé de solutions à domicile sous le nouvel entraîneur. Les statistiques (xG, buts, forme), les informations sportives et le marché convergent vers un match fermé et bas en buts. Le marché qui traduit le mieux ce scénario est Under 2,5. Ma décision est **JE JOUE Under 2,5**, parce que c'est l'expression la plus directe et la plus soutenue par les preuves disponibles d'un scénario de faible volume de buts.`;

const ZVEREV = `**A. MATCH ET CONTEXTE**

- **Match** : Alexander Zverev vs Alejandro Davidovich Fokina  
- **Sport / compétition** : Tennis – ATP Masters 1000 Rolex Shanghai Masters, demi-finale, surface hard outdoor  
- **Date et heure** : Samedi 17 octobre 2026 (autour de 08:30–10:30 locale / matin Europe selon fuseaux)  
- **État des informations** : Actuelles (données post-quarts du 15-16 octobre, H2H, classements, formes et cotes de marché vérifiées le 17 octobre).  

**B. SCÉNARIO SPORTIF**

- **Joueur supérieur** : Alexander Zverev.  
- **Raisons principales** : Supériorité structurelle en classement (n°2 / year-end n°1 assuré vs n°26), service dominant et puissance de fond de court adaptés à la surface rapide de Shanghai, H2H très favorable (6-1, 4-1 hard), capacité à dicter le rythme et à limiter les échanges longs.  
- **Scénario attendu** : Zverev impose son service et son jeu agressif, convertit les opportunités de break, et l'emporte en 2 sets (ou 3 sets contrôlés) avec une marge de jeux.  
- **Scénario alternatif** : Davidovich Fokina prolonge les échanges avec son jeu défensif et ses drop-shots, force un 3e set si l'ankle de Zverev limite la mobilité ou l'efficacité au service.  
- **Facteurs susceptibles de modifier la lecture** : Ankle de Zverev (douleur qui augmente avec la durée et les rallies longs, confirmée après Bublik et mentionnée après de Minaur) ; fraîcheur relative de Davidovich Fokina (QF très court via abandon de Gea).  

**C. CONVERGENCE DES PREUVES**

- **Statistiques et données sportives** : H2H 6-1 pour Zverev (dernier 6-2 6-4 à Paris 2025 hard ; seule défaite Toronto 2023). Zverev clairement supérieur en aces, 1st serve win % et points gagnés derrière le service dans les confrontations.  
- **Forme et contexte** : Zverev 2026 ~58-13 / 62-14-15 selon sources, 9/10 derniers, clean 6-4 6-4 vs de Minaur (QF). Davidovich Fokina 31-16, titres Chengdu + Mallorca 2026, 4 victoires Shanghai (dont Tiafoe, Hurkacz en 3 sets, puis abandon Gea). Surface hard favorise le service et la puissance de Zverev.  
- **Disponibilité / blessures** : Zverev joue avec un ankle gênant (droit, historique 2022) qui s'aggrave en match long/rallies ; il a réussi à le gérer en raccourcissant les points vs de Minaur. Davidovich Fokina plus frais.  
- **Modèles prédictifs** : Prévisions disponibles convergent vers Zverev (ex. ~77 % dans un modèle ML, « Zverev in 2 » sur TennisTonic). Elo surface et ratings structurels (Tennis Abstract / sources avancées) placent Zverev clairement au-dessus.  
- **Marché et prix observés** : Zverev favori massif (cotes environ 1.25–1.29 / -350 à -385) ; handicap jeux -3.0 / -3.5 ; total jeux autour de 23 ; Zverev 2-0 sets ~ -120. Marché aligné avec le scénario de supériorité claire.  

**Convergence nette** sur la supériorité de Zverev. Contradiction principale (et seule majeure) : le facteur physique ankle qui peut ouvrir la porte à un match plus long si Davidovich Fokina force les rallies.  

**D. COMPARAISON DES MARCHÉS**

Ordre de priorité tennis :  

1. **Handicap jeux** (Zverev -3.0 / -3.5)  
   - Compatibilité élevée avec le scénario de domination.  
   - Argument : H2H et styles favorisent une marge de 3+ jeux.  
   - Risque : match serré ou 3 sets si ankle limite Zverev.  

2. **Over/Under jeux** (~23)  
   - Compatibilité moyenne.  
   - Argument : surface rapide + service Zverev = potentiel de sets courts ; total autour de 23 plausible.  
   - Risque : 3e set ou tie-breaks font monter le total.  

3. **Handicap sets** (Zverev -1.5)  
   - Compatibilité bonne.  
   - Argument : majorité des H2H en 2 sets.  
   - Risque : scénario alternatif 3 sets.  

4. **Vainqueur du match**  
   - Compatibilité maximale avec le scénario principal.  
   - Argument : le plus direct pour exprimer la supériorité.  
   - Risque : cote courte, peu de marge d'erreur.  

Les marchés trop agressifs (gros handicap ou totals extrêmes) sont écartés car l'ankle introduit une incertitude sur la marge exacte.  

**E. MARCHÉ RETENU**

- **Marché** : Vainqueur du match (ou, en second choix si ligne disponible et cohérente, handicap jeux Zverev -3.0).  
- **Sélection** : Alexander Zverev.  
- **Ligne si disponible** : Moneyline / Match Winner.  
- **Cote observée** : environ 1.25–1.29 (-350 / -385) selon bookmakers (Bovada, DraftKings, etc.).  
- **Pourquoi ce marché** : Il traduit le plus purement le scénario de supériorité technique, statistique et H2H de Zverev sans dépendre d'une marge de jeux précise que l'ankle pourrait réduire.  

**F. VERDICT NODE.47**

**JE JOUE — Alexander Zverev — Match Winner**  

**Niveau de confiance** : MODÉRÉ à ÉLEVÉ.  

**Raisons déterminantes** :  
1. H2H 6-1 + dominance hard + service/puissance adaptés à Shanghai.  
2. Convergence classements, forme 2026, modèles et marché.  
3. Capacité démontrée à gérer l'ankle en raccourcissant les points (QF vs de Minaur).  

**Principale limite** : Ankle de Zverev (douleur progressive) qui peut prolonger le match si Davidovich Fokina impose des rallies.  

**G. SYNTHÈSE NODE.47**

Alexander Zverev est supérieur pour son service, sa puissance de fond de court, le H2H 6-1 et son niveau structurel sur hard. Les statistiques, la forme récente, les modèles prédictifs et le marché convergent clairement vers sa victoire. Le marché qui traduit le mieux ce scénario est le vainqueur du match (Zverev). Ma décision est **JE JOUE**, parce que la supériorité sportive est robuste et que l'ankle, bien que réel, n'a pas empêché Zverev de produire un niveau élevé et contrôlé dans le QF.`;

const PORTO = `NODE.47 — Analyse : FC Porto vs PSV Eindhoven

A. MATCH ET CONTEXTE

• Match : FC Porto vs PSV Eindhoven
• Sport / compétition : Football / Ligue des Champions (phase de ligue)
• Date et heure : Lundi 20 octobre 2025, 21h00 CET (Estádio do Dragão)

B. SCÉNARIO SPORTIF

• Équipe supérieure : FC Porto
• Raisons principales :
- Solidité défensive à domicile (2 buts encaissés sur 8 matchs)
- Efficacité en transition rapide
• Scénario attendu : Porto contrôle les débats et gagne d'un but d'écart.
• Scénario alternatif : Le PSV obtient un nul 1-1 sur contre-attaque.
• Facteurs susceptibles de modifier la lecture : Compositions officielles ; coups de pied arrêtés.

C. CONVERGENCE DES PREUVES

• Statistiques et données sportives : Porto 2,33 buts marqués par match à domicile ; xG 1,85 ; PSV 1,40 buts encaissés en déplacement.
• Forme et contexte : Porto invaincu à domicile sur 8 matchs.
• Modèles prédictifs : Les modèles convergent vers une victoire d'un but.

D. COMPARAISON DES MARCHÉS

1. Asian Handicap — Porto -0,5 : compatible avec le scénario.
2. Over/Under : moins net compte tenu des styles.

E. MARCHÉ RETENU

• Marché : Asian Handicap
• Sélection : FC Porto -0,5
• Ligne si disponible : -0,5
• Cote observée : 1.825
• Pourquoi ce marché : traduit la supériorité à domicile sans exiger une large marge.

F. VERDICT NODE.47

JE JOUE — FC Porto -0,5
• Niveau de confiance : ÉLEVÉ
• Raisons déterminantes :
1. Domination à domicile démontrée.
2. Marché aligné avec le scénario.
• Principale limite : rotation possible de l'effectif.`;

let failed = 0;
function check(label: string, cond: boolean, extra?: unknown) {
  if (cond) {
    console.log(`  ✓ ${label}`);
  } else {
    failed++;
    console.log(`  ✗ ${label}${extra !== undefined ? ` → ${JSON.stringify(extra)}` : ""}`);
  }
}

function report(name: string, r: ReturnType<typeof parseAnalyzeText>) {
  console.log(`\n=== ${name} ===`);
  console.log("filled:", r.filled.join(" · "));
  console.log("warnings:", r.warnings.join(" · ") || "(aucun)");
  if (r.parseErrors.length) console.log("parseErrors:", r.parseErrors.join(" · "));
  return r;
}

/* ---------- 1. VALENCIA ---------- */
{
  const r = report("VALENCIA vs ATHLETIC (tirets, gras, section G)", parseAnalyzeText(VALENCIA));
  const v = r.values;
  check("affiche", v.matchName === "Valencia vs Athletic Bilbao", v.matchName);
  check("sport FOOTBALL", v.sport === "FOOTBALL", v.sport);
  check("compétition LaLiga", v.competition === "LaLiga", v.competition);
  check("date le 17/10/2026", (v.matchDate ?? "").startsWith("2026-10-17T"), v.matchDate);
  check("marché Under (total de buts)", v.market === "Under (total de buts)", v.market);
  check("sélection Under 2,5", v.selection === "Under 2,5", v.selection);
  check("cote 1.70 (bas de plage)", v.odds === "1.70", v.odds);
  check("verdict JE_JOUE", v.verdict === "JE_JOUE", v.verdict);
  check("confiance MODERE", v.confidence === "MODERE", v.confidence);
  check("synthèse = section G", (v.synthesis ?? "").startsWith("Athletic Bilbao est supérieur"), v.synthesis?.slice(0, 60));
  check("points clés ≥ 4", (v.keyPoints ?? "").split("\n").length >= 4, v.keyPoints?.split("\n").length);
  check("keyStats remplies", (v.keyStats?.length ?? 0) >= 1, v.keyStats?.map((s) => `${s.label}=${s.value}`));
  check("stat propre (50 %)", v.keyStats?.[0]?.label === "Valencia a échoué à marquer" && v.keyStats?.[0]?.value === "50 %", v.keyStats?.map((s) => `${s.label}=${s.value}`));
  check("scénario alternatif", (v.alternativeScenario ?? "").startsWith("Empate 0-0"), v.alternativeScenario?.slice(0, 40));
}

/* ---------- 2. ZVEREV ---------- */
{
  const r = report("ZVEREV vs DAVIDOVICH (gras, « – », confiance ambiguë)", parseAnalyzeText(ZVEREV));
  const v = r.values;
  check("affiche", v.matchName === "Alexander Zverev vs Alejandro Davidovich Fokina", v.matchName);
  check("sport TENNIS", v.sport === "TENNIS", v.sport);
  check("compétition ATP Masters 1000", v.competition === "ATP Masters 1000", v.competition);
  check("date le 17/10/2026", (v.matchDate ?? "").startsWith("2026-10-17T"), v.matchDate);
  check("marché « Vainqueur du match » (second choix retiré)", v.market === "Vainqueur du match", v.market);
  check("sélection sans point final", v.selection === "Alexander Zverev", v.selection);
  check("cote 1.25", v.odds === "1.25", v.odds);
  check("verdict JE_JOUE", v.verdict === "JE_JOUE", v.verdict);
  check("confiance MODERE (premier niveau)", v.confidence === "MODERE", v.confidence);
  check("warning confiance ambiguë", r.warnings.some((w) => w.includes("ambigu")), r.warnings);
  check("synthèse = section G", (v.synthesis ?? "").startsWith("Alexander Zverev est supérieur"), v.synthesis?.slice(0, 60));
  check("points clés ≥ 2", (v.keyPoints ?? "").split("\n").length >= 2, v.keyPoints?.split("\n").length);
  // v4 : la stat score « H2H 6-1 » est désormais extraite proprement (volontaire) ;
  // le reste de la prose reste écarté vers le scénario.
  check("stat propre H2H extraite", v.keyStats?.[0]?.label === "H2H" && v.keyStats?.[0]?.value === "6-1", v.keyStats);
  check("prose résiduelle → scénario (pas de stat bruitée)", (v.keyStats?.length ?? 0) === 1, v.keyStats?.map((s) => `${s.label}=${s.value}`));
}

/* ---------- 3. PORTO (style historique imbriqué) ---------- */
{
  const r = report("PORTO vs PSV (puces •, sous-listes, cote décimale)", parseAnalyzeText(PORTO));
  const v = r.values;
  check("affiche (titre « Analyse : »)", v.matchName === "FC Porto vs PSV Eindhoven", v.matchName);
  check("sport FOOTBALL", v.sport === "FOOTBALL", v.sport);
  check("compétition Ligue des Champions", v.competition === "Ligue des Champions", v.competition);
  check("date le 20/10/2025", (v.matchDate ?? "").startsWith("2025-10-20T"), v.matchDate);
  check("marché Asian Handicap", v.market === "Asian Handicap", v.market);
  check("sélection FC Porto -0,5", v.selection === "FC Porto -0,5", v.selection);
  check("ligne -0,5", v.line === "-0,5", v.line);
  check("cote 1.825", v.odds === "1.825", v.odds);
  check("verdict JE_JOUE", v.verdict === "JE_JOUE", v.verdict);
  check("confiance ELEVE", v.confidence === "ELEVE", v.confidence);
  check("points clés (sous-listes) ≥ 2", (v.keyPoints ?? "").split("\n").length >= 2, v.keyPoints);
  check("synthèse par blocs F (pas de G)", (v.synthesis ?? "").includes("Raisons déterminantes"), v.synthesis?.slice(0, 60));
  check("3 stats propres Porto/xG/PSV", JSON.stringify(v.keyStats?.map((s) => s.label)) === JSON.stringify(["Porto", "xG", "PSV"]), v.keyStats?.map((s) => `${s.label}=${s.value}`));
}

console.log(failed === 0 ? "\n✅ TOUS LES TESTS PASSENT" : `\n❌ ${failed} ÉCHEC(S)`);
process.exit(failed === 0 ? 0 : 1);
