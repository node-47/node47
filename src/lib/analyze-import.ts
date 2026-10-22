import type { KeyStatItem } from "@/lib/picks";

/* =============================================================
   Import d'une analyse rédigée (format NODE.47, sections A à G)
   → pré-remplissage du formulaire admin. 100 % côté client,
   sans effet de bord : l'analyste relit et ajuste ensuite.

   Tolérant aux variantes de mise en forme :
   - gras markdown **…**, titres ##, puces « • », « - », « – », « — », « * »
   - séparateur sport/compétition « / », « – », « — » ou « - »
   - listes imbriquées (sous-puces) ou paragraphes continus
   - synthèse finale en section G (prioritaire) ou blocs F/E
   - dictionnaire de compétitions connues (Ligue 1, NBA, EuroLeague,
     WTA 1000, ATP Masters 1000, LaLiga, Premier League…)
   ============================================================= */

export interface ImportedValues {
  sport?: string;
  competition?: string;
  matchName?: string;
  matchDate?: string; // format datetime-local
  scenarioSummary?: string;
  keyPoints?: string;
  alternativeScenario?: string;
  keyStats?: KeyStatItem[];
  market?: string;
  selection?: string;
  line?: string;
  odds?: string;
  verdict?: string;
  confidence?: string;
  condition?: string;
  synthesis?: string;
}

export interface ImportReport {
  values: ImportedValues;
  filled: string[];
  warnings: string[];
  parseErrors: string[];
}

const MONTHS: Record<string, number> = {
  janvier: 1, janv: 1, fevrier: 2, février: 2, fev: 2, mars: 3, avril: 4,
  mai: 5, juin: 6, juillet: 7, juil: 7, aout: 8, août: 8, septembre: 9,
  sept: 9, octobre: 10, oct: 10, novembre: 11, nov: 11, decembre: 12,
  décembre: 12, dec: 12,
};

const TZ_OFFSETS: Record<string, number> = {
  UTC: 0, GMT: 0, WET: 0, WEST: 1, CET: 1, CEST: 2, EET: 2, EEST: 3,
  EST: -5, EDT: -4, CST: -6, CDT: -5, MST: -7, MDT: -6, PST: -8, PDT: -7,
};

/** Compétitions connues : libellé canonique utilisé sur les cartes publiques. */
const COMPETITIONS: { re: RegExp; label: string; sport?: string }[] = [
  // Tennis (les plus spécifiques d'abord)
  { re: /\batp\s*masters\s*1000\b|\bmasters\s*1000\b/, label: "ATP Masters 1000", sport: "TENNIS" },
  { re: /\bwta\s*1000\b/, label: "WTA 1000", sport: "TENNIS" },
  { re: /\batp\s*finals\b|\bnitto\s*atp\s*finals\b/, label: "ATP Finals", sport: "TENNIS" },
  { re: /\bwta\s*finals\b/, label: "WTA Finals", sport: "TENNIS" },
  { re: /\batp\s*500\b/, label: "ATP 500", sport: "TENNIS" },
  { re: /\bwta\s*500\b/, label: "WTA 500", sport: "TENNIS" },
  { re: /\batp\s*250\b/, label: "ATP 250", sport: "TENNIS" },
  { re: /\bwta\s*250\b/, label: "WTA 250", sport: "TENNIS" },
  { re: /\broland[\s-]*garros\b/, label: "Roland-Garros", sport: "TENNIS" },
  { re: /\bwimbledon\b/, label: "Wimbledon", sport: "TENNIS" },
  { re: /\bus\s*open\b/, label: "US Open", sport: "TENNIS" },
  { re: /\baustralian\s*open\b|\bopen\s*d['']australie\b/, label: "Open d'Australie", sport: "TENNIS" },
  { re: /\bcoupe\s*davis\b|\bdavis\s*cup\b/, label: "Coupe Davis", sport: "TENNIS" },
  { re: /\bunited\s*cup\b/, label: "United Cup", sport: "TENNIS" },
  { re: /\bgrand\s*chelem\b|\bgrand\s*slam\b/, label: "Grand Chelem", sport: "TENNIS" },
  { re: /\bchallenger\b/, label: "Challenger", sport: "TENNIS" },
  // Basketball
  { re: /\beuroleague\b|\beuro\s*league\b/, label: "EuroLeague", sport: "BASKETBALL" },
  { re: /\bwnba\b/, label: "WNBA", sport: "BASKETBALL" },
  { re: /\bnba\b/, label: "NBA", sport: "BASKETBALL" },
  { re: /\beurocoupe\b|\beurocup\b|\beuro\s*cup\b/, label: "EuroCoupe", sport: "BASKETBALL" },
  { re: /\bbetclic\s*elite\b|\bpro\s*a\b/, label: "Betclic Élite", sport: "BASKETBALL" },
  { re: /\bliga\s*acb\b|\bacb\b/, label: "Liga ACB", sport: "BASKETBALL" },
  { re: /\bncaa\b/, label: "NCAA", sport: "BASKETBALL" },
  { re: /\beurobasket\b/, label: "EuroBasket", sport: "BASKETBALL" },
  // Football (ligues majeures d'abord, puis coupes)
  { re: /\bligue\s*des\s*champions\b|\bchampions\s*league\b|\bucl\b/, label: "Ligue des Champions", sport: "FOOTBALL" },
  { re: /\bligue\s*europa\b|\beuropa\s*league\b/, label: "Ligue Europa", sport: "FOOTBALL" },
  { re: /\bconference\s*league\b|\bligue\s*conference\b/, label: "Ligue Conférence", sport: "FOOTBALL" },
  { re: /\bcoupe\s*du\s*monde\b|\bworld\s*cup\b/, label: "Coupe du Monde", sport: "FOOTBALL" },
  { re: /\bcopa\s*america\b/, label: "Copa América", sport: "FOOTBALL" },
  { re: /\bligue\s*des\s*nations\b|\bnations\s*league\b/, label: "Ligue des Nations", sport: "FOOTBALL" },
  { re: /\bpremier\s*league\b|\bepl\b/, label: "Premier League", sport: "FOOTBALL" },
  { re: /\bla\s*liga\b|\blaliga\b|\bliga\s*espanola\b/, label: "LaLiga", sport: "FOOTBALL" },
  { re: /\bbrasileirao\b|\bcampeonato\s*brasileiro\b/, label: "Brasileirão", sport: "FOOTBALL" },
  { re: /\bserie\s*a\b/, label: "Serie A", sport: "FOOTBALL" },
  { re: /\bbundesliga\b/, label: "Bundesliga", sport: "FOOTBALL" },
  { re: /\bligue\s*1\b/, label: "Ligue 1", sport: "FOOTBALL" },
  { re: /\bligue\s*2\b/, label: "Ligue 2", sport: "FOOTBALL" },
  { re: /\beredivisie\b/, label: "Eredivisie", sport: "FOOTBALL" },
  { re: /\bprimeira\s*liga\b|\bliga\s*portugal\b/, label: "Primeira Liga", sport: "FOOTBALL" },
  { re: /\bcoupe\s*de\s*france\b/, label: "Coupe de France", sport: "FOOTBALL" },
  { re: /\bfa\s*cup\b/, label: "FA Cup", sport: "FOOTBALL" },
  { re: /\bcarabao\s*cup\b|\bcoupe\s*de\s*la\s*ligue\b/, label: "Carabao Cup", sport: "FOOTBALL" },
  { re: /\bcopa\s*del\s*rey\b/, label: "Copa del Rey", sport: "FOOTBALL" },
  { re: /\bcoppa\s*italia\b/, label: "Coppa Italia", sport: "FOOTBALL" },
  { re: /\bdfb\s*pokal\b/, label: "DFB Pokal", sport: "FOOTBALL" },
  { re: /\bmls\b/, label: "MLS", sport: "FOOTBALL" },
  { re: /\bliga\s*mx\b/, label: "Liga MX", sport: "FOOTBALL" },
  { re: /\bsaudi\s*pro\s*league\b/, label: "Saudi Pro League", sport: "FOOTBALL" },
  { re: /\bjupiler\s*pro\s*league\b/, label: "Jupiler Pro League", sport: "FOOTBALL" },
  { re: /\bscottish\s*premiership\b/, label: "Scottish Premiership", sport: "FOOTBALL" },
  { re: /\bchampionship\b/, label: "Championship", sport: "FOOTBALL" },
  { re: /\bsuper\s*lig\b/, label: "Süper Lig", sport: "FOOTBALL" },
  { re: /\bpro\s*league\b/, label: "Pro League", sport: "FOOTBALL" },
  { re: /\btop\s*14\b/, label: "Top 14" },
  { re: /\beuro\b(?!vision)/, label: "Euro", sport: "FOOTBALL" },
];

