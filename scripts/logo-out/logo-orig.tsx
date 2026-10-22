import { cn } from "@/lib/utils";

/** Marque losange verte + typographie « Trader Intelligence » */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="h-[9px] w-[9px] shrink-0 rotate-45 bg-primary"
        style={{ boxShadow: "0 0 12px var(--gauge-glow)" }}
      />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[16px] font-bold tracking-[0.05em]">
          NODE<span className="text-primary">.47</span>
        </span>
        <span className="mt-1 whitespace-nowrap font-display text-[9px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
          Trader Intelligence
        </span>
      </span>
    </span>
  );
}

/** Marque seule (losange) — console admin, favicon de page */
export function LogoMark({ className, size = 34 }: { className?: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, boxShadow: "0 0 16px var(--gauge-glow)" }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10",
        className
      )}
    >
      <span className="block h-[9px] w-[9px] rotate-45 bg-primary" />
    </span>
  );
}
