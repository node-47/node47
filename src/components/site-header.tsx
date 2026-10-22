"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/football", label: "Football" },
  { href: "/basketball", label: "Basketball" },
  { href: "/tennis", label: "Tennis" },
  { href: "/analyses", label: "Analyses" },
  { href: "/performance", label: "Performances" },
  { href: "/a-propos", label: "À propos" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-bg-glass backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center gap-5 px-4 sm:px-6">
        <Link href="/" aria-label="NODE.47 — Accueil" className="transition-opacity hover:opacity-85">
          <Logo />
        </Link>

        {/* Navigation desktop */}
        <nav className="ml-auto hidden items-center gap-[19px] lg:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[13px] font-medium transition-colors",
                isActive(link.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle className="ml-1" />
        </nav>

        {/* Boutons mobile / tablette */}
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-lg border border-border"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          >
            <span
              className={cn(
                "block h-[2px] w-[18px] rounded bg-muted-foreground transition-transform",
                open && "translate-y-[7px] rotate-45"
              )}
            />
            <span
              className={cn(
                "block h-[2px] w-[18px] rounded bg-muted-foreground transition-opacity",
                open && "opacity-0"
              )}
            />
            <span
              className={cn(
                "block h-[2px] w-[18px] rounded bg-muted-foreground transition-transform",
                open && "-translate-y-[7px] -rotate-45"
              )}
            />
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <nav
          className="border-t border-border bg-background lg:hidden"
          aria-label="Navigation mobile"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block border-b border-border/60 px-6 py-3.5 text-sm font-medium",
                isActive(link.href) ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
