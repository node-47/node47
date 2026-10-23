import type { KeyStatItem } from "@/lib/picks";
import { toDatetimeLocal } from "@/lib/picks";

/* ---------- Limites éditoriales NODE.47 appliquées à l'import JSON ---------- */

export const JSON_IMPORT_LIMITS = {
  scenarioSummary: 500, // lecture du match : 500 caractères maximum (indicatif)
  expectedScenario: 250, // scénario attendu : 250 caractères maximum
  synthesis: 400, // synthèse finale : 400 caractères maximum
  keyPoints: 4, // points clés de la décision : 4 lignes maximum
  keyStats: 5, // statistiques clés : 5 maximum
} as const;

/* ---------- Types ---------- */

/** Champs que l'import JSON peut préremplir (tous optionnels — merge non destructif) */
export type JsonPickData = Partial<{
  sport: string;
  competition: string;
  matchName: string;
  matchDate: string; // format datetime-local (input du formulaire)
  scenarioSummary: string; // « Lecture du match » — contexte factuel
  expectedScenario: string; // « Scénario attendu » — déroulement projeté
  keyPoints: string[];
  keyStats: KeyStatItem[];
  alternativeScenario: string;
  market: string;
  selection: string;
  line: string;
  odds: string; // chaîne décimale pour l'input du formulaire
  verdict: string;
  confidence: string;
  condition: string;
  synthesis: string;
}>;

export interface JsonImportResult {
  data: JsonPickData;
  filled: number; // nombre de champs réellement remplis
  warnings: string[]; // messages non bloquants (à vérifier / ignorés)
  errors: string[]; // bloquants (JSON illisible, structure inattendue)
}

/* ---------- Helpers ---------- */

function norm(s: unknown): string {
  return typeof s === "string" ? s.trim() : "";
}

