import { cn } from "@/lib/utils";
import type { Sport } from "@/lib/picks";

/** Icônes sportives minimalistes (style trait fin du thème « Trader Intelligence ») */
export function SportIcon({
  sport,
  className,
  size = 20,
}: {
  sport: Sport;
  className?: string;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: cn("shrink-0", className),
  };

  if (sport === "FOOTBALL") {
    // Ballon de football : cercle + pentagone central plein + 5 rayons vers le cercle
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path
          d="M12 8l3.8 2.76-1.45 4.44H9.65L8.2 10.76z"
          fill="currentColor"
          stroke="none"
        />
        <path d="M12 8V3M15.8 10.76l4.76-1.54M14.35 15.2l2.94 4.08M9.65 15.2l-2.94 4.08M8.2 10.76L3.44 9.22" />
      </svg>
    );
  }

  if (sport === "BASKETBALL") {
    // Ballon : cercle + croix + arcs latéraux
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18M3 12h18M5.7 5.7c3.1 3.3 3.1 9.3 0 12.6M18.3 5.7c-3.1 3.3-3.1 9.3 0 12.6" />
      </svg>
    );
  }

  // TENNIS : balle à courbes latérales
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M6 5.4a8.4 8.4 0 0 1 0 13.2M18 5.4a8.4 8.4 0 0 0 0 13.2" />
    </svg>
  );
}

/** Couleurs d'accent par sport — pilotées par les variables du thème */
export const sportAccent: Record<Sport, { text: string; bg: string; border: string }> = {
  FOOTBALL: {
    text: "text-sport-football",
    bg: "bg-sport-football/10",
    border: "border-sport-football/25",
  },
  BASKETBALL: {
    text: "text-sport-basketball",
    bg: "bg-sport-basketball/10",
    border: "border-sport-basketball/25",
  },
  TENNIS: {
    text: "text-sport-tennis",
    bg: "bg-sport-tennis/10",
    border: "border-sport-tennis/25",
  },
};
