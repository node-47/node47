import type { picks } from "../../db/schema";

type Pick = typeof picks.$inferSelect;
export type Sport = "FOOTBALL" | "BASKETBALL" | "TENNIS";
export type Verdict = "JE_JOUE" | "JE_JOUE_SOUS_CONDITION";
export type Confidence = "FAIBLE" | "MODERE" | "ELEVE" | "TRES_ELEVE";
export type PickResult = "PENDING" | "WON" | "LOST" | "PUSH" | "VOID";
export interface KeyStatItem { label: string; value: string; detail?: string }
export type DecodedPick = Omit<Pick, "keyPoints" | "keyStats"> & { keyPoints: string[]; keyStats: KeyStatItem[] };

export const SPORT_LABELS: Record<Sport, string> = { FOOTBALL: "Football", BASKETBALL: "Basketball", TENNIS: "Tennis" };
export const SPORT_ABBREVIATIONS: Record<Sport, string> = { FOOTBALL: "FOOT", BASKETBALL: "BASKET", TENNIS: "TENNIS" };
export const SPORT_TAGLINES: Record<Sport, string> = {
  FOOTBALL: "Forme, styles et contexte : les marchés retenus sur le terrain.",
  BASKETBALL: "Rythme, rotations et efficacité : les décisions sur le parquet.",
  TENNIS: "Surface, dynamique et opposition : les sélections sur le court.",
};
export const VERDICT_LABELS: Record<Verdict, string> = { JE_JOUE: "Je joue", JE_JOUE_SOUS_CONDITION: "Je joue sous condition" };
export const VERDICT_LABELS_SHORT: Record<Verdict, string> = { JE_JOUE: "Je joue", JE_JOUE_SOUS_CONDITION: "Sous condition" };
export const CONFIDENCE_LABELS: Record<Confidence, string> = { FAIBLE: "Faible", MODERE: "Modéré", ELEVE: "Élevé", TRES_ELEVE: "Très élevé" };
export const CONFIDENCE_ORDER: Confidence[] = ["FAIBLE", "MODERE", "ELEVE", "TRES_ELEVE"];
export const RESULT_LABELS: Record<PickResult, string> = { PENDING: "En attente", WON: "Gagné", LOST: "Perdu", PUSH: "Remboursé", VOID: "Annulé" };
export const STATUS_LABELS: Record<string, string> = { DRAFT: "Brouillon", PUBLISHED: "Publié" };
const options = <T extends string>(labels: Record<T, string>) => (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }));
export const SPORT_OPTIONS = options(SPORT_LABELS);
export const VERDICT_OPTIONS = options(VERDICT_LABELS);
export const CONFIDENCE_OPTIONS = options(CONFIDENCE_LABELS);
export const RESULT_OPTIONS = options(RESULT_LABELS);
export const STAKE_UNITS: Record<Confidence, number> = { FAIBLE: 0.5, MODERE: 1, ELEVE: 1.5, TRES_ELEVE: 2 };
export const STAKE_LABELS: Record<Confidence, string> = { FAIBLE: "0,5 u", MODERE: "1 u", ELEVE: "1,5 u", TRES_ELEVE: "2 u" };
export function stakeOf(confidence: string): number { return STAKE_UNITS[confidence as Confidence] ?? 1; }
export function stakeLabelOf(confidence: string): string { return STAKE_LABELS[confidence as Confidence] ?? STAKE_LABELS.MODERE; }
export const verdictStyles: Record<Verdict, { badge: string; dot: string }> = {
  JE_JOUE: { badge: "border-primary/30 bg-primary/10 text-primary", dot: "bg-primary" },
  JE_JOUE_SOUS_CONDITION: { badge: "border-warning/30 bg-warning/10 text-warning", dot: "bg-warning" },
};
export const resultStyles: Record<PickResult, { badge: string }> = {
  PENDING: { badge: "border-border bg-secondary text-muted-foreground" },
  WON: { badge: "border-primary/30 bg-primary/10 text-primary" },
  LOST: { badge: "border-destructive/30 bg-destructive/10 text-destructive" },
  PUSH: { badge: "border-border bg-secondary text-foreground" },
  VOID: { badge: "border-border bg-secondary text-muted-foreground" },
};
function parseArray(value: string): unknown[] {
  try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
}
export function decodePick(pick: Pick): DecodedPick {
  return { ...pick,
    keyPoints: parseArray(pick.keyPoints).filter((v): v is string => typeof v === "string"),
    keyStats: parseArray(pick.keyStats).filter((v): v is KeyStatItem => !!v && typeof v === "object" && "label" in v && typeof v.label === "string" && "value" in v && typeof v.value === "string"),
  };
}

