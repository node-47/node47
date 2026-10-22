"use client";

import { usePathname } from "next/navigation";

/**
 * Mention « Avertissement » du pied de page.
 * Masquée sur /a-propos : cette page dispose déjà d'un cadre dédié
 * « Jeu responsable » + « Avertissement » — le texte n'y figure qu'une fois.
 */
export function FooterDisclaimer() {
  const pathname = usePathname();
  if (pathname === "/a-propos") return null;
  return (
    <p className="text-xs leading-relaxed text-muted-foreground/80">
      Avertissement — Les paris sportifs comportent des risques réels : endettement, isolement,
      dépendance. Les performances passées ne préjugent pas des résultats futurs et aucune
      sélection publiée sur ce site ne constitue une garantie de gain. Contenu réservé aux
      personnes majeures (18+). Pour être aidé, appelez le 09&nbsp;74&nbsp;75&nbsp;13&nbsp;13
      (appel non surtaxé).
    </p>
  );
}
