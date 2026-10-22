"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, EyeOff, Pencil, Trash2, Check, X, RotateCcw, Ban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export function PickActions({
  pickId,
  status,
  result,
}: {
  pickId: string;
  status: string;
  result: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  async function patch(body: Record<string, unknown>, successMessage: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/picks/${pickId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast({
          title: "Action impossible",
          description: data?.error ?? "Erreur serveur.",
          variant: "destructive",
        });
        return;
      }
      toast({ title: successMessage });
      startTransition(() => router.refresh());
    } catch {
      toast({
        title: "Erreur réseau",
        description: "Vérifiez votre connexion et réessayez.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/picks/${pickId}`, { method: "DELETE" });
      if (!res.ok) {
        toast({
          title: "Suppression impossible",
          description: "Erreur serveur.",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Analyse supprimée" });
      startTransition(() => router.refresh());
    } catch {
      toast({ title: "Erreur réseau", variant: "destructive" });
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  }

  const disabled = busy || pending;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            aria-label="Actions sur l'analyse"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Publication
          </DropdownMenuLabel>
          {status === "PUBLISHED" ? (
            <DropdownMenuItem onClick={() => patch({ status: "DRAFT" }, "Analyse dépubliée")}>
              <EyeOff className="h-4 w-4" /> Dépublier
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => patch({ status: "PUBLISHED" }, "Analyse publiée")}>
              <Eye className="h-4 w-4" /> Publier
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Régler le résultat
          </DropdownMenuLabel>
          <DropdownMenuItem
            disabled={result === "WON"}
            onClick={() => patch({ result: "WON" }, "Résultat réglé : gagné")}
          >
            <Check className="h-4 w-4 text-success" /> Gagné
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={result === "LOST"}
            onClick={() => patch({ result: "LOST" }, "Résultat réglé : perdu")}
          >
            <X className="h-4 w-4 text-destructive" /> Perdu
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={result === "PUSH"}
            onClick={() => patch({ result: "PUSH" }, "Résultat réglé : remboursé")}
          >
            <RotateCcw className="h-4 w-4" /> Remboursé
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={result === "VOID"}
            onClick={() => patch({ result: "VOID" }, "Résultat réglé : annulé")}
          >
            <Ban className="h-4 w-4" /> Annulé
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={result === "PENDING"}
            onClick={() => patch({ result: "PENDING" }, "Résultat remis en attente")}
          >
            <RotateCcw className="h-4 w-4" /> Remettre en attente
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => (window.location.href = `/admin/analyses/${pickId}`)}
          >
            <Pencil className="h-4 w-4" /> Modifier
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setConfirmDelete(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" /> Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette analyse ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. L&apos;analyse disparaîtra du site public et de la
              console.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={busy}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {busy ? "Suppression…" : "Supprimer définitivement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
