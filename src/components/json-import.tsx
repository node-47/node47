"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ClipboardPaste,
  FileJson,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { parsePickJson, type JsonImportResult } from "@/lib/json-import";
import type { PickFormInitial } from "@/components/pick-form";
import { useToast } from "@/hooks/use-toast";

/**
 * Section 00 du formulaire de création : import d'un fichier JSON généré par
 * une IA externe (voir PROMPT-IA-IMPORT-JSON). Préremplit le formulaire sans
 * rien publier : l'analyste relit, ajuste puis publie manuellement.
 */
export function JsonImportSection({ onApply }: { onApply: (data: Partial<PickFormInitial>) => void }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [pasted, setPasted] = useState("");
  const [result, setResult] = useState<JsonImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function apply(text: string) {
    const res = parsePickJson(text);
    setResult(res);

    if (res.errors.length > 0) return;

    const d = res.data;
    if (res.filled === 0) {
      toast({
        title: "Rien à importer",
        description: "Le fichier ne contient aucun champ exploitable. Vérifiez le format attendu.",
      });
      return;
    }

    const patch: Partial<PickFormInitial> = {};
    if (d.sport) patch.sport = d.sport;
    if (d.competition) patch.competition = d.competition;
    if (d.matchName) patch.matchName = d.matchName;
    if (d.matchDate) patch.matchDate = d.matchDate;
    if (d.scenarioSummary) patch.scenarioSummary = d.scenarioSummary;
    if (d.expectedScenario) patch.expectedScenario = d.expectedScenario;
    if (d.keyPoints?.length) patch.keyPoints = d.keyPoints.join("\n");
    if (d.keyStats?.length) patch.keyStats = d.keyStats;
    if (d.alternativeScenario) patch.alternativeScenario = d.alternativeScenario;
    if (d.market) patch.market = d.market;
    if (d.selection) patch.selection = d.selection;
    if (d.line) patch.line = d.line;
    if (d.odds) patch.odds = d.odds;
    if (d.verdict) patch.verdict = d.verdict;
    if (d.confidence) patch.confidence = d.confidence;
    if (d.condition) patch.condition = d.condition;
    if (d.synthesis) patch.synthesis = d.synthesis;

    onApply(patch);
    toast({
      title: `JSON importé — ${res.filled} champ${res.filled > 1 ? "s" : ""} rempli${res.filled > 1 ? "s" : ""}`,
      description:
        res.warnings.length > 0
          ? `${res.warnings.length} point${res.warnings.length > 1 ? "s" : ""} à vérifier ci-dessous.`
          : "Relisez le formulaire puis publiez quand vous voulez.",
    });
  }

  async function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permet de re-choisir le même fichier
    if (!file) return;
    try {
      const text = await file.text();
      apply(text);
    } catch {
      setResult({
        data: {},
        filled: 0,
        warnings: [],
        errors: ["Impossible de lire ce fichier. Choisissez un fichier .json valide."],
      });
    }
  }

  return (
    <section className="rounded-xl border border-dashed border-primary/35 bg-primary/[0.035] p-5 sm:p-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <span className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <FileJson className="h-4 w-4 text-primary" aria-hidden="true" />
          </span>
          <span>
            <span className="font-display block text-sm font-semibold uppercase tracking-[0.14em] text-primary">
              00 — Importer un fichier JSON
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              Préremplit le formulaire depuis le fichier JSON généré par votre IA. Les champs déjà
              remplis ne sont écrasés que si le fichier en fournit un nouveau. Rien n&apos;est publié
              automatiquement.
            </span>
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="mt-5 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json,text/plain"
              className="hidden"
              onChange={onFileChosen}
            />
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Choisir un fichier JSON…
            </Button>
            <button
              type="button"
              onClick={() => setShowPaste((s) => !s)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <ClipboardPaste className="h-3.5 w-3.5" aria-hidden="true" />
              ou coller le JSON à la main
            </button>
          </div>

          {showPaste && (
            <div className="space-y-2.5">
              <Textarea
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                rows={6}
                placeholder='{ "sport": "FOOTBALL", "competition": "…", "matchName": "…", … }'
                className="font-mono text-xs"
              />
              <Button
                type="button"
                variant="secondary"
                className="h-9"
                disabled={!pasted.trim()}
                onClick={() => apply(pasted)}
              >
                Analyser le JSON collé
              </Button>
            </div>
          )}

          {result?.errors.map((err) => (
            <p
              key={err}
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {err}
            </p>
          ))}

          {result && result.errors.length === 0 && result.filled > 0 && (
            <p className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              Import réussi — {result.filled} champ{result.filled > 1 ? "s" : ""} prérempli
              {result.filled > 1 ? "s" : ""} dans le formulaire ci-dessous.
            </p>
          )}

          {result && result.warnings.length > 0 && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {result.warnings.length} point{result.warnings.length > 1 ? "s" : ""} à vérifier :
              </p>
              <ul className="mt-1.5 list-inside list-disc space-y-1 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                {result.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs leading-relaxed text-muted-foreground/70">
            Clés attendues dans le fichier : sport · competition · matchName · matchDate ·
            lectureDuMatch · scenarioAttendu · keyPoints · keyStats · alternativeScenario ·
            verdict · confidence · condition · market · selection · line · odds · synthesis.
          </p>
        </div>
      )}
    </section>
  );
}
