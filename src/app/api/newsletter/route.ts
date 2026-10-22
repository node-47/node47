import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Inscription newsletter — public, rate-limité implicitement par la validation stricte */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase()
      .slice(0, 254);

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }

    const existing = await db.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ ok: true, message: "Cet email est déjà inscrit." });
    }

    await db.newsletterSubscriber.create({ data: { email } });
    return NextResponse.json({
      ok: true,
      message: "Inscription confirmée. Rendez-vous au prochain verdict.",
    });
  } catch {
    return NextResponse.json(
      { error: "Inscription impossible pour le moment. Réessayez plus tard." },
      { status: 500 }
    );
  }
}