/** Minuscules + suppression des accents (comparaison tolérante) */
function fold(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** Clé pliée pour matcher les noms de champs (espaces, tirets, accents ignorés) */
function foldKey(k: string): string {
  return fold(k).replace(/[^a-z0-9]/g, "");
}

function foldedMap(obj: Record<string, unknown>): Map<string, unknown> {
  const m = new Map<string, unknown>();
  for (const [k, v] of Object.entries(obj)) m.set(foldKey(k), v);
  return m;
}

function firstString(obj: Map<string, unknown>, names: string[]): string {
  for (const n of names) {
    const v = obj.get(n);
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return "";
}

/* ---------- Alias acceptés (l'IA peut varier les libellés) ---------- */

const SPORT_ALIASES: Record<string, string> = {
  football: "FOOTBALL", foot: "FOOTBALL", soccer: "FOOTBALL", ft: "FOOTBALL",
  basketball: "BASKETBALL", basket: "BASKETBALL", nba: "BASKETBALL", bk: "BASKETBALL",
  tennis: "TENNIS", atp: "TENNIS", wta: "TENNIS", tn: "TENNIS",
};

const VERDICT_ALIASES: Record<string, string> = {
  jejoue: "JE_JOUE", joue: "JE_JOUE", oui: "JE_JOUE", direct: "JE_JOUE",
  jejouesouscondition: "JE_JOUE_SOUS_CONDITION", souscondition: "JE_JOUE_SOUS_CONDITION",
  conditionnel: "JE_JOUE_SOUS_CONDITION",
};

const CONFIDENCE_ALIASES: Record<string, string> = {
  faible: "FAIBLE", low: "FAIBLE",
  modere: "MODERE", moderee: "MODERE", moyen: "MODERE", moyenne: "MODERE", medium: "MODERE", normal: "MODERE",
  eleve: "ELEVE", haute: "ELEVE", haut: "ELEVE", high: "ELEVE", forte: "ELEVE",
  treseleve: "TRES_ELEVE", treshaute: "TRES_ELEVE", treshaut: "TRES_ELEVE", veryhigh: "TRES_ELEVE", maximale: "TRES_ELEVE", max: "TRES_ELEVE",
};

/** Tous les noms de champs reconnus (pour signaler proprement les champs inconnus) */
const KNOWN_KEYS = new Set<string>(
  [
    "sport",
    "competition", "championnat", "league", "ligue", "tournoi",
    "matchname", "affiche", "affichedumatch", "match", "rencontre", "matchup",
    "matchdate", "date", "datedumatch", "dateheure", "dateetheure", "datetime", "kickoff",
    "scenariosummary", "scenarioattendu", "scenariosportif", "scenariosportifresume", "scenario",
    "expectedscenario", "scenarioprevu", "scenarioprojete", "lecturedumatch", "lecturematch", "lecture", "lecturedujeu",
    "keypoints", "pointscles", "pointsdescles", "pointsdeclesdeladecision", "pointsclesdeladecision", "pointsdecision", "raisons", "raisonsdeterminantes",
    "keystats", "statscles", "statistiquescles", "stats", "statistiques",
    "alternativescenario", "scenarioalternatif", "alternatif",
    "verdict", "decision",
    "confidence", "confiance", "niveaudeconfiance", "niveauconfiance",
    "condition", "conditions", "conditiondexecution", "conditiondexec", "conditionsexecution",
    "market", "marche", "marcheretenu", "marchepari", "typemarche",
    "selection", "pick", "pronostic", "pari", "choix",
    "line", "ligne",
    "odds", "odd", "cote", "coteobservee", "cotation", "price", "prix",
    "synthesis", "synthese", "synthesefinale", "conclusion", "resumefinal",
  ].map(foldKey)
);

/* ---------- Parseurs de valeurs ---------- */

function parseSport(raw: unknown, warnings: string[]): string | undefined {
  if (raw === undefined || raw === null) return undefined;
  const key = fold(String(raw)).replace(/[^a-z]/g, "");
  const mapped = SPORT_ALIASES[key];
  if (mapped) return mapped;
  warnings.push(`Sport « ${String(raw)} » non reconnu (FOOTBALL, BASKETBALL ou TENNIS) — champ laissé inchangé.`);
  return undefined;
}

function parseEnum(
  raw: unknown,
  aliases: Record<string, string>,
  label: string,
  warnings: string[]
): string | undefined {
  if (raw === undefined || raw === null) return undefined;
  const key = fold(String(raw)).replace(/[^a-z]/g, "");
  const mapped = aliases[key];
  if (mapped) return mapped;
  warnings.push(`Valeur « ${String(raw)} » non reconnue pour ${label} — champ laissé inchangé.`);
  return undefined;
}

/** Date ISO, « 2026-10-23 19:00 », « 23/10/2026 20:00 » ou timestamp → datetime-local */
function parseMatchDate(raw: unknown): string | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? undefined : toDatetimeLocal(d);
  }
  const s = norm(raw);
  if (!s) return undefined;
  const fr = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (fr) {
    const [, dd, mm, yyyy, hh = "0", mi = "0"] = fr;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(mi));
    return Number.isNaN(d.getTime()) ? undefined : toDatetimeLocal(d);
  }
  const d = new Date(s.includes("T") ? s : s.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? undefined : toDatetimeLocal(d);
}

/** Cote : nombre, « 1,85 », « @1.85 », « 1,70-2,00 » → première valeur exploitable */
function parseOdds(raw: unknown, warnings: string[]): string | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === "number") {
    if (Number.isFinite(raw) && raw >= 1 && raw <= 1000) return String(raw);
    warnings.push("Cote hors limites (1 à 1000) — champ laissé vide.");
    return undefined;
  }
  const s = norm(raw);
  if (!s) return undefined;
  const nums = [...s.replace(",", ".").matchAll(/\d+(\.\d+)?/g)]
    .map((m) => Number(m[0]))
    .filter((n) => n >= 1 && n <= 1000);
  if (!nums.length) {
    warnings.push(`Cote illisible (« ${s} ») — champ laissé vide.`);
    return undefined;
  }
  if (nums.length > 1) {
    warnings.push(`Cote fournie comme intervalle (« ${s} ») : ${nums[0]} retenue, à ajuster si besoin.`);
  }
  return String(nums[0]);
}

