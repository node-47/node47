import type { Metadata } from "next";
import { SPORT_TAGLINES, type Sport, type Verdict } from "@/lib/picks";
import { SportPageView } from "@/components/sport-page-view";

export const dynamic = "force-dynamic";

const sport = "FOOTBALL" as Sport;

export const metadata: Metadata = {
  alternates: { canonical: "/football" },
  title: `Analyses Football`,
  description: `Analyses et sélections football NODE.47 — ${SPORT_TAGLINES[sport]}`,
};

export default async function FootballPage({
  searchParams,
}: {
  searchParams: Promise<{ verdict?: string }>;
}) {
  const sp = await searchParams;
  const verdict: Verdict | "ALL" =
    sp.verdict === "JE_JOUE" || sp.verdict === "JE_JOUE_SOUS_CONDITION" ? sp.verdict : "ALL";
  return <SportPageView sport={sport} verdict={verdict} />;
}
