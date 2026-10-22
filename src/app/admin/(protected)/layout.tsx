import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";
import { LogoMark } from "@/components/logo";
import { AdminLogoutButton } from "@/components/admin-logout";
import type { Metadata } from "next";

/** La console analyste ne doit jamais être indexée */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <LogoMark size={30} />
            <span className="flex flex-col leading-none">
              <span className="font-display text-sm font-semibold tracking-[0.14em]">
                Console analyste
              </span>
              <span className="mt-0.5 text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
                NODE.47 — Privé
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Voir le site
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
