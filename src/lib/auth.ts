import crypto from "crypto";

const SECRET = process.env.ADMIN_SECRET || "node47-secret-2024-change-me";

export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "NODE47-admin2024";

export const ADMIN_COOKIE = "node47_session";

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function createSessionToken(): string {
  const payload = `admin.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, ts, sig] = parts;
  if (role !== "admin") return false;
  const expected = sign(`${role}.${ts}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  if (!crypto.timingSafeEqual(a, b)) return false;
  const age = Date.now() - Number(ts);
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_MS) return false;
  return true;
}

export function checkPassword(input: string): boolean {
  if (typeof input !== "string" || input.length === 0) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(ADMIN_PASSWORD);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
