import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Null when DATABASE_URL is absent so the app runs in demo-catalog mode without a database. */
export const prisma: PrismaClient | null =
  process.env.DATABASE_URL
    ? (globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] }))
    : null;

if (prisma && process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const dbEnabled = (): boolean => prisma !== null;
