import type { Metadata } from "next";
import { SPORT_TAGLINES, type Sport, type Verdict } from "@/lib/picks";
import { SportPageView } from "@/components/sport-page-view";

export const dynamic = "force-dynamic";

const sport = "TENNIS" as Sport;

export const metadata: Metadata = {
  alternates: { canonical: "/tennis" },
  title: `Analyses Tennis`,
  description: `Analyses et sélections tennis NODE.47 — ${SPORT_TAGLINES[sport]}`,
};

export default async function TennisPage({
  searchParams,
}: {
  searchParams: Promise<{ verdict?: string }>;
}) {
  const sp = await searchParams;
  const verdict: Verdict | "ALL" =
    sp.verdict === "JE_JOUE" || sp.verdict === "JE_JOUE_SOUS_CONDITION" ? sp.verdict : "ALL";
  return <SportPageView sport={sport} verdict={verdict} />;
}
