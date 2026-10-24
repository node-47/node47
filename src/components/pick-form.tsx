"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SPORT_OPTIONS,
  VERDICT_OPTIONS,
  CONFIDENCE_OPTIONS,
  RESULT_OPTIONS,
  STAKE_LABELS,
  type Confidence,
  type KeyStatItem,
} from "@/lib/picks";
import { useToast } from "@/hooks/use-toast";
import { JsonImportSection } from "@/components/json-import";

export interface PickFormInitial {
  id?: string;
  sport: string;
  competition: string;
  matchName: string;
  matchDate: string; // format datetime-local
  expectedScenario: string; // « Scénario attendu » — déroulement projeté
  keyPoints: string; // une ligne = un point
  alternativeScenario: string;
  keyStats: KeyStatItem[];
  market: string;
  selection: string;
  line: string;
  odds: string;
  verdict: string;
  confidence: string;
  condition: string;
  synthesis: string;
  status: string;
  result: string;
  resultNote: string;
}

export function EmptyPickForm(): PickFormInitial {
  return {
    sport: "FOOTBALL",
    competition: "",
    matchName: "",
    matchDate: "",
    expectedScenario: "",
    keyPoints: "",
    alternativeScenario: "",
    keyStats: [],
    market: "",
    selection: "",
    line: "",
    odds: "",
    verdict: "JE_JOUE",
    confidence: "MODERE",
    condition: "",
    synthesis: "",
    status: "DRAFT",
    result: "PENDING",
    resultNote: "",
  };
}

