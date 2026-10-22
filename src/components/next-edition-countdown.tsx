"use client";

import { useSyncExternalStore } from "react";
import { Clock3 } from "lucide-react";
import { EDITION_HOUR_UTC } from "@/lib/picks";

const REFRESH_MS = 30_000;

/** Prochaine ouverture d'édition : aujourd'hui à 8 h UTC, sinon demain */
function nextEditionStart(now: Date): Date {
  const target = new Date(now);
  target.setUTCHours(EDITION_HOUR_UTC, 0, 0, 0);
  if (target.getTime() <= now.getTime()) target.setUTCDate(target.getUTCDate() + 1);
  return target;
}

/* Horloge externe lue via useSyncExternalStore :
   - aucune écriture d'état dans un effet (règle react-hooks/set-state-in-effect)
   - rendu serveur neutre puis horloge locale après hydratation (zéro mismatch) */

let cachedNowMs = 0;

/** Notifie React toutes les 30 s */
function subscribe(onStoreChange: () => void): () => void {
  const timer = setInterval(onStoreChange, REFRESH_MS);
  return () => clearInterval(timer);
}

/** Instant courant, figé entre deux ticks (snapshot stable) */
function getSnapshot(): number {
  const t = Date.now();
  if (t - cachedNowMs >= REFRESH_MS) cachedNowMs = t;
  return cachedNowMs;
}

/** Rendu serveur + premier rendu client : horloge absente */
function getServerSnapshot(): number {
  return 0;
}

/**
 * Compte à rebours jusqu'à la prochaine édition (8 h UTC).
 */
export function NextEditionCountdown() {
  const nowMs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const now = nowMs > 0 ? new Date(nowMs) : null;

  const target = now ? nextEditionStart(now) : null;
  const diffMs = now && target ? Math.max(0, target.getTime() - now.getTime()) : 0;
  const hours = Math.floor(diffMs / 3_600_000);
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
  const localTime = target
    ? target.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-xl border border-primary/25 bg-primary/6 px-5 py-3.5 text-xs text-muted-foreground sm:text-sm">
      <Clock3 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <span>
        Prochaines analyses à {EDITION_HOUR_UTC}&nbsp;h&nbsp;UTC —{" "}
        {now && target ? (
          <>
            dans{" "}
            <span className="font-mono font-semibold text-foreground">
              {hours}&nbsp;h {String(minutes).padStart(2, "0")}&nbsp;min
            </span>{" "}
            <span className="whitespace-nowrap">({localTime}, heure locale)</span>
          </>
        ) : (
          <span className="font-mono" aria-hidden="true">
            —&nbsp;h&nbsp;——&nbsp;min
          </span>
        )}
      </span>
    </p>
  );
}
