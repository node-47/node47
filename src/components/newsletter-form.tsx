"use client";

import { useState } from "react";

/**
 * Formulaire d'inscription newsletter (accueil).
 * Inscription persistée en base via /api/newsletter ; statut affiché en ligne.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    setStatus(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setStatus({ ok: false, message: "Adresse email invalide." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setStatus({ ok: false, message: data?.error ?? "Inscription impossible pour le moment." });
        return;
      }
      setStatus({ ok: true, message: data?.message ?? "Inscription confirmée." });
      setEmail("");
    } catch {
      setStatus({ ok: false, message: "Erreur réseau. Réessayez." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[440px] flex-none flex-1">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2.5" noValidate>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          autoComplete="email"
          aria-label="Adresse email pour la newsletter"
          className="h-11 min-w-[200px] flex-1 rounded-lg border border-border bg-secondary px-3.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center rounded-lg bg-primary px-6 font-display text-sm font-semibold text-primary-foreground transition-all hover:shadow-[0_0_28px_var(--accent-glow)] disabled:opacity-60"
        >
          {loading ? "Inscription…" : "S'inscrire"}
        </button>
      </form>
      {status && (
        <p
          role="status"
          className={`mt-2.5 text-xs ${status.ok ? "text-primary" : "text-destructive"}`}
        >
          {status.message}
        </p>
      )}
    </div>
  );
}