/** Date (Date|ISO) -> "YYYY-MM-DDTHH:mm" pour input datetime-local */
export function toDatetimeLocal(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function Field({
  label,
  children,
  hint,
  className,
  warn,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
  warn?: boolean;
}) {
  return (
    <div className={className}>
      <Label className="text-[13px] font-medium">
        {label}
        {warn && (
          <span className="ml-2 inline-block rounded-full bg-amber-500/15 px-2 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            à vérifier
          </span>
        )}
      </Label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

export function PickForm({ initial, mode }: { initial?: PickFormInitial; mode: "create" | "edit" }) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<PickFormInitial>(initial ?? EmptyPickForm());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof PickFormInitial>(key: K, value: PickFormInitial[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  /* --- Stats clés dynamiques --- */
  function updateStat(index: number, patch: Partial<KeyStatItem>) {
    setForm((f) => ({
      ...f,
      keyStats: f.keyStats.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  }
  function addStat() {
    setForm((f) => (f.keyStats.length >= 12 ? f : { ...f, keyStats: [...f.keyStats, { label: "", value: "" }] }));
  }
  function removeStat(index: number) {
    setForm((f) => ({ ...f, keyStats: f.keyStats.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    /* Validation légère côté client */
    if (!form.competition.trim()) return setError("La compétition est requise.");
    if (!form.matchName.trim()) return setError("L'affiche du match est requise.");
    if (!form.matchDate) return setError("La date et l'heure du match sont requises.");

    const oddsNum = form.odds.trim() ? Number(form.odds.replace(",", ".")) : null;
    if (oddsNum !== null && (!Number.isFinite(oddsNum) || oddsNum < 1)) {
      return setError("La cote doit être un nombre supérieur ou égal à 1.");
    }

    const keyPoints = form.keyPoints
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const keyStats = form.keyStats
      .filter((s) => s.label.trim() && s.value.trim())
      .map((s) => ({
        label: s.label.trim(),
        value: s.value.trim(),
        ...(s.detail?.trim() ? { detail: s.detail.trim() } : {}),
      }));

    const payload = {
      sport: form.sport,
      competition: form.competition.trim(),
      matchName: form.matchName.trim(),
      matchDate: new Date(form.matchDate).toISOString(),
      expectedScenario: form.expectedScenario.trim(),
      keyPoints,
      keyStats,
      alternativeScenario: form.alternativeScenario.trim() || null,
      market: form.market.trim(),
      selection: form.selection.trim(),
      line: form.line.trim() || null,
      odds: oddsNum,
      verdict: form.verdict,
      confidence: form.confidence,
      condition: form.condition.trim() || null,
      synthesis: form.synthesis.trim(),
      status: form.status,
      result: form.result,
      resultNote: form.resultNote.trim() || null,
    };

    setLoading(true);
    try {
      const res =
        mode === "create"
          ? await fetch("/api/admin/picks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/picks/${initial?.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Enregistrement impossible.");
        return;
      }

      toast({
        title:
          mode === "create"
            ? payload.status === "PUBLISHED"
              ? "Analyse créée et publiée"
              : "Analyse créée en brouillon"
            : "Analyse mise à jour",
      });
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ============ 0. Import JSON (création uniquement) ============ */}
      {mode === "create" && (
        <JsonImportSection onApply={(data) => setForm((f) => ({ ...f, ...data }))} />
      )}

      {/* ============ 1. Match ============ */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-primary">
          01 — Rencontre
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Sport">
            <Select value={form.sport} onValueChange={(v) => set("sport", v)}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Choisir un sport" />
              </SelectTrigger>
              <SelectContent>
                {SPORT_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Compétition" hint="Ex. : Premier League, NBA, ATP Masters 1000">
            <Input
              value={form.competition}
              onChange={(e) => set("competition", e.target.value)}
              placeholder="Premier League"
              className="h-10"
            />
          </Field>

          <Field label="Affiche du match" hint="Ex. : Arsenal vs Chelsea ou Alcaraz vs Sinner">
            <Input
              value={form.matchName}
              onChange={(e) => set("matchName", e.target.value)}
              placeholder="Arsenal vs Chelsea"
              className="h-10"
            />
          </Field>

          <Field label="Date et heure du match">
            <Input
              type="datetime-local"
              value={form.matchDate}
              onChange={(e) => set("matchDate", e.target.value)}
              className="h-10"
            />
          </Field>
        </div>
      </section>

      {/* ============ 2. Analyse (résumés publics) ============ */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-primary">
          02 — Résumés publiés aux visiteurs
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Ces champs constituent la face publique de l&apos;analyse. Le déroulement complet de
          votre méthode reste privé.
        </p>

        <div className="mt-5 space-y-5">
          <Field
            label="Scénario attendu"
            hint="Comment le match devrait se dérouler : résultat projeté et manière de jouer (250 caractères maximum recommandés)."
          >
            <Textarea
              value={form.expectedScenario}
              onChange={(e) => set("expectedScenario", e.target.value)}
              rows={3}
              placeholder="Ex. : Victoire d’Alavés, probablement serrée (1-0 ou 2-1). Domination territoriale et volume de tirs côté basque…"
            />
          </Field>

          <Field
            label="Points clés de la décision"
            hint="Une ligne = un point. Ces arguments apparaissent sous « Ce qui a pesé dans la décision »."
          >
            <Textarea
              value={form.keyPoints}
              onChange={(e) => set("keyPoints", e.target.value)}
              rows={4}
              placeholder={"Ex. : xG cumulé nettement supérieur sur les 6 derniers matchs\nEx. : Absence du milieu défensif adverse confirmée\nEx. : Modèles et marché convergent sur la même lecture"}
            />
          </Field>

          <Field label="Statistiques clés" hint="Maximum 12 statistiques. Laissez vide si non pertinent.">
            <div className="space-y-2.5">
              {form.keyStats.map((stat, i) => (
                <div key={i} className="grid gap-2 rounded-lg border border-border/70 bg-secondary/30 p-3 sm:grid-cols-12">
                  <Input
                    value={stat.label}
                    onChange={(e) => updateStat(i, { label: e.target.value })}
                    placeholder="Libellé (ex. xG sur 5 matchs)"
                    className="h-9 sm:col-span-5"
                  />
                  <Input
                    value={stat.value}
                    onChange={(e) => updateStat(i, { value: e.target.value })}
                    placeholder="Valeur (ex. 2,14)"
                    className="h-9 sm:col-span-2"
                  />
                  <Input
                    value={stat.detail ?? ""}
                    onChange={(e) => updateStat(i, { detail: e.target.value })}
                    placeholder="Détail court (optionnel)"
                    className="h-9 sm:col-span-4"
                  />
                  <button
                    type="button"
                    onClick={() => removeStat(i)}
                    className="inline-flex h-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-destructive sm:col-span-1"
                    aria-label={`Supprimer la statistique ${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addStat}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Ajouter une statistique
              </button>
            </div>
          </Field>

          <Field label="Scénario alternatif (optionnel)">
            <Textarea
              value={form.alternativeScenario}
              onChange={(e) => set("alternativeScenario", e.target.value)}
              rows={2}
              placeholder="Le scénario secondaire crédible si la lecture principale dérape…"
            />
          </Field>
        </div>
      </section>

      {/* ============ 3. Décision ============ */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-primary">
          03 — Décision
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Verdict">
            <Select value={form.verdict} onValueChange={(v) => set("verdict", v)}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VERDICT_OPTIONS.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Niveau de confiance"
            hint={`Mise appliquée : ${
              STAKE_LABELS[(form.confidence as Confidence) in STAKE_LABELS ? (form.confidence as Confidence) : "MODERE"]
            } — échelle fixe : Faible 0,5 u · Modéré 1 u · Élevé 1,5 u · Très élevé 2 u.`}
          >
            <Select value={form.confidence} onValueChange={(v) => set("confidence", v)}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONFIDENCE_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label} — {STAKE_LABELS[c.value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {form.verdict === "JE_JOUE_SOUS_CONDITION" && (
            <Field
              label="Condition d'exécution"
              hint="Précisez l'élément exact à confirmer (composition, ligne disponible, prix…)."
              className="sm:col-span-2"
            >
              <Textarea
                value={form.condition}
                onChange={(e) => set("condition", e.target.value)}
                rows={2}
                placeholder="Ex. : Position jouable uniquement si le prix reste au-dessus de 1,80 à l'ouverture des compositions."
              />
            </Field>
          )}

          <Field label="Marché" hint="Ex. : Asian Handicap, Over/Under, Handicap jeux">
            <Input
              value={form.market}
              onChange={(e) => set("market", e.target.value)}
              placeholder="Asian Handicap"
              className="h-10"
            />
          </Field>

          <Field label="Sélection" hint="Ex. : Arsenal -0,5 · Over 2,5 · Djokovic -3,5 jeux">
            <Input
              value={form.selection}
              onChange={(e) => set("selection", e.target.value)}
              placeholder="Arsenal -0,5"
              className="h-10"
            />
          </Field>

          <Field label="Ligne (optionnel)" hint="Ex. : -0,5 · 2,5 · -3,5">
            <Input
              value={form.line}
              onChange={(e) => set("line", e.target.value)}
              placeholder="-0,5"
              className="h-10"
            />
          </Field>

          <Field
            label="Cote observée (optionnel)"
            hint="Laissez vide si non vérifiable (affiché N/D)."
          >
            <Input
              inputMode="decimal"
              value={form.odds}
              onChange={(e) => set("odds", e.target.value)}
              placeholder="1,85"
              className="h-10"
            />
          </Field>

          <Field label="Synthèse finale" className="sm:col-span-2">
            <Textarea
              value={form.synthesis}
              onChange={(e) => set("synthesis", e.target.value)}
              rows={3}
              placeholder="« [Équipe] est supérieur pour [raisons]. Les preuves convergent. Le marché qui traduit le mieux ce scénario est [marché]. Ma décision est [verdict]. »"
            />
          </Field>
        </div>
      </section>

      {/* ============ 4. Publication & résultat ============ */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-primary">
          04 — Publication{mode === "edit" ? " & résultat" : ""}
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border border-border/70 bg-secondary/30 px-4 py-3.5">
            <div>
              <Label className="text-[13px] font-medium">Publier sur le site</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {form.status === "PUBLISHED"
                  ? "Visible immédiatement par les visiteurs."
                  : "Brouillon privé — invisible du public."}
              </p>
            </div>
            <Switch
              checked={form.status === "PUBLISHED"}
              onCheckedChange={(checked) => set("status", checked ? "PUBLISHED" : "DRAFT")}
              aria-label="Publier sur le site"
            />
          </div>

          {mode === "edit" && (
            <div className="rounded-lg border border-border/70 bg-secondary/30 px-4 py-3.5">
              <Label className="text-[13px] font-medium">Résultat</Label>
              <Select value={form.result} onValueChange={(v) => set("result", v)}>
                <SelectTrigger className="mt-1.5 h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESULT_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === "edit" && (
            <Field
              label="Note de résultat (optionnel)"
              hint="Ex. : Match reporté · Remboursé suite à l'abandon…"
              className="sm:col-span-2"
            >
              <Input
                value={form.resultNote}
                onChange={(e) => set("resultNote", e.target.value)}
                className="h-10"
              />
            </Field>
          )}
        </div>
      </section>

      {/* Erreur */}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {/* Soumission */}
      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin")}
          className="h-11"
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="h-11 gap-2 bg-primary px-6 text-primary-foreground hover:bg-primary/90"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Enregistrement…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden="true" />
              {mode === "create" ? "Créer l'analyse" : "Enregistrer les modifications"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
