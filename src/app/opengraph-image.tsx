import { ImageResponse } from "next/og";

/**
 * Image Open Graph par défaut (1200×630) — appliquée à toutes les pages
 * sans image OG dédiée (accueil, analyses, performance, à propos).
 */
export const alt = "NODE.47 — Analyses sportives & décisions de marché";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          background: "linear-gradient(135deg, #0b0d11 0%, #12151c 55%, #1a1e28 100%)",
          color: "#f4efe6",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Filigrane 47 */}
        <div
          style={{
            position: "absolute",
            right: "-30px",
            bottom: "-150px",
            display: "flex",
            fontSize: 430,
            fontWeight: 700,
            letterSpacing: "-0.06em",
            color: "rgba(212, 175, 95, 0.07)",
          }}
        >
          47
        </div>

        {/* En-tête : marque */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            <span>NODE</span>
            <span style={{ color: "#d4af5f" }}>.47</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 16,
              letterSpacing: "0.34em",
              color: "#a29b8c",
            }}
          >
            TRADER INTELLIGENCE
          </div>
        </div>

        {/* Corps */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 920,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 66,
              fontWeight: 700,
              lineHeight: 1.14,
              letterSpacing: "-0.01em",
            }}
          >
            Analyses sportives & décisions de marché
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 26,
              fontWeight: 600,
              color: "#d4af5f",
            }}
          >
            Football · Basketball · Tennis
          </div>
        </div>

        {/* Pied */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(212, 175, 95, 0.28)",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", fontSize: 22, color: "#a29b8c" }}>
            Nouvelles éditions chaque jour à 8 h UTC
          </div>
          <div style={{ display: "flex", fontSize: 22, fontWeight: 600 }}>
            Sélections publiées · verdicts assumés
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