type PerformancePick = { status: string; result: string; confidence: string; odds: number | null };
export function unitsProfit(pick: PerformancePick): number | null {
  if (pick.result === "WON") return pick.odds == null ? null : (pick.odds - 1) * stakeOf(pick.confidence);
  if (pick.result === "LOST") return -stakeOf(pick.confidence);
  if (pick.result === "PUSH" || pick.result === "VOID") return 0;
  return null;
}
export function summarize(picks: PerformancePick[]) {
  const published = picks.filter((p) => p.status === "PUBLISHED");
  const settled = published.filter((p) => p.result === "WON" || p.result === "LOST");
  const won = settled.filter((p) => p.result === "WON").length;
  const lost = settled.filter((p) => p.result === "LOST").length;
  const units = settled.reduce((sum, p) => sum + (unitsProfit(p) ?? 0), 0);
  const staked = settled.reduce((sum, p) => sum + stakeOf(p.confidence), 0);
  return { published: published.length, played: published.length, won, lost, settledCount: settled.length,
    pending: published.filter((p) => p.result === "PENDING").length,
    void: published.filter((p) => p.result === "VOID").length,
    push: published.filter((p) => p.result === "PUSH").length,
    units, staked, winRate: settled.length ? won / settled.length * 100 : null,
    roi: staked ? units / staked * 100 : null,
  };
}

const DAY = 86_400_000;
export const EDITION_HOUR_UTC = 8;
export const EDITION_WINDOW_DAYS = 3;
export const TRACKING_WINDOW_DAYS = 30;
export function editionDayOf(value: Date | string): Date {
  const date = new Date(new Date(value).getTime() - EDITION_HOUR_UTC * 3_600_000);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
export function editionWindow(day: Date) {
  const start = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), EDITION_HOUR_UTC));
  return { start, end: new Date(start.getTime() + DAY) };
}
export function editionCalendarDays(count = EDITION_WINDOW_DAYS, now = new Date()): Date[] {
  const today = editionDayOf(now).getTime();
  return Array.from({ length: count }, (_, i) => new Date(today - i * DAY));
}
export function editionDayLabel(day: Date, now = new Date()) {
  const age = Math.round((editionDayOf(now).getTime() - day.getTime()) / DAY);
  return { relative: ["Aujourd'hui", "Hier", "Avant-hier"][age] ?? null,
    full: new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(day) };
}
export function trackingWindowStart(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - (TRACKING_WINDOW_DAYS - 1) * DAY);
}
export function isInTrackingWindow(pick: { result: string; publishedAt: Date | string | null; settledAt: Date | string | null; matchDate: Date | string }, from = trackingWindowStart()): boolean {
  const value = pick.result === "PENDING" ? pick.publishedAt : pick.settledAt ?? pick.matchDate;
  return value != null && new Date(value).getTime() >= from.getTime();
}
export function formatTrackingPeriod(now = new Date()): string {
  const fmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
  return `${fmt.format(trackingWindowStart(now))} – ${fmt.format(now)}`;
}
const number = (value: number, digits = 2) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: digits }).format(value);
export function formatStake(value: number): string { return `${number(value)} u`; }
export function formatSignedUnits(value: number): string { return `${value > 0 ? "+" : ""}${number(value)} u`; }
export function formatPercent(value: number | null): string { return value == null ? "—" : `${value > 0 ? "+" : ""}${number(value, 1)} %`; }
export function formatOdds(value: number): string { return new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 3 }).format(value); }
export function formatDateTime(value: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value));
}
export function formatMatchShort(value: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(new Date(value));
}
export function toDatetimeLocal(value: Date | string): string {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}
export function inWordsFr(value: Date | string, now = new Date()): string {
  const minutes = Math.ceil((new Date(value).getTime() - now.getTime()) / 60_000);
  if (minutes <= 0) return "";
  if (minutes < 60) return `dans ${minutes} min`;
  if (minutes < 1440) return `dans ${Math.ceil(minutes / 60)} h`;
  return `dans ${Math.ceil(minutes / 1440)} j`;
}
export function timeAgoFr(value: Date | string | null, now = new Date()): string {
  if (!value) return "";
  const minutes = Math.max(0, Math.floor((now.getTime() - new Date(value).getTime()) / 60_000));
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  if (minutes < 1440) return `il y a ${Math.floor(minutes / 60)} h`;
  return `il y a ${Math.floor(minutes / 1440)} j`;
}
