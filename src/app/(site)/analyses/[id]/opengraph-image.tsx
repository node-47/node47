import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import {
  formatOdds,
  stakeOf,
  VERDICT_LABELS,
  type Confidence,
  type Verdict,
} from "@/lib/picks";

/**
 * Image Open Graph dynamique d'une fiche (1200×630) :
 * affiche, marché retenu, verdict et confiance. Les brouillons et les
 * identifiants inconnus tombent sur un visuel neutre (aucune fuite de données).
 */
export const alt = "Analyse NODE.47 — marché retenu, sélection et verdict";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "linear-gradient(135deg, #0b0d11 0%, #12151c 55%, #1a1e28 100%)";
const GOLD = "#d4af5f";
const INK = "#f4efe6";
const MUTED = "#a29b8c";

export default async function FicheOpengraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pick = await db.pick.findUnique({ where: { id } });
  const valid = pick !== null && pick.status === "PUBLISHED";

  const match = valid ? pick.matchName : "Analyses sportives NODE.47";
  const competition = valid ? pick.competition.toUpperCase() : "TRADER INTELLIGENCE";
  const marketBits = valid
    ? [pick.market, pick.selection, pick.line].filter(Boolean).join(" ")
    : "";
  const odds = valid && pick.odds != null ? `@ ${formatOdds(pick.odds)}` : "";
  const verdict = valid
    ? VERDICT_LABELS[(pick.verdict as Verdict) ?? "JE_JOUE"] ?? "Je joue"
    : "Marchés retenus · statistiques clés · synthèses";
  const confidence = valid
    ? `Confiance ${({
        FAIBLE: "Faible",
        MODERE: "Modéré",
        ELEVE: "Élevé",
        TRES_ELEVE: "Très élevé",
      } as Record<Confidence, string>)[(pick?.confidence ?? "MODERE") as Confidence]} · ${stakeOf(pick?.confidence)} u`
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          background: BG,
          color: INK,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Filigrane 47 */}
        <div
          style={{
            position: "absolute",
            right: "-30px",
            top: "-130px",
            display: "flex",
            fontSize: 380,
            fontWeight: 700,
            letterSpacing: "-0.06em",
            color: "rgba(212, 175, 95, 0.06)",
          }}
        >
          47
        </div>

        {/* En-tête */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(212, 175, 95, 0.28)",
            paddingBottom: 26,
          }}
        >
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700, letterSpacing: "0.08em" }}>
            <span>NODE</span>
            <span style={{ color: GOLD }}>.47</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 17,
              letterSpacing: "0.22em",
              color: MUTED,
              maxWidth: 560,
            }}
          >
            {competition}
          </div>
        </div>

        {/* Corps */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 26,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 19,
              letterSpacing: "0.3em",
              color: GOLD,
              fontWeight: 600,
            }}
          >
            ANALYSE &amp; PRONOSTIC
          </div>
          <div
            style={{
              display: "flex",
              fontSize: match.length > 34 ? 54 : 66,
              fontWeight: 700,
              lineHeight: 1.16,
              maxWidth: 960,
            }}
          >
            {match}
          </div>
          {marketBits && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 30, maxWidth: 980 }}>
              <span style={{ color: MUTED }}>{marketBits}</span>
              {odds && <span style={{ color: INK, fontWeight: 600 }}>{odds}</span>}
            </div>
          )}
        </div>

        {/* Pied */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                border: "1px solid rgba(212, 175, 95, 0.5)",
                borderRadius: 999,
                padding: "10px 24px",
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {verdict}
            </div>
            {confidence && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid rgba(244, 239, 230, 0.25)",
                  borderRadius: 999,
                  padding: "10px 24px",
                  fontSize: 22,
                  color: MUTED,
                }}
              >
                {confidence}
              </div>
            )}
          </div>
          <div style={{ display: "flex", fontSize: 22, fontWeight: 600, color: GOLD }}>
            Lire l&apos;analyse complète
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
