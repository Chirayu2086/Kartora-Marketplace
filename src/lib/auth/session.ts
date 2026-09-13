import { cookies } from "next/headers";
import { createHmac, randomUUID, timingSafeEqual } from "crypto";

export type SessionRole = "CUSTOMER" | "ADMIN";
export interface SessionUser {
  name: string;
  phone?: string;
  email?: string;
  role: SessionRole;
}
interface SessionPayload extends SessionUser {
  exp: number;
  jti: string;
}

const COOKIE = "kartora_session";
const SECRET = process.env.AUTH_SECRET ?? "kartora-dev-secret-change-me";
const DAY = 86400000;

export const DEMO_OTP = "123456";
export const ADMIN_PHONE = "9000000000";
export const ADMIN_EMAIL = "admin@kartora.com";

function sign(data: string): string {
  return createHmac("sha256", SECRET).update(data).digest("base64url");
}

export function encodeSession(user: SessionUser, days = 7): string {
  const payload: SessionPayload = { ...user, exp: Date.now() + days * DAY, jti: randomUUID() };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function decodeSession(token: string | undefined): SessionUser | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = Buffer.from(sign(body));
  const provided = Buffer.from(sig);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (payload.exp < Date.now()) return null;
    return { name: payload.name, phone: payload.phone, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return decodeSession(store.get(COOKIE)?.value);
}

export async function setSessionCookie(user: SessionUser): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, encodeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 86400,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export function roleFor(identifier: string): SessionRole {
  return identifier === ADMIN_PHONE || identifier.toLowerCase() === ADMIN_EMAIL ? "ADMIN" : "CUSTOMER";
}