const MAX_SUMMARY = 3900;
const MAX_SYNTHESIS = 3900;
const MAX_POINTS = 12;

/* ---------- Étiquettes connues (recherche insensible aux accents) ---------- */

/** « marché » → « m[aàâ]rch[éeèê] » : permet de reconnaître les étiquettes
    quel que soit le clavier / la mise en forme d'origine. */
function accentPat(s: string): string {
  return s
    .replace(/e/g, "[eéèêë]")
    .replace(/a/g, "[aàâ]")
    .replace(/i/g, "[iîï]")
    .replace(/o/g, "[oôö]")
    .replace(/u/g, "[uùûü]")
    .replace(/c/g, "[cç]");
}

const FLAT_LABELS = [
  "match", "rencontre", "affiche", "evenement", "sport", "competition",
  "date et heure", "date du match", "date", "heure", "heure du match", "jour",
  "equipe superieure", "joueur superieur", "marche", "market", "marche retenu",
  "pari retenu", "type de pari",
  "selection", "pronostic", "pronostic final", "pari", "choix", "pick", "ligne",
  "cote", "cotes", "cote finale", "verdict", "decision", "confiance",
  "niveau de confiance", "indice de confiance", "mise", "stake",
  "etat des informations", "informations", "sources", "bookmaker", "bookmakers",
  "note", "notes", "remarque", "remarques",
];
const FLAT_LABEL_ALT = FLAT_LABELS.map((l) => accentPat(l).replace(/ /g, "\\s+")).join("|");
/** Garde de fin d'étiquette : optionnellement un « s » de pluriel, puis un
    caractère non-lettre. On n'utilise PAS \b car les lettres accentuées
    (é, è…) ne sont pas des \\w — « Marché : » échouerait. */
const LABEL_TAIL = "(?:s)?(?![A-Za-zÀ-ÿ])";
/** « Label : valeur » — tolère des mots intercalaires entre le label et « : »
    (ex. « Sport / compétition : », « Cote observée : », « Ligne si disponible : »). */
const LABEL_LINE_RE = new RegExp(
  `^(?:[-–—•*]\\s*)?(${FLAT_LABEL_ALT})${LABEL_TAIL}[^:\\n]{0,48}?\\s*[:\\-–—]\\s*(.+)$`,
  "i"
);
const STOP_LABEL_RE = new RegExp(`(?=\\s*(?:${FLAT_LABEL_ALT})${LABEL_TAIL}[^:\\n]{0,48}?\\s*[:\\-–—])`, "i");

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Date -> "YYYY-MM-DDTHH:mm" (heure locale du navigateur, comme input datetime-local) */
function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${d.getDate().toString().padStart(2, "0")}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function cleanText(s: string): string {
  return s.replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").trim();
}

/** Retire le markdown en ligne (gras, titres), les émojis d'ornement en
    début/fin de ligne (⚽ 📌 🎯 … collages ChatGPT/WhatsApp) et unifie
    les espaces insécables. Les puces (• - – — * ‣ ▪ ◦) sont préservées. */
const ORNAMENT = "\\u{1F000}-\\u{1FAFF}\\u{2600}-\\u{27BF}\\u{2B00}-\\u{2BFF}\\u{FE0F}\\u{200D}\\u{20E3}";
const LEAD_ORNAMENT_RE = new RegExp(`^[\\s\\uFEFF]*(?:[${ORNAMENT}][\\u{FE0F}\\u{200D}\\u{20E3}]*\\s*)+`, "u");
const TRAIL_ORNAMENT_RE = new RegExp(`(?:\\s*[${ORNAMENT}][\\u{FE0F}\\u{200D}\\u{20E3}]*)+[\\s\\uFEFF]*$`, "u");
/** Ligne purement décorative (séparateurs ═ ─ --- ___ …) : ignorée. */
const DECOR_LINE_RE = /^[\s=\-–—_~†‡§|│┄┅═━┌┐└┘]{3,}$/u;

