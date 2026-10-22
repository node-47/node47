/**
 * Seed NODE.47 — données de démonstration (9 analyses : 3 par sport + 1 brouillon).
 * Les publications sont réparties sur les 3 dernières éditions (cycle 8 h UTC)
 * et les règlements dans la fenêtre de suivi des 30 derniers jours.
 * Les contenus sont des EXEMPLES à remplacer par de vraies analyses.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Date UTC : jour décalé de dayOffset, à hour:minute UTC */
function utcAt(dayOffset: number, hour = 20, minute = 45): Date {
  const t = new Date();
  t.setUTCHours(0, 0, 0, 0);
  t.setUTCDate(t.getUTCDate() + dayOffset);
  t.setUTCHours(hour, minute, 0, 0);
  return t;
}

/**
 * Publication prévue pour l'édition du jour (après 8 h UTC).
 * Si l'heure n'est pas encore passée, repli sur l'édition de la veille
 * afin de rester cohérent avec le cycle de publication 8 h UTC.
 */
function pubForToday(hour: number, minute: number, fallback: Date): Date {
  const target = utcAt(0, hour, minute);
  return target <= new Date() ? target : fallback;
}

interface StatItem {
  label: string;
  value: string;
  detail?: string;
}

async function main() {
  // Nettoyage préalable (idempotent)
  await prisma.pick.deleteMany({});

  const data: {
    sport: string;
    competition: string;
    matchName: string;
    matchDate: Date;
    scenarioSummary: string;
    keyPoints: string[];
    keyStats: StatItem[];
    alternativeScenario?: string;
    market: string;
    selection: string;
    line?: string;
    odds?: number | null;
    verdict: string;
    confidence: string;
    condition?: string;
    synthesis: string;
    status: string;
    result: string;
    resultNote?: string;
    settledAt?: Date;
    publishedAt?: Date;
  }[] = [
    /* ---------------- FOOTBALL ---------------- */
    {
      sport: "FOOTBALL",
      competition: "Premier League",
      matchName: "Arsenal vs Chelsea",
      matchDate: utcAt(-1, 18, 30),
      scenarioSummary:
        "Arsenal domine la rencontre sur le plan structurel : pressing élevé, récupération dans le camp adverse et largeur offensive qui étire le bloc de Chelsea. Les visiteurs, affectés par des absences dans l'entrejeu, peinent à sortir proprement et subissent dans les duels de la deuxième zone. Si Arsenal ouvre le score tôt, le scénario d'une victoire avec marge devient très crédible.",
      keyPoints: [
        "Qualité des occasions créées nettement supérieure sur les six dernières journées",
        "Bloc défensif adverse fragile sur coups de pied arrêtés, point fort d'Arsenal",
        "Convergence des modèles et de la structure du marché sur la même lecture",
      ],
      keyStats: [
        { label: "xG créés (5 matchs)", value: "11,4", detail: "contre 6,1 pour le visiteur" },
        { label: "xG concédés (5 matchs)", value: "3,2", detail: "meilleure défense du championnat" },
        { label: "Tirs cadrés / match", value: "6,8" },
        { label: "Possession moyenne", value: "58 %" },
      ],
      alternativeScenario:
        "Chelsea tient le 0-0 jusqu'à l'heure de jeu et frappe en contre : le match bascule vers un scénario serré à une marge.",
      market: "Asian Handicap",
      selection: "Arsenal",
      line: "-0,5",
      odds: 1.92,
      verdict: "JE_JOUE",
      confidence: "ELEVE",
      synthesis:
        "Arsenal est supérieur pour la qualité de ses créations d'occasions, sa solidité défensive et la faiblesse structurelle adverse sur les phases arrêtées. Les statistiques, les modèles et le marché convergent. Le marché qui traduit le mieux ce scénario est l'Asian Handicap -0,5. Ma décision est : je joue Arsenal -0,5.",
      status: "PUBLISHED",
      result: "WON",
      resultNote: "Victoire 2-0",
      settledAt: utcAt(-1, 20, 40),
      publishedAt: utcAt(-2, 9, 5),
    },
    {
      sport: "FOOTBALL",
      competition: "LaLiga",
      matchName: "Real Sociedad vs Getafe",
      matchDate: utcAt(-1, 21, 0),
      scenarioSummary:
        "Rencontre à faible tempo attendue : la Real Sociedad gère la possession sans volumétrie offensive excessive, tandis que Getafe se structure très bas et casse le rythme. Les deux effectifs produisent peu d'occasions franches sur leurs dernières sorties respectives.",
      keyPoints: [
        "Moyenne combinée de buts faible sur les dernières journées des deux équipes",
        "Style très direct et défensif du visiteur à l'extérieur",
        "Les modèles de totaux convergent vers un volume de buts sous la référence du marché",
      ],
      keyStats: [
        { label: "Buts / match (Sociedad, 5 m.)", value: "1,0" },
        { label: "Buts / match (Getafe, 5 m.)", value: "0,8" },
        { label: "Under 2,5 sur les 5 derniers", value: "80 %", detail: "4 matchs sur 5" },
      ],
      market: "Over / Under",
      selection: "Under 2,5",
      odds: 1.78,
      verdict: "JE_JOUE",
      confidence: "MODERE",
      synthesis:
        "Aucune équipe n'affiche une volumétrie offensive convaincante et les styles se neutralisent. Les données et les modèles convergent vers un match fermé. Ma décision est : je joue Under 2,5 buts.",
      status: "PUBLISHED",
      result: "LOST",
      resultNote: "Score final 1-3",
      settledAt: utcAt(-1, 23, 5),
      publishedAt: utcAt(-1, 10, 30),
    },
    {
      sport: "FOOTBALL",
      competition: "Serie A",
      matchName: "Atalanta vs Torino",
      matchDate: utcAt(0, 20, 45),
      scenarioSummary:
        "Atalanta reste l'équipe la plus intense du championnat dans les duels et les transitions. Torino voyage mal et concède beaucoup de tirs depuis l'axe. La dynamique sportive favorise nettement l'équipe à domicile, mais la confirmation de l'indisposition d'un cadre offensif pourrait réduire la marge attendue.",
      keyPoints: [
        "Intensité de pressing et volume de tirs largement favorables à domicile",
        "Faiblesse du bloc extérieur sur les seconds ballons",
        "Confirmation de l'alignement du meneur de jeu attendue à J-1",
      ],
      keyStats: [
        { label: "Tirs / match (domicile)", value: "17,2" },
        { label: "Tirs concédés à l'extérieur", value: "15,6", detail: "pour le visiteur" },
        { label: "xG sur la forme", value: "2,05", detail: "moyenne sur 4 matchs" },
      ],
      alternativeScenario:
        "Rotation large côté Atalanta avant un rendez-vous européen : le match perd en intensité et bascule vers un scénario de total bas.",
      market: "Asian Handicap",
      selection: "Atalanta",
      line: "-0,75",
      odds: 2.05,
      verdict: "JE_JOUE_SOUS_CONDITION",
      confidence: "FAIBLE",
      condition:
        "Position jouable uniquement si le meneur de jeu est bien titulaire à l'annonce des compositions officielles.",
      synthesis:
        "Atalanta est supérieure pour son intensité et son volume de tirs, face à un visiteur qui concède beaucoup. Les preuves convergent partiellement : la disponibilité du meneur de jeu reste déterminante. Ma décision est : je joue sous condition Atalanta -0,75.",
      status: "PUBLISHED",
      result: "PENDING",
      publishedAt: pubForToday(8, 5, utcAt(-1, 20, 30)),
    },

    /* ---------------- BASKETBALL ---------------- */
    {
      sport: "BASKETBALL",
      competition: "NBA",
      matchName: "Boston Celtics vs Miami Heat",
      matchDate: utcAt(-1, 1, 30),
      scenarioSummary:
        "Boston maîtrise les deux tableaux : efficacité au tir élevée, peu de pertes de balle et une profondeur d'effectif qui impose un rythme soutenu. Miami, en rotation réduite, dépend trop de son turnover offensif pour tenir 48 minutes à ce niveau d'intensité.",
      keyPoints: [
        "Net Rating largement favorable à domicile sur la saison",
        "Rotation à 9 joueurs contre 7 à l'extérieur : l'écart se creuse en fin de match",
        "Efficacité à 3 points nettement supérieure sur les 10 derniers matchs",
      ],
      keyStats: [
        { label: "Net Rating", value: "+9,8", detail: "vs +1,2 pour Miami" },
        { label: "Pace", value: "99,4", detail: "rythme top 8 de la ligue" },
        { label: "eFG %", value: "56,8 %" },
        { label: "Turnovers / match", value: "12,1" },
      ],
      market: "Handicap de points",
      selection: "Boston Celtics",
      line: "-6,5",
      odds: 1.9,
      verdict: "JE_JOUE",
      confidence: "ELEVE",
      synthesis:
        "Boston est supérieur pour son efficacité au tir, sa gestion du ballon et sa profondeur d'effectif. Les données, les modèles et le marché convergent. Le spread traduit le mieux ce scénario. Ma décision est : je joue Boston -6,5.",
      status: "PUBLISHED",
      result: "WON",
      resultNote: "Victoire 112-98",
      settledAt: utcAt(-1, 4, 15),
      publishedAt: utcAt(-2, 12, 0),
    },
    {
      sport: "BASKETBALL",
      competition: "EuroLeague",
      matchName: "Real Madrid vs Panathinaïkos",
      matchDate: utcAt(1, 21, 0),
      scenarioSummary:
        "Deux attaques parmi les plus efficaces d'Europe s'affrontent à un rythme élevé : les deux effectifs vivent sur la transition et la densité de tirs extérieurs. Les duels récents entre ces formations produisent régulièrement des totaux au-dessus des références du marché, portés par des quarts-temps à forte intensité.",
      keyPoints: [
        "Efficacité offensive par possession supérieure aux moyennes de saison des deux camps",
        "Rythme élevé confirmé sur les duels directs récents",
        "Profondeur d'effectif des deux côtés : l'intensité ne retombe pas pendant les rotations",
      ],
      keyStats: [
        { label: "Points / match (10 m.)", value: "86,4", detail: "vs 84,9 pour le visiteur" },
        { label: "Pace (10 m.)", value: "76,2", detail: "top 5 de l'EuroLeague" },
        { label: "Over la référence sur les 5 duels", value: "4 sur 5" },
      ],
      market: "Over / Under",
      selection: "Over 168,5",
      odds: 1.85,
      verdict: "JE_JOUE",
      confidence: "TRES_ELEVE",
      synthesis:
        "Les deux formations produisent un volume offensif élevé et entretiennent un rythme qu'aucune rotation ne casse. Les données, l'historique des duels et le marché convergent vers un total haut. Ma décision est : je joue Over 168,5 points.",
      status: "PUBLISHED",
      result: "PENDING",
      publishedAt: pubForToday(10, 30, utcAt(-1, 22, 0)),
    },
    {
      sport: "BASKETBALL",
      competition: "NBA",
      matchName: "Denver Nuggets vs Phoenix Suns",
      matchDate: utcAt(1, 3, 0),
      scenarioSummary:
        "Denver à domicile reste l'une des meilleures équipes de la ligue à son horizon, notamment en attaque half-court. Phoenix dépend fortement de ses tirs extérieurs, une variable volatile sur un match. La ligne actuelle paraît correctement fixée : l'asymétrie ne devient exploitable qu'à une ligne plus courte.",
      keyPoints: [
        "Avantage structurel à domicile, mais marge attendue proche de la ligne affichée",
        "Dépendance du visiteur à l'efficacité à 3 points, trop volatile pour un verdict ferme",
        "Une ligne plus courte rendrait l'écart projeté significatif par rapport au prix",
      ],
      keyStats: [
        { label: "Bilan domicile (saison)", value: "78 %" },
        { label: "3P % visiteur (5 m.)", value: "34,1 %" },
        { label: "Écart projeté", value: "+5,4", detail: "ligne marché à -6,5" },
      ],
      market: "Handicap de points",
      selection: "Denver Nuggets",
      line: "-5,5",
      odds: 1.92,
      verdict: "JE_JOUE_SOUS_CONDITION",
      confidence: "MODERE",
      condition:
        "Position jouable uniquement si une ligne à -5,5 (ou plus courte) reste disponible au moment de l'exécution.",
      synthesis:
        "Denver est favori de manière identifiable, mais la marge projetée ne s'écarte de la ligne que si le prix reste raisonnable. Ma décision est : je joue sous condition Denver -5,5.",
      status: "PUBLISHED",
      result: "PENDING",
      publishedAt: pubForToday(9, 15, utcAt(-1, 21, 15)),
    },

    /* ---------------- TENNIS ---------------- */
    {
      sport: "TENNIS",
      competition: "ATP Masters 1000",
      matchName: "J. Sinner vs A. Zverev",
      matchDate: utcAt(-1, 14, 0),
      scenarioSummary:
        "Sur dur, Sinner impose un rapport service/retour nettement supérieur : profondeur de frappe constante et très peu de free points concédés sur ses mises en jeu. Zverev sert bien mais souffre systématiquement dans les longs échanges du côté coup droit.",
      keyPoints: [
        "Elo sur la surface nettement favorable au premier joueur",
        "Points gagnés derrière la première balle supérieurs sur la saison",
        "Performance de retour bien plus solide face aux gros serveurs",
      ],
      keyStats: [
        { label: "Elo surface (dur)", value: "+85 pts", detail: "écart moyen" },
        { label: "Points gagnés 1re balle", value: "79 %" },
        { label: "Break points convertis", value: "31 %", detail: "sur 3 derniers tournois" },
        { label: "H2H récent", value: "4-1" },
      ],
      alternativeScenario:
        "Un tie-break serré par set peut réduire l'écart de jeux sans remettre en cause la lecture du vainqueur.",
      market: "Handicap jeux",
      selection: "Sinner",
      line: "-3,5",
      odds: 1.87,
      verdict: "JE_JOUE",
      confidence: "ELEVE",
      synthesis:
        "Sinner est supérieur pour son rapport service/retour et sa constance dans les échanges longs. Les ratings, la forme et le marché convergent. Le handicap jeux traduit le mieux ce scénario. Ma décision est : je joue Sinner -3,5 jeux.",
      status: "PUBLISHED",
      result: "WON",
      resultNote: "Victoire 6-4, 6-3",
      settledAt: utcAt(-1, 16, 10),
      publishedAt: utcAt(-2, 9, 40),
    },
    {
      sport: "TENNIS",
      competition: "WTA 1000",
      matchName: "I. Swiatek vs C. Gauff",
      matchDate: utcAt(-1, 18, 30),
      scenarioSummary:
        "Confrontation au sommet entre deux joueuses qui se connaissent parfaitement. Sur terre battue et dans des conditions lentes, les deux profils défendent bien leur mise en jeu : les duels récents produisent des sets serrés et beaucoup de jeux disputés, sans que l'écart technique ne se traduise par un score sec.",
      keyPoints: [
        "Duels directs récents systématiquement serrés sur terre battue",
        "Conditions lentes qui favorisent les longs échanges et les jeux âpres",
        "Les deux joueuses gagnent plus de 70 % de points derrière leur première balle",
      ],
      keyStats: [
        { label: "H2H surface", value: "3-2" },
        { label: "Sets décisifs (5 derniers duels)", value: "4" },
        { label: "Jeux / match (5 derniers duels)", value: "22,6" },
      ],
      market: "Over / Under jeux",
      selection: "Over 21,5",
      odds: 1.74,
      verdict: "JE_JOUE",
      confidence: "MODERE",
      synthesis:
        "Aucune des deux joueuses ne domine suffisamment le retour pour créer un écart de jeux net : les duels récents s'allongent et les conditions vont dans le même sens. Ma décision est : je joue Over 21,5 jeux.",
      status: "PUBLISHED",
      result: "WON",
      resultNote: "Victoire 7-5, 4-6, 7-6 — 35 jeux",
      settledAt: utcAt(-1, 21, 40),
      publishedAt: utcAt(-1, 8, 30),
    },
    {
      sport: "TENNIS",
      competition: "ATP 250",
      matchName: "T. Fritz vs B. Shelton",
      matchDate: utcAt(-1, 19, 0),
      scenarioSummary:
        "Duel de gros serveurs sur surface rapide. Fritz retourne légèrement mieux la première balle et gère mieux les moments clés, mais l'écart reste mince sur un format court où le tie-break domine les probabilités. La valeur se situe sur le vainqueur du match, pas sur la marge de jeux.",
      keyPoints: [
        "Écart Elo mince mais constant en faveur du premier joueur",
        "Meilleure conversion des points de break sur la surface",
        "Le marché valorise le service du visiteur au-delà de sa performance récente",
      ],
      keyStats: [
        { label: "Points gagnés 1re balle", value: "88 %", detail: "Fritz sur la surface" },
        { label: "Points gagnés 1re balle", value: "86 %", detail: "Shelton sur la surface" },
        { label: "Breaks convertis (5 m.)", value: "9", detail: "vs 4 pour le visiteur" },
      ],
      market: "Vainqueur du match",
      selection: "T. Fritz",
      odds: 1.95,
      verdict: "JE_JOUE",
      confidence: "MODERE",
      synthesis:
        "Aucune marge de jeux n'est correctement exprimable dans un duel dominé par les mises en jeu, mais l'écart de retour crée une légère asymétrie sur le vainqueur. Ma décision est : je joue Fritz.",
      status: "PUBLISHED",
      result: "LOST",
      resultNote: "Défaite 6-7, 6-7",
      settledAt: utcAt(-1, 20, 55),
      publishedAt: utcAt(-1, 8, 45),
    },

    /* ---------------- BROUILLON (privé) ---------------- */
    {
      sport: "FOOTBALL",
      competition: "Ligue 1",
      matchName: "Marseille vs Lyon",
      matchDate: utcAt(3, 20, 45),
      scenarioSummary:
        "Analyse en cours de rédaction : dynamique offensive à domicile très élevée, mais incertitudes sur la défense centrale à confirmer à J-1.",
      keyPoints: ["Volume offensif domestique supérieur", "Incertain : paire de défenseurs centraux"],
      keyStats: [{ label: "xG domicile (4 m.)", value: "9,8" }],
      market: "Over / Under",
      selection: "",
      odds: null,
      verdict: "JE_JOUE_SOUS_CONDITION",
      confidence: "MODERE",
      condition: "Attendre les compositions officielles.",
      synthesis: "",
      status: "DRAFT",
      result: "PENDING",
    },
  ];

  for (const item of data) {
    await prisma.pick.create({
      data: {
        sport: item.sport,
        competition: item.competition,
        matchName: item.matchName,
        matchDate: item.matchDate,
        scenarioSummary: item.scenarioSummary,
        keyPoints: JSON.stringify(item.keyPoints),
        keyStats: JSON.stringify(item.keyStats),
        alternativeScenario: item.alternativeScenario ?? null,
        market: item.market,
        selection: item.selection,
        line: item.line ?? null,
        odds: item.odds ?? null,
        verdict: item.verdict,
        confidence: item.confidence,
        condition: item.condition ?? null,
        synthesis: item.synthesis,
        status: item.status,
        result: item.result,
        resultNote: item.resultNote ?? null,
        settledAt: item.settledAt ?? null,
        publishedAt: item.publishedAt ?? null,
      },
    });
  }

  const count = await prisma.pick.count();
  console.log(`Seed terminé : ${count} analyses créées.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
