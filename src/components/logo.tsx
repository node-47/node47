import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo officiel NODE.47 : symbole « 47 » en nœuds de réseau (extrait du logo fourni,
 * fond transparent) + typographie « Trader Intelligence ».
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/mark.png"
        alt=""
        width={38}
        height={38}
        priority
        className="shrink-0"
        style={{ filter: "drop-shadow(0 0 9px var(--gauge-glow))" }}
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

/** Symbole seul (logo « 47 ») — console admin, cadres compacts */
export function LogoMark({ className, size = 34 }: { className?: string; size?: number }) {
  const inner = Math.round(size * 0.82);
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, boxShadow: "0 0 16px var(--gauge-glow)" }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10",
        className
      )}
    >
      <Image src="/mark.png" alt="" width={inner} height={inner} className="object-contain" />
    </span>
  );
}