function stripInline(line: string): string {
  return line
    .replace(/\u00a0|\u202f/g, " ")
    .replace(/^\s*#{1,6}\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(LEAD_ORNAMENT_RE, "")
    .replace(TRAIL_ORNAMENT_RE, "")
    .replace(/[ \t]+$/g, "");
}

function capText(s: string, max: number, warnings: string[], what: string): string {
  if (s.length <= max) return s;
  warnings.push(`${what} tronqué (limite ${max + 1} caractères)`);
  return s.slice(0, max) + "…";
}

/* ---------- Découpe en sections ---------- */

// Mots-clés de titres de sections, dans l'ordre canonique A → G.
// Sert à reconnaître les en-têtes même SANS lettre (numérotés « 1. »,
// chiffres romains « IV. » ou sans aucun préfixe) — l'ordre tranche.
// Articles optionnels tolérés devant le mot-clé (« Le marché retenu »,
// « Notre verdict », « La synthèse »…).
const ARTICLE_PREFIX = "^(?:le\\s+|la\\s+|les\\s+|notre\\s+|nos\\s+)?";
const ORDER_KEYWORDS: [RegExp, string][] = [
  [new RegExp(ARTICLE_PREFIX + "(match|rencontre|affiche)(\\s+(et|&|–|-|—)\\s+)?(contexte|enjeu)?"), "A"],
  [new RegExp(ARTICLE_PREFIX + "scenario(\\s+sportif)?"), "B"],
  [new RegExp(ARTICLE_PREFIX + "(convergence|preuves|statistiques\\s+et\\s+donnees)"), "C"],
  [new RegExp(ARTICLE_PREFIX + "comparaison"), "D"],
  [new RegExp(ARTICLE_PREFIX + "marche(s)?(\\s+(retenu|choisi|conseille))?(\\s+retenu)?\\s*$"), "E"],
  [new RegExp(ARTICLE_PREFIX + "(?:verdict|decision\\s+finale)"), "F"],
  [new RegExp(ARTICLE_PREFIX + "(synthese|conclusion|decision\\s+finale)"), "G"],
];

const SECTION_KEYWORDS = [
  "match et contexte",
  "match & contexte",
  "rencontre et contexte",
  "scenario sportif",
  "convergence des preuves",
  "convergence",
  "comparaison des marches",
  "comparaison",
  "marche retenu",
  "verdict",
  "synthese",
  "decision finale",
];

function isSectionTitle(text: string): boolean {
  const t = stripAccents(text)
    .toLowerCase()
    .replace(/[^a-z& ]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^(?:le|la|les|notre|nos)\s+/, "")
    .trim();
  return SECTION_KEYWORDS.some((k) => t.startsWith(k));
}

/** Découpe le texte en sections nommées (A à H). Accepte :
 *  - lettres « A. / B) / C - » (majuscules ou minuscules, avec ou sans gras)
 *  - numérotation quelconque « 1. 2. » « I. II. » si le titre est reconnu
 *  - titres nus « MATCH ET CONTEXTE » sans aucun préfixe
 *  Sans en-têtes reconnaissables → tout dans "ALL" (remplissage par étiquettes). */
function splitSections(text: string): Record<string, string> {
  const lines = cleanText(text).split("\n");
  const sections: Record<string, string[]> = { ALL: [] };
  let current = "ALL";
  const headerRe = /^\s*([A-Ha-h])\s*[.)\]:\-–—]\s*(.+?)\s*$/;
  const bulletRe = /^\s*[•‣▪◦*\-–—]\s+/;
  for (const line of lines) {
    const stripped = stripInline(line);
    if (!stripped || DECOR_LINE_RE.test(stripped)) continue; // vide / décoratif
    const m = stripped.match(headerRe);
    const letters = m ? m[2].replace(/[^A-Za-zÀ-ÿ]/g, "") : "";
    const isHeader =
      !!m && letters.length > 2 && (letters === letters.toUpperCase() || isSectionTitle(m[2]));
    if (isHeader && m) {
      current = m[1].toUpperCase();
      if (!sections[current]) sections[current] = [];
      continue;
    }
    // En-tête sans lettre reconnue (numéroté ou nu) : titre court, pas de puce,
    // pas de « : » — la position dans l'ordre canonique tranche la section.
    // Pour une ligne NUMÉROTÉE (« 2. Convergence… »), le titre doit rester très
    // court : au-delà, c'est presque toujours une raison/liste, pas un titre.
    const numberedRe = /^\s*(?:\d{1,2}|[ivxlIVXL]{1,5})\s*[.)\]:\-–—]/;
    const maxTitle = numberedRe.test(stripped) ? 45 : 80;
    if (!bulletRe.test(stripped) && !/:/.test(stripped) && stripped.length < maxTitle) {
      const t = stripAccents(stripped)
        .toLowerCase()
        .replace(/^\s*(?:\d{1,2}|[ivxlIVXL]{1,5})\s*[.)\]:\-–—]?\s*/, "")
        .replace(/\s+/g, " ")
        .trim();
      const hit = ORDER_KEYWORDS.find(([re]) => re.test(t));
      if (hit) {
        current = hit[1];
        if (!sections[current]) sections[current] = [];
        continue;
      }
    }
    sections[current].push(stripped);
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(sections)) out[k] = v.join("\n").trim();
  return out;
}

/** Découpe une section en puces « Label : corps » (•, -, –, —, *) ; les lignes
    simples sont rattachées à la puce précédente (continuation / sous-listes). */
function parseBullets(section: string): { label: string; body: string }[] {
  const lines = cleanText(section).split("\n");
  const bullets: { label: string; body: string }[] = [];
  const bulletRe = /^\s*[•‣▪◦*\-–—]\s+(.*)$/;
  for (const line of lines) {
    if (DECOR_LINE_RE.test(line.trim())) continue; // séparateur décoratif
    const m = line.match(bulletRe);
    if (m) {
      const t = m[1].trim();
      const ci = t.indexOf(":");
      if (ci > 0 && ci < 80) {
        bullets.push({ label: t.slice(0, ci).trim(), body: t.slice(ci + 1).trim() });
      } else {
        bullets.push({ label: "", body: t });
      }
    } else if (line.trim()) {
      const t = line.trim();
      // Ligne « Label : valeur » SANS puce (collage sans mise en forme) :
      // traitée comme une puce étiquetée plutôt que comme du prose perdue.
      const lm = t.match(LABEL_LINE_RE);
      if (lm) {
        bullets.push({ label: lm[1].trim(), body: lm[2].replace(STOP_LABEL_RE, "").trim() });
      } else if (bullets.length) {
        bullets[bullets.length - 1].body += `\n${t}`;
      } else {
        bullets.push({ label: "", body: t });
      }
    }
  }
  return bullets;
}

function normLabel(label: string): string {
  return stripAccents(label).toLowerCase().replace(/\s+/g, " ").trim();
}

function findBullet(bullets: { label: string; body: string }[], re: RegExp) {
  return bullets.find((b) => re.test(normLabel(b.label)));
}

/** Items d'une liste de raisons : sous-puces / lignes numérotées, segments
    séparés par « ; », sinon phrases. */
function splitReasons(body: string): string[] {
  const lines = body
    .split("\n")
    .map((l) => l.replace(/^\s*[-–—•*]\s*/, "").replace(/^\d+\s*[.)]\s*/, "").trim())
    .filter(Boolean);
  if (lines.length > 1) return lines;
  const flat = body.replace(/\s+/g, " ").trim();
  if (!flat) return [];
  const semi = flat
    .split(/\s*;\s*/)
    .map((s) => s.trim())
    .filter((s) => s.replace(/\W/g, "").length >= 12);
  if (semi.length > 1) return semi;
  if (flat.length <= 220) return [flat];
  const sentences = flat
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 24);
  return sentences.length > 1 ? sentences : [flat];
}

