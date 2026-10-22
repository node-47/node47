"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bascule thème sombre ↔ thème clair.
 * Les deux icônes sont rendues et inversées via la classe `dark` portée par
 * <html> — aucune différence entre serveur et client, donc zéro décalage
 * d'hydratation et pas d'état de montage nécessaire.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark")}
      aria-label="Basculer entre thème sombre et thème clair"
      title="Thème sombre / clair"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary",
        className
      )}
    >
      {/* Affiché en thème sombre → propose de passer en clair */}
      <Sun className="hidden h-[18px] w-[18px] dark:block" aria-hidden="true" />
      {/* Affiché en thème clair → propose de passer en sombre */}
      <Moon className="h-[18px] w-[18px] dark:hidden" aria-hidden="true" />
    </button>
  );
}