function parseKeyPoints(raw: unknown, warnings: string[]): string[] | undefined {
  let arr: string[] | null = null;
  if (Array.isArray(raw)) arr = raw.map(norm).filter(Boolean);
  else if (typeof raw === "string") arr = raw.split(/\r?\n/).map(norm).filter(Boolean);
  if (!arr) return undefined;
  if (arr.length > JSON_IMPORT_LIMITS.keyPoints) {
    warnings.push(
      `${arr.length - JSON_IMPORT_LIMITS.keyPoints} point(s) clé(s) ignoré(s) : maximum ${JSON_IMPORT_LIMITS.keyPoints} lignes.`
    );
    arr = arr.slice(0, JSON_IMPORT_LIMITS.keyPoints);
  }
  return arr.length ? arr : undefined;
}

const STAT_LABEL_KEYS = ["label", "libelle", "intitule", "nom"];
const STAT_VALUE_KEYS = ["value", "valeur", "chiffre"];
const STAT_DETAIL_KEYS = ["detail", "discours", "discourt", "commentaire", "comment", "note"];

function parseKeyStats(raw: unknown, warnings: string[]): KeyStatItem[] | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (!Array.isArray(raw)) {
    warnings.push("« keyStats » doit être un tableau — champ ignoré.");
    return undefined;
  }
  const out: KeyStatItem[] = [];
  let dropped = 0;
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const m = foldedMap(item as Record<string, unknown>);
    const label = firstString(m, STAT_LABEL_KEYS);
    const value = firstString(m, STAT_VALUE_KEYS);
    const detail = firstString(m, STAT_DETAIL_KEYS);
    if (!label || !value) {
      dropped += 1;
      continue;
    }
    if (out.length < JSON_IMPORT_LIMITS.keyStats) {
      out.push(detail ? { label, value, detail } : { label, value });
    } else {
      dropped += 1;
    }
  }
  if (dropped > 0) {
    warnings.push(
      `${dropped} statistique(s) ignorée(s) : maximum ${JSON_IMPORT_LIMITS.keyStats}, et chaque stat exige « label » + « value ».`
    );
  }
  return out.length ? out : undefined;
}

/* ---------- Fonction principale ---------- */