/* ---------- Compétition & sport ---------- */

function cleanCompetitionLabel(s: string): string {
  return s
    .replace(/\([^)]*\)/g, " ")
    .split(/[,;]/)[0]
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.。]+\s*$/, "");
}

function extractCompetition(body: string): { competition?: string; sportHint?: string } {
  const flat = stripAccents(body).toLowerCase().replace(/\s+/g, " ");
  for (const c of COMPETITIONS) {
    if (c.re.test(flat)) return { competition: c.label, sportHint: c.sport };
  }
  // Repli : partie après le séparateur « / » puis « – » / « — » / « - »
  let tail = "";
  const slashParts = body.split(/\s*\/\s*/);
  if (slashParts.length > 1) tail = slashParts.slice(1).join(" / ");
  if (!tail) {
    const dashParts = body.split(/\s+[–—-]\s+/);
    if (dashParts.length > 1) tail = dashParts.slice(1).join(" — ");
  }
  if (!tail) return {};
  tail = cleanCompetitionLabel(tail);
  if (tail.length >= 3 && tail.length <= 80) return { competition: tail };
  return {};
}

/* ---------- Date & heure ---------- */

function parseMatchDate(body: string, warnings: string[]): string | undefined {
  const flat = body.replace(/\n/g, " ");
  const monthKeys = Object.keys(MONTHS).sort((a, b) => b.length - a.length).join("|");

  // Format littéraire : « 17 octobre 2026 » / « 3 novembre 2025 »
  let day: number | undefined;
  let month: number | undefined;
  let year: number | undefined;
  const dm = flat.match(new RegExp(`(\\d{1,2})(?:er)?\\s+(${monthKeys})\\s+(\\d{4})`, "i"));
  if (dm) {
    day = parseInt(dm[1], 10);
    month = MONTHS[dm[2].toLowerCase()];
    year = parseInt(dm[3], 10);
  } else {
    // Formats numériques : 17/10/2026, 17-10-2026, 17.10.2026, 2026-10-17
    const ymd = flat.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);
    const dmy = ymd ? undefined : flat.match(/\b(\d{1,2})[/.‐-](\d{1,2})[/.‐-](\d{4})\b/);
    const parts = ymd ?? dmy;
    if (parts) {
      const a = parseInt(parts[1], 10);
      const b = parseInt(parts[2], 10);
      const c = parseInt(parts[3], 10);
      if (ymd) {
        year = a; month = b; day = c;
      } else {
        // Ambiguïté jour/mois : la valeur > 12 désigne forcément le jour
        day = a > 12 ? a : b > 12 ? b : a;
        month = day === a ? b : a;
        year = c;
      }
    }
  }
  if (day === undefined || month === undefined || year === undefined) return undefined;
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;

  let hour = 12;
  let minute = 0;
  const tm = flat.match(/(\d{1,2})\s*[h:]\s*(\d{2})?/i);
  let hasTime = false;
  if (tm) {
    hour = parseInt(tm[1], 10);
    minute = tm[2] ? parseInt(tm[2], 10) : 0;
    hasTime = true;
  }

  const tzm = flat.match(
    /\b(CEST|CETE?|WEST|WET|EEST|EET|PDT|PST|MDT|MST|CDT|CST|EDT|EST|UTC|GMT)\b/i
  );
  let offset = 0;
  if (tzm) {
    offset = TZ_OFFSETS[tzm[1].toUpperCase()] ?? 0;
  } else {
    warnings.push("fuseau horaire non détecté — heure lue comme UTC, vérifiez la date");
  }
  if (!hasTime) {
    warnings.push("heure du match non détectée — 12 h placée par défaut");
  }

  const utcMs = Date.UTC(year, month - 1, day, hour, minute) - offset * 3_600_000;
  return toDatetimeLocal(new Date(utcMs));
}

/* ---------- Statistiques clés (section C) ---------- */

/**
 * Extraction prudente : seules les statistiques « propres » sont conservées
 * (étiquette courte et lisible devant le nombre, ou étiquette après « : »).
 * Les fragments de prose sont ignorés (comptés dans `skipped`) afin de ne pas
 * polluer le public — le texte brut reste disponible dans le scénario.
 */
function parseKeyStats(body: string): { stats: KeyStatItem[]; skipped: number } {
  // Protège les décimales (2,33) avant découpe sur les virgules
  const flat = body.replace(/\s+/g, " ").replace(/(\d),(\d)/g, "$1\u0001$2");
  const clauses = flat
    .split(/\s*[;.]\s+|\s*[;]\s*|\s*,\s+/)
    .map((c) => c.replace(/\u0001/g, ",").trim())
    .filter((c) => stripAccents(c).length >= 6);

  const stats: KeyStatItem[] = [];
  let skipped = 0;
  for (const clause of clauses) {
    if (stats.length >= MAX_POINTS) break;
    const ci = clause.indexOf(":");
    const base = ci > 0 ? clause.slice(ci + 1) : clause;

    /* Score « N-N » (H2H 6-1, bilan 3-2…) : motif dédié, AVANT le nombre
       générique, pour éviter la lecture partielle « 6 ». Gardes anti-faux
       positifs : pas de chiffre/point/virgule/%% collé autour (exclut les
       plages décimales « 0,98-1,13 »). */
    const scoreRe = /(?<![\d.,%])(\d{1,3})\s*[-–]\s*(\d{1,3})(?![\d.,%])/;
    const sm = base.match(scoreRe);
    if (sm && sm.index !== undefined) {
      const before = base.slice(0, sm.index).trim();
      if (
        before.length >= 2 && before.length <= 48 &&
        !before.includes("(") && /[A-Za-zÀ-ÿ]/.test(before)
      ) {
        const after = base.slice(sm.index + sm[0].length).trim();
        const detail = after.replace(/^[\s,%–—-]+/, "").split("(")[0].trim();
        stats.push({
          label: before.replace(/[\s:;,–—-]+$/, "").slice(0, 120),
          value: `${sm[1]}-${sm[2]}`.slice(0, 60),
          ...(detail && detail !== before ? { detail: detail.slice(0, 300) } : {}),
        });
        continue;
      }
    }

    const numRe = /([+\-−~]?\s?\d[\d\u0001\u202f ]*(?:[.,]\d+)?)/;
    const nm = base.match(numRe);
    if (!nm) continue;
    const after = base.slice((nm.index ?? 0) + nm[0].length).trim();
    const unit = after.match(/^(%|u\b|buts?|jeux?|points?|pts?\b|match(?:e)?s?|set|sets|aces?|fautes?)/i);
    const unitTxt = unit ? unit[0] : "";
    const numStr = nm[0].replace(/\u0001/g, ",").replace(/\s{2,}/g, " ").trim();

    // Année isolée (1900-2099) sans unité → pas une statistique
    if (!unitTxt && /^(19|20)\d{2}$/.test(numStr)) {
      skipped++;
      continue;
    }

    let label: string;
    if (ci > 0) {
      label = clause.slice(0, ci).trim();
      if (label.length > 64 || !/[A-Za-zÀ-ÿ]/.test(label)) {
        skipped++;
        continue;
      }
    } else {
      const before = base.slice(0, nm.index ?? 0).trim();
      if (before.length < 2 || before.length > 48 || before.includes("(") || !/[A-Za-zÀ-ÿ]/.test(before)) {
        skipped++;
        continue;
      }
      label = before;
    }
    label = label
      .replace(/[\s:;,–—-]+$/, "")
      .replace(/\s+(dans|de|du|des|la|le|les|un|une|en|sur|par|pour|avec|et|ou|au|aux)\s*$/i, "")
      .replace(/[\s:;,–—-]+$/, "")
      .trim();
    if (label.length < 2) {
      skipped++;
      continue;
    }

    const detail = (unitTxt ? after.slice(unitTxt.length) : after).replace(/^[\s,%–—-]+/, "").trim();
    stats.push({
      label: label.slice(0, 120),
      value: (numStr + (unitTxt ? ` ${unitTxt}` : "")).slice(0, 60),
      ...(detail && detail !== label ? { detail: detail.slice(0, 300) } : {}),
    });
  }
  return { stats, skipped };
}

