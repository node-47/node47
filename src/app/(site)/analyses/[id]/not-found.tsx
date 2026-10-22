import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:py-32">
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-primary">
        Erreur 404
      </p>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Cette analyse n&apos;existe pas (ou plus)
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
        La page demandée est introuvable : le lien peut être expiré ou l&apos;analyse a été
        retirée de la publication.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/analyses"
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
        >
          Voir les analyses publiées
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold transition-colors hover:bg-secondary/60"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