export function parsePickJson(text: string): JsonImportResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return {
      data: {},
      filled: 0,
      warnings,
      errors: [
        "Fichier JSON illisible. Vérifiez que le contenu est bien un objet JSON complet (accolades { } sans texte autour).",
      ],
    };
  }

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {
      data: {},
      filled: 0,
      warnings,
      errors: ["Le JSON doit être un objet unique { … } (pas une liste ni un tableau d'analyses)."],
    };
  }

  const src = foldedMap(raw as Record<string, unknown>);
  const get = (...names: string[]): unknown => {
    for (const n of names) {
      const v = src.get(n);
      if (v !== undefined) return v;
    }
    return undefined;
  };

  const data: JsonPickData = {};
  let filled = 0;
  const put = <K extends keyof JsonPickData>(key: K, value: JsonPickData[K]) => {
    if (value === undefined) return;
    if (typeof value === "string" && !value.trim()) return;
    if (Array.isArray(value) && value.length === 0) return;
    data[key] = value;
    filled += 1;
  };

  /* Champs simples */
  put("sport", parseSport(get("sport"), warnings));
  put("competition", norm(get("competition", "championnat", "league", "ligue", "tournoi")));
  put("matchName", norm(get("matchname", "affiche", "affichedumatch", "match", "rencontre")));
  put(
    "matchDate",
    parseMatchDate(get("matchdate", "date", "datedumatch", "dateheure", "dateetheure", "datetime", "kickoff"))
  );
  put("market", norm(get("market", "marche", "marcheretenu", "typemarche")));
  put("selection", norm(get("selection", "pick", "pronostic", "pari")));
  put("line", norm(get("line", "ligne")));
  put("odds", parseOdds(get("odds", "odd", "cote", "coteobservee", "cotation", "price"), warnings));
  put("verdict", parseEnum(get("verdict", "decision"), VERDICT_ALIASES, "le verdict", warnings));
  put(
    "confidence",
    parseEnum(
      get("confidence", "confiance", "niveaudeconfiance", "niveauconfiance"),
      CONFIDENCE_ALIASES,
      "le niveau de confiance",
      warnings
    )
  );
  put("condition", norm(get("condition", "conditions", "conditiondexecution", "conditionsexecution")));
  put("alternativeScenario", norm(get("alternativescenario", "scenarioalternatif", "alternatif")));

  /* Champs limités en longueur (conservés tels quels + avertissement) */
  const lecture = norm(
    get(
      "scenariosummary",
      "lecturedumatch",
      "lecturematch",
      "lecture",
      "lecturedujeu",
      "scenariosportif",
      "scenariosportifresume",
      "scenario"
    )
  );
  if (lecture) {
    if (lecture.length > JSON_IMPORT_LIMITS.scenarioSummary) {
      warnings.push(
        `Lecture du match : ${lecture.length} caractères (maximum conseillé ${JSON_IMPORT_LIMITS.scenarioSummary}) — à raccourcir si besoin.`
      );
    }
    put("scenarioSummary", lecture);
  }

  const scen = norm(
    get("expectedscenario", "scenarioattendu", "scenarioprevu", "scenarioprojete")
  );
  if (scen) {
    if (scen.length > JSON_IMPORT_LIMITS.expectedScenario) {
      warnings.push(
        `Scénario attendu : ${scen.length} caractères (maximum ${JSON_IMPORT_LIMITS.expectedScenario}) — à raccourcir avant publication.`
      );
    }
    put("expectedScenario", scen);
  }

  const syn = norm(get("synthesis", "synthese", "synthesefinale", "conclusion", "resumefinal"));
  if (syn) {
    if (syn.length > JSON_IMPORT_LIMITS.synthesis) {
      warnings.push(
        `Synthèse finale : ${syn.length} caractères (maximum ${JSON_IMPORT_LIMITS.synthesis}) — à raccourcir avant publication.`
      );
    }
    put("synthesis", syn);
  }

  /* Listes structurées */
  put(
    "keyPoints",
    parseKeyPoints(
      get(
        "keypoints",
        "pointscles",
        "pointsdescles",
        "pointsdeclesdeladecision",
        "pointsclesdeladecision",
        "pointsdecision",
        "raisons",
        "raisonsdeterminantes"
      ),
      warnings
    )
  );
  put(
    "keyStats",
    parseKeyStats(get("keystats", "statscles", "statistiquescles", "stats", "statistiques"), warnings)
  );

  /* Champs inconnus → information (l'IA a peut-être ajouté des clés hors format) */
  const originalKeys = Object.keys(raw as Record<string, unknown>);
  const unknown = originalKeys.filter((k) => !KNOWN_KEYS.has(foldKey(k)));
  if (unknown.length) {
    warnings.push(`Champ(s) hors format ignoré(s) : ${unknown.join(", ")}.`);
  }

  /* Champs essentiels manquants → rappel non bloquant */
  const essentials: [keyof JsonPickData, string][] = [
    ["competition", "Compétition"],
    ["matchName", "Affiche du match"],
    ["matchDate", "Date et heure du match"],
  ];
  for (const [key, label] of essentials) {
    const v = data[key];
    if (v === undefined || (typeof v === "string" && !v.trim())) {
      warnings.push(`${label} absente ou illisible dans le fichier — à compléter à la main.`);
    }
  }

  return { data, filled, warnings, errors };
}
