"use server";

import { z } from "zod";
import { DEMO_OTP, clearSessionCookie, getSession, roleFor, setSessionCookie, type SessionUser } from "@/lib/auth/session";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const requestSchema = z.object({
  identifier: z.string().min(5, "Enter your phone number or email"),
  channel: z.enum(["phone", "email"]),
});

const verifySchema = requestSchema.extend({ otp: z.string().length(6, "OTP is 6 digits") });

export async function requestOtpAction(input: z.input<typeof requestSchema>): Promise<ActionResult> {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { identifier, channel } = parsed.data;
  if (channel === "phone" && !/^[6-9]\d{9}$/.test(identifier)) return { ok: false, error: "Enter a valid 10-digit mobile number" };
  if (channel === "email" && !/^\S+@\S+\.\S+$/.test(identifier)) return { ok: false, error: "Enter a valid email address" };
  // DEMO MODE: OTP is always 123456 and nothing is sent.
  // PRODUCTION: rate-limit per identifier + IP, store hashed OTP with expiry, send via SMS/email provider.
  return { ok: true };
}

export async function verifyOtpAction(input: z.input<typeof verifySchema>): Promise<ActionResult<SessionUser>> {
  const parsed = verifySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { identifier, channel, otp } = parsed.data;
  if (otp !== DEMO_OTP) return { ok: false, error: "Incorrect OTP. Demo OTP is 123456." };
  const role = roleFor(identifier);
  const user: SessionUser =
    channel === "phone"
      ? { name: role === "ADMIN" ? "Kartora Admin" : `User ${identifier.slice(-4)}`, phone: identifier, role }
      : { name: role === "ADMIN" ? "Kartora Admin" : identifier.split("@")[0], email: identifier, role };
  await setSessionCookie(user);
  return { ok: true, data: user };
}

export async function logoutAction(): Promise<ActionResult> {
  await clearSessionCookie();
  return { ok: true };
}

export async function getSessionAction(): Promise<ActionResult<SessionUser>> {
  const session = await getSession();
  return session ? { ok: true, data: session } : { ok: false, error: "NO_SESSION" };
}
