"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Lock } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Mot de passe incorrect.");
        setShake(true);
        setTimeout(() => setShake(false), 400);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 0%, var(--accent-glow), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div
        className={`relative w-full max-w-sm animate-rise ${shake ? "animate-[shake_0.35s_ease-in-out]" : ""}`}
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark size={54} />
          <h1 className="mt-5 flex items-center gap-2 font-display text-[22px] font-bold tracking-tight">
            <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
            Espace rédaction
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Accès réservé à la rédaction NODE.47.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[14px] border border-border bg-card p-7 shadow-[0_14px_34px_var(--overlay-shadow)]"
        >
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <KeyRound
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-11 pl-9"
                autoFocus
                required
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || password.length === 0}
            className="mt-6 h-11 w-full gap-2 bg-primary font-display text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Vérification…
              </>
            ) : (
              "Déverrouiller"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          Session sécurisée de 30 jours — cookie signé côté serveur.
        </p>
      </div>
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: none;
          }
          25% {
            transform: translateX(-7px);
          }
          75% {
            transform: translateX(7px);
          }
        }
      `}</style>
    </div>
  );
}
