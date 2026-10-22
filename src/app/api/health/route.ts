import { NextResponse } from "next/server";

/**
 * Healthcheck conteneur — léger, sans dépendance bloquante.
 * Signale l'état de la base sans jamais faire échouer la requête :
 * le conteneur reste « healthy » tant que le serveur répond.
 */
export async function GET() {
  let database = "unknown";
  try {
    const { db } = await import("@/lib/db");
    await db.$queryRaw`SELECT 1`;
    database = "ok";
  } catch {
    database = "unreachable";
  }

  return NextResponse.json({
    status: "ok",
    database,
    timestamp: new Date().toISOString(),
  });
}