/* ---------- Niveau de confiance ---------- */

function levelToConfidence(level: string): string {
  if (level.startsWith("tr")) return "TRES_ELEVE";
  if (level.startsWith("faible")) return "FAIBLE";
  if (level.startsWith("modere")) return "MODERE";
  return "ELEVE";
}

const CONF_LEVEL = "(?:tr\\s?e\\s?s\\s+)?(?:eleve|faible|modere)";

/* ---------- Parseur principal ---------- */

export function parseAnalyzeText(raw: string): ImportReport {
  const warnings: string[] = [];
  const parseErrors: string[] = [];
  const values: ImportedValues = {};
  const filled: string[] = [];
  const synthesisBlocks: string[] = [];
  let contextLine = "";
  // Texte complet aplati + détecteur de puces (pour le repli global)
  const flatRawAll = cleanText(raw).replace(/\s+/g, " ");
  const bulletReTop = /^\s*[•‣▪◦*\-–—]\s+/;

  if (!raw || stripAccents(raw).replace(/\W/g, "").length < 40) {
    return { values, filled, warnings, parseErrors: ["Texte trop court ou vide."] };
  }

  const sections = splitSections(raw);
  const hasSections = Object.keys(sections).some((k) => k !== "ALL");
  if (!hasSections) {
    warnings.push("sections A à G non repérées — remplissage partiel par étiquettes");
  }
  const sec = (k: string) => sections[k] ?? (hasSections ? "" : sections.ALL ?? "");
  const bulletsOf = (k: string) => parseBullets(sec(k));

  /* ---- Titre (secours pour l'affiche) ---- */
  const titleLine = cleanText(raw).match(/Analyse\s*:\s*(.+)$/im);
  if (titleLine) {
    const title = titleLine[1].trim();
    if (title.length >= 3 && title.length <= 160) {
      values.matchName = title;
      filled.push("affiche (titre)");
    }
  }

  /* ---- A. Match et contexte ---- */
  const aBullets = bulletsOf("A");
  if (aBullets.length) {
    const matchB = findBullet(aBullets, /^(match|rencontre|affiche|evenement)\b/);
    if (matchB?.body) {
      values.matchName = matchB.body.replace(/\s+/g, " ").trim().replace(/[.]\s*$/, "").slice(0, 160);
      filled.push("affiche");
    }
    const sportB = findBullet(aBullets, /^sport/);
    const compB = findBullet(aBullets, /^competition/);
    // La compétition peut être collée à la ligne « Sport » OU avoir sa propre ligne :
    // les deux sources sont examinées, indépendamment l'une de l'autre.
    const compSource = sportB?.body || compB?.body || "";
    if (sportB?.body || compB?.body) {
      const flat = stripAccents(`${sportB?.body ?? ""} ${compB?.body ?? ""}`).toLowerCase();
      if (/\bfootball\b|\bsoccer\b|\bfoot\b/.test(flat)) values.sport = "FOOTBALL";
      else if (/\bbasket/.test(flat)) values.sport = "BASKETBALL";
      else if (/\btennis\b/.test(flat)) values.sport = "TENNIS";

      const comp =
        (compB?.body ? extractCompetition(compB.body) : {});
      // Repli sur la ligne « Sport » si la ligne « Compétition » n'a rien donné
      if (!comp.competition && sportB?.body) {
        const c2 = extractCompetition(sportB.body);
        if (c2.competition) (comp as { competition?: string }).competition = c2.competition;
        if (c2.sportHint && !comp.sportHint) (comp as { sportHint?: string }).sportHint = c2.sportHint;
      }
      if (comp.sportHint && !values.sport) values.sport = comp.sportHint;
      if (values.sport) filled.push("sport");
      else warnings.push("sport non reconnu — laissez la valeur actuelle");

      if (comp.competition) {
        values.competition = comp.competition.slice(0, 120);
        filled.push("compétition");
      } else if (compB?.body) {
        const label = cleanCompetitionLabel(compB.body);
        if (label) {
          values.competition = label.slice(0, 120);
          filled.push("compétition");
        }
      }
      if (!values.competition) {
        warnings.push("compétition introuvable dans la section A — à compléter");
      }
    }
    const dateB = findBullet(aBullets, /^date/);
    if (dateB?.body) {
      const local = parseMatchDate(dateB.body, warnings);
      if (local) {
        values.matchDate = local;
        filled.push("date du match");
        warnings.push("date/heure importée — à contrôler");
        const monthKeys2 = Object.keys(MONTHS).sort((a, b) => b.length - a.length).join("|");
        const dateRe2 = new RegExp(`^\\d{1,2}(?:er)?\\s+(${monthKeys2})\\s+\\d{4}$`, "i");
        const weekdayRe = /^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)$/i;
        // Retire les parenthèses contenant une heure (ex. « (autour de 08:30–10:30 …) »)
        const cleaned = dateB.body.replace(/\([^()]*\d{1,2}\s*[h:][^()]*\)/g, " ");
        const rest = cleaned
          .split(",")
          .map((s) => s.trim())
          .filter((s) => {
            if (!s) return false;
            const t = s.replace(/\s+/g, " ").trim();
            const stripped = t.replace(/^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\s+/i, "");
            if (weekdayRe.test(t)) return false;
            if (dateRe2.test(stripped)) return false;
            // Tout résidu lié à l'horaire est du bruit : heure « 21h00 »,
            // plage « 20h00-21h00 », fuseau « CET/CEST/UTC… », indications
            // de « autour de 20h » / « heure locale » — jamais du contexte utile.
            if (/\d{1,2}\s*[h:]/i.test(t)) return false;
            if (/\b(?:CEST|CET|WEST|WET|UTC|GMT|EET|EST|PST|PDT|CDT|CST|MDT|MST)\b/i.test(t)) return false;
            if (/(autour de|environ|heure locale|locale|fuseaux?|horaire)/i.test(t)) return false;
            // Seul un libellé significatif SANS chiffre mérite d'être conservé
            // (ex. « Mestalla », « Estádio do Dragão »).
            if (/\d/.test(t)) return false;
            if (stripAccents(t).replace(/[^A-Za-z]/g, "").length < 4) return false;
            return true;
          })
          .join(", ")
          .replace(/[()\[\]]/g, "")
          .replace(/\s{2,}/g, " ")
          .trim();
        if (rest && rest.length > 3) contextLine = rest.slice(0, 300);
      }
    } else {
      warnings.push("date du match introuvable dans la section A");
    }
  }

  /* ---- B. Scénario sportif ---- */
  const bBullets = bulletsOf("B");
  const keyPointItems: string[] = [];
  const summaryParts: string[] = [];

  if (bBullets.length) {
    for (const b of bBullets) {
      const lab = normLabel(b.label);
      if (/^raisons principales/.test(lab)) {
        keyPointItems.push(...splitReasons(b.body));
      } else if (/^scenario alternatif|^alternatif/.test(lab)) {
        if (b.body) {
          values.alternativeScenario = b.body.replace(/\s+/g, " ").trim().slice(0, 2000);
          filled.push("scénario alternatif");
        }
      } else if (/^facteurs/.test(lab)) {
        const items = b.body
          .split(/\s*;\s*|\n/)
          .map((l) => l.replace(/^\s*[-–—•*]\s*/, "").replace(/^\d+\s*[.)]\s*/, "").trim())
          .filter((l) => l.length >= 6);
        keyPointItems.push(...items);
      } else if (!b.label && b.body && b.body.replace(/\W/g, "").length >= 12) {
        // Sous-puces imbriqués (ex. liste de raisons sans étiquette)
        const items = b.body
          .split("\n")
          .map((l) => l.replace(/^\s*[-–—•*]\s*/, "").replace(/^\d+\s*[.)]\s*/, "").trim())
          .filter((l) => l.length >= 6);
        keyPointItems.push(...items);
      } else if (b.label) {
        summaryParts.push(`• ${b.label} : ${b.body.replace(/\s+/g, " ").trim()}`);
      } else {
        summaryParts.push(b.body.trim());
      }
    }
  }

  /* ---- C. Convergence des preuves ---- */
  const cBullets = bulletsOf("C");
  const convergenceParts: string[] = [];
  if (cBullets.length) {
    for (const b of cBullets) {
      const lab = normLabel(b.label);
      if (/^statistiques?/.test(lab) && b.body) {
        const { stats, skipped } = parseKeyStats(b.body);
        if (stats.length) {
          values.keyStats = stats;
          filled.push(`statistiques clés (${stats.length})`);
          if (skipped > 0) {
            warnings.push(`statistiques partielles (${skipped} fragment(s) non décodé(s)) — vérifiez la section C`);
          }
        } else {
          if (skipped > 0) {
            warnings.push("statistiques non décodées — section C à saisir à la main");
          }
          convergenceParts.push(`• ${b.label} : ${b.body.replace(/\s+/g, " ").trim()}`);
        }
      } else if (b.label) {
        convergenceParts.push(`• ${b.label} : ${b.body.replace(/\s+/g, " ").trim()}`);
      } else {
        convergenceParts.push(b.body.trim());
      }
    }
  }

  /* ---- D. Comparaison des marchés ---- */
  const dText = sec("D").trim();

  /* ---- Assemblage du scénario principal ----
     Sections reconnues : assemblage B + convergence + comparaison.
     Sans sections (collage plat) : texte narratif = tout SAUF les lignes
     « Label : valeur » de champs (déjà versés dans le formulaire) et la
     ligne d'affiche (déjà dans matchName). */
  const vsLineRe = /^[A-Za-zÀ-ÿ0-9.'\'\- ]{3,48}\s+vs\.?\s+[A-Za-zÀ-ÿ0-9.'\'\- ]{3,48}\s*$/;
  if (!hasSections) {
    const fieldLabelsNoNarr = FLAT_LABELS.filter((l) => l !== "equipe superieure");
    const fieldLineRe = new RegExp(
      `^(?:[-–—•*]\\s*)?(?:${fieldLabelsNoNarr.map((l) => accentPat(l).replace(/ /g, "\\s+")).join("|")})\\s*[:\\-–—]`,
      "i"
    );
    const narrative = cleanText(raw)
      .split("\n")
      .map((l) => stripInline(l).trim())
      .filter(Boolean)
      .filter((l) => !fieldLineRe.test(l))
      .filter((l) => !vsLineRe.test(l));
    if (narrative.length) {
      values.scenarioSummary = capText(narrative.join("\n"), MAX_SUMMARY, warnings, "scénario");
      filled.push("scénario sportif");
    }
  } else {
    const summaryChunks: string[] = [];
    if (contextLine) summaryChunks.push(contextLine);
    summaryChunks.push(...summaryParts);
    if (convergenceParts.length) {
      summaryChunks.push("Convergence des preuves :", ...convergenceParts);
    }
    if (dText) summaryChunks.push("Comparaison des marchés :", dText);
    const summary = summaryChunks.join("\n").trim();
    if (summary) {
      values.scenarioSummary = capText(summary, MAX_SUMMARY, warnings, "scénario");
      filled.push("scénario sportif");
    }
  }

  if (keyPointItems.length) {
    const cleaned = keyPointItems.filter((k) => !vsLineRe.test(k.trim()));
    if (cleaned.length) {
      const capped = cleaned.slice(0, MAX_POINTS).map((k) => k.slice(0, 480));
      values.keyPoints = capped.join("\n");
      filled.push(`points clés (${capped.length})`);
      if (cleaned.length > MAX_POINTS) {
        warnings.push(`points clés limités à ${MAX_POINTS} — ${cleaned.length - MAX_POINTS} ignorés`);
      }
    }
  }

  /* ---- E. Marché retenu ---- */
  const eBullets = bulletsOf("E");
  if (eBullets.length) {
    const marketB = findBullet(eBullets, /^(marche|market|marche\s+retenu|pari\s+retenu)\b/);
    if (marketB?.body) {
      let mk = marketB.body.replace(/\s+/g, " ").trim();
      mk = mk.split(/\s+\(ou\b/i)[0].trim(); // retire le second choix éventuel
      mk = mk.replace(/[;.。]+\s*$/, "").trim();
      values.market = mk.slice(0, 120);
      filled.push("marché");
    }
    const selB = findBullet(eBullets, /^(selection|pronostic|pari|choix|pick|pronostic\s+retenu)\b/);
    if (selB?.body) {
      values.selection = selB.body
        .replace(/\s+/g, " ")
        .trim()
        .replace(/[;.。]+\s*$/, "")
        .slice(0, 120);
      filled.push("sélection");
    }
    const lineB = findBullet(eBullets, /^ligne\b/);
    if (lineB?.body) {
      // Nombre signé en tête (« -0,5 ») ou, à défaut, premier nombre isolé
      // dans la valeur (« Under 2,5 (ou Under 2,25…) » → « 2,5 »).
      const lm = lineB.body.match(/^\s*([+\-−–—]?\s?\d+(?:[.,]\d+)?)/);
      if (lm) {
        values.line = lm[1].replace(/[−–—]/g, "-").replace(/\s+/g, "").slice(0, 60);
        filled.push("ligne");
      } else {
        const am = lineB.body.match(/([+\-−–]?\s?\d+(?:[.,]\d+)?)/);
        if (am) {
          values.line = am[1].replace(/[−–—]/g, "-").replace(/\s+/g, "").slice(0, 60);
          filled.push("ligne");
        }
      }
    }
    const oddsB = findBullet(eBullets, /^cote/);
    if (oddsB?.body) {
      const dec = oddsB.body.match(/\d{1,2}[.,]\d{1,3}/);
      let oddsVal: string | undefined;
      if (dec) {
        oddsVal = dec[0].replace(",", ".");
      } else {
        const plain = oddsB.body.match(/\b(\d{1,2}(?:[.,]\d+)?)\b/);
        if (plain) {
          const v = Number(plain[1].replace(",", "."));
          if (v >= 1.01 && v <= 100) oddsVal = String(v);
        }
      }
      if (oddsVal) {
        values.odds = oddsVal;
        filled.push("cote");
        warnings.push("cote importée — à contrôler");
      } else {
        warnings.push("cote introuvable (format non reconnu) — à saisir manuellement");
      }
    }
    const whyB = findBullet(eBullets, /^pourquoi/);
    if (whyB?.body) {
      synthesisBlocks.push(`Pourquoi ce marché : ${whyB.body.replace(/\s+/g, " ").trim()}`);
    }
  }

  /* ---- F. Verdict (avec repli sur le texte intégral) ---- */
  const fText = sec("F") || cleanText(raw);
  if (fText) {
    const vm = fText.match(/JE\s+JOUE(?:\s+SOUS\s+CONDITION)?/i);
    if (vm) {
      const v = stripAccents(vm[0]).toUpperCase().replace(/\s+/g, " ");
      if (v.includes("SOUS CONDITION")) {
        values.verdict = "JE_JOUE_SOUS_CONDITION";
        const cm = fText.match(/sous condition\s*[:\-–—]?\s*(.+)/i);
        values.condition = (cm ? cm[1] : "").replace(/\s+/g, " ").trim().slice(0, 2000) || undefined;
        if (!values.condition) warnings.push("condition d'exécution à préciser (verdict sous condition)");
      } else {
        values.verdict = "JE_JOUE";
      }
      filled.push("verdict");
    } else {
      warnings.push("verdict non détecté dans la section F");
    }

    const fFlat = stripAccents(fText).toLowerCase().replace(/\s+/g, " ");
    const conf = fFlat.match(
      new RegExp(`(?:niveau\\s+de\\s+|indice\\s+de\\s+)?confiance\\s*[:\\-–—]?\\s*(${CONF_LEVEL})(?:\\s*(?:a|ou|/|->|→)\\s*(${CONF_LEVEL}))?`)
    );
    if (conf) {
      values.confidence = levelToConfidence(conf[1]);
      filled.push("niveau de confiance");
      if (conf[2]) {
        warnings.push(
          `confiance ambiguë « ${conf[1]} à ${conf[2]} » — premier niveau appliqué, à confirmer`
        );
      }
    } else {
      warnings.push("niveau de confiance non détecté");
    }

    const fBullets = parseBullets(fText);
    const reasonsB = findBullet(fBullets, /^raisons d[ée]terminantes/);
    if (reasonsB?.body) {
      synthesisBlocks.push(`Raisons déterminantes : ${reasonsB.body.replace(/\s+/g, " ").trim()}`);
    }
    const limitB = findBullet(fBullets, /^principale limite/);
    if (limitB?.body) {
      synthesisBlocks.push(`Principale limite : ${limitB.body.replace(/\s+/g, " ").trim()}`);
    }
  }

  /* ---- G. Synthèse finale (prioritaire sur les blocs E/F) ----
     Uniquement si des sections ont été détectées : en collage plat sans
     sections, sec("G") renverrait le texte ENTIER — on ne l'utilise pas. */
  const gText = hasSections ? sec("G") : "";
  if (gText && gText.replace(/\W/g, "").length >= 60) {
    const g = gText
      .split("\n")
      .map((l) => l.replace(/^\s*[-–—•*]\s*/, "").trim())
      .filter(Boolean)
      .join("\n")
      .trim();
    values.synthesis = capText(g, MAX_SYNTHESIS, warnings, "synthèse");
    filled.push("synthèse finale (G)");
  } else if (synthesisBlocks.length) {
    values.synthesis = capText(synthesisBlocks.join("\n\n").trim(), MAX_SYNTHESIS, warnings, "synthèse");
    filled.push("synthèse finale");
  }

  /* ---- Repli global par étiquettes ------------------------------------
     Pour les collages sans structure reconnaissable (texte aplati, sections
     numérotées non détectées, labels éclatés) : chaque champ encore vide est
     recherché dans le TEXTE ENTIER par son étiquette. La valeur s'arrête au
     prochain label connu, à la fin de ligne ou à un saut de section. */
  if (filled.length === 0 || !values.market || !values.selection || !values.odds || !values.matchDate || !values.matchName) {
    // Parcourt chaque ligne : « Label : valeur » — la valeur s'étend jusqu'au
    // prochain label connu sur la MÊME ligne (collage aplati) ou fin de ligne.
    const rawLines = cleanText(raw).split("\n");
    const labeled: { label: string; body: string }[] = [];
    for (const line of rawLines) {
      const t = stripInline(line).trim();
      if (!t || DECOR_LINE_RE.test(t)) continue;
      const lm = t.match(LABEL_LINE_RE);
      if (lm) {
        labeled.push({ label: normLabel(lm[1]), body: lm[2].replace(STOP_LABEL_RE, "").trim() });
      } else if (labeled.length && !bulletReTop.test(t)) {
        // continuation : rattachée au dernier label (texte multi-lignes)
        labeled[labeled.length - 1].body += ` ${t.replace(STOP_LABEL_RE, "").trim()}`;
      }
    }
    const findL = (re: RegExp) => labeled.find((b) => re.test(b.label))?.body;

    if (!values.matchName) {
      const v = findL(/^(match|rencontre|affiche|evenement)$/);
      if (v) {
        values.matchName = v.replace(/[.]\s*$/, "").slice(0, 160);
        filled.push("affiche (repli)");
      }
    }
    if (!values.sport || !values.competition) {
      const v = findL(/^sport/) || findL(/^competition/);
      if (v && !values.competition) {
        const comp = extractCompetition(v);
        if (comp.competition) values.competition = comp.competition.slice(0, 120);
        if (comp.sportHint && !values.sport) values.sport = comp.sportHint;
        if (!values.competition) values.competition = cleanCompetitionLabel(v).slice(0, 120) || undefined;
        if (values.competition) filled.push("compétition (repli)");
      }
      if (!values.sport && values.competition) {
        const f = stripAccents(values.competition).toLowerCase();
        if (/\bfoot/.test(f)) values.sport = "FOOTBALL";
        else if (/\bbasket/.test(f)) values.sport = "BASKETBALL";
        else if (/\btennis/.test(f)) values.sport = "TENNIS";
        if (values.sport) filled.push("sport (repli)");
      }
    }
    if (!values.matchDate) {
      const v = findL(/^(date( et heure| du match)?|heure|jour)$/);
      if (v) {
        const local = parseMatchDate(v, warnings);
        if (local) {
          values.matchDate = local;
          filled.push("date du match (repli)");
          warnings.push("date/heure importée — à contrôler");
        }
      }
    }
    if (!values.market) {
      const v = findL(/^(marche|market|pari retenu)$/);
      if (v) {
        values.market = v.split(/\s+\(ou\b/i)[0].replace(/[;.]+$/, "").trim().slice(0, 120) || undefined;
        if (values.market) filled.push("marché (repli)");
      }
    }
    if (!values.selection) {
      const v = findL(/^(selection|pronostic|pari|choix|pick)$/);
      if (v) {
        values.selection = v.replace(/[;.]+$/, "").trim().slice(0, 120) || undefined;
        if (values.selection) filled.push("sélection (repli)");
      }
    }
    // « Marché » contenant déjà le pari (ex. « Marché : Under 2,5 ») :
    // si la sélection manque, la dériver du marché plutôt que la perdre.
    if (!values.selection && values.market && values.market.length <= 40) {
      values.selection = values.market;
      filled.push("sélection (= marché)");
      warnings.push("sélection déduite du marché — vérifiez-la");
    }
    if (!values.line) {
      const v = findL(/^ligne\b/);
      const lm = v?.match(/^\s*([+\-−–—]?\s?\d+(?:[.,]\d+)?)/);
      if (lm) {
        values.line = lm[1].replace(/[−–—]/g, "-").replace(/\s+/g, "").slice(0, 60);
        filled.push("ligne (repli)");
      } else {
        const am = v?.match(/([+\-−–]?\s?\d+(?:[.,]\d+)?)/);
        if (am) {
          values.line = am[1].replace(/[−–—]/g, "-").replace(/\s+/g, "").slice(0, 60);
          filled.push("ligne (repli)");
        }
      }
    }
    if (!values.odds) {
      const v = findL(/^cotes?$/);
      if (v) {
        const dec = v.match(/\d{1,2}[.,]\d{1,3}/);
        if (dec) {
          values.odds = dec[0].replace(",", ".");
          filled.push("cote (repli)");
          warnings.push("cote importée — à contrôler");
        }
      }
    }
    if (!values.verdict) {
      const vm3 = flatRawAll.match(/JE\s+JOUE(?:\s+SOUS\s+CONDITION)?/i);
      if (vm3) {
        const v = stripAccents(vm3[0]).toUpperCase().replace(/\s+/g, " ");
        values.verdict = v.includes("SOUS CONDITION") ? "JE_JOUE_SOUS_CONDITION" : "JE_JOUE";
        filled.push("verdict (repli)");
      }
    }
    if (!values.confidence) {
      const cm = flatRawAll.match(
        new RegExp(`(?:niveau\\s+de\\s+|indice\\s+de\\s+)?confiance\\s*[:\\-–—]?\\s*(${CONF_LEVEL})(?:\\s*(?:a|ou|/|->|→)\\s*(${CONF_LEVEL}))?`, "i")
      );
      if (cm) {
        values.confidence = levelToConfidence(stripAccents(cm[1]).toLowerCase());
        filled.push("niveau de confiance (repli)");
        if (cm[2]) warnings.push(`confiance ambiguë « ${cm[1]} à ${cm[2]} » — premier niveau appliqué`);
      }
    }
  }

  /* ---- Explicitation des champs restés vides (aucun échec silencieux) ---- */
  if (filled.length >= 2) {
    const criticals: [string, string | undefined][] = [
      ["affiche (nom du match)", values.matchName],
      ["date du match", values.matchDate],
      ["marché", values.market],
      ["sélection", values.selection],
      ["cote", values.odds],
    ];
    for (const [label, v] of criticals) {
      if (!v) warnings.push(`${label} non reconnu(e) — à remplir manuellement`);
    }
  }

  /* ---- Ligne déduite de la sélection (aucun échec silencieux) ----
     « FC Porto -0,5 » → ligne « -0,5 » ; « Under 2,5 » → « 2,5 ».
     Seulement si aucune ligne n'a été trouvée ailleurs. */
  if (!values.line && values.selection) {
    const sel = values.selection.replace(/\s+/g, " ").trim();
    const sm =
      sel.match(/(?:^|\s)([+\-−–]\s?\d+(?:[.,]\d+)?)\s*$/) ??
      sel.match(/^(?:under|over|moins de|plus de|au-dessus de|en-dessous de)\s+(\d+(?:[.,]\d+)?)/i);
    if (sm) {
      values.line = (sm[1] ?? "").replace(/[−–—]/g, "-").replace(/\s+/g, "").slice(0, 60);
      if (values.line) {
        filled.push("ligne (dérivée de la sélection)");
        warnings.push("ligne déduite de la sélection — vérifiez-la");
      }
    }
  }

  /* ---- Dernier repli pour l'affiche : motif « X vs Y » ---- */
  if (!values.matchName) {
    const vm2 = cleanText(raw)
      .slice(0, 600)
      .match(/([A-Za-zÀ-ÿ0-9.''\- ]{3,48})\s+\bvs\.?\b\s+([A-Za-zÀ-ÿ0-9.''\- ]{3,48})/);
    if (vm2) {
      values.matchName = `${vm2[1].trim()} vs ${vm2[2].trim()}`.slice(0, 160);
      filled.push("affiche (vs)");
    }
  }

  if (filled.length === 0) {
    parseErrors.push("aucun champ reconnu — vérifiez que le texte suit le format NODE.47 (sections A à G)");
  }

  return { values, filled, warnings, parseErrors };
}
