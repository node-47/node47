import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PickForm } from "@/components/pick-form";

export const metadata = {
  title: "Nouvelle analyse",
};

export default function NewPickPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Retour à la console
      </Link>

      <div className="mt-5">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Nouvelle analyse
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Renseignez la rencontre, les résumés publics et la décision finale. Vous gardez le
          contrôle : rien n&apos;est visible tant que l&apos;analyse n&apos;est pas publiée.
        </p>
      </div>

      <div className="mt-8">
        <PickForm mode="create" />
      </div>
    </div>
  );
}
