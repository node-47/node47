"use client";

import { useState } from "react";
import { Copy, Download, Check } from "lucide-react";

/** Export des inscrits newsletter : copie presse-papiers + téléchargement .txt */
export function NewsletterExport({ emails }: { emails: string[] }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(emails.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard indisponible : le téléchargement reste possible
    }
  }

  function handleDownload() {
    const blob = new Blob([emails.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `node47-newsletter-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        disabled={emails.length === 0}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-success" aria-hidden="true" />
            Copié
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" aria-hidden="true" />
            Copier les emails
          </>
        )}
      </button>
      <button
        type="button"
        onClick={handleDownload}
        disabled={emails.length === 0}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Télécharger (.txt)
      </button>
    </div>
  );
}
