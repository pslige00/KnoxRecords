import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { decryptSession, getSessionCookie } from "./session";

/**
 * Optimistic check: reads only the signed cookie, no DB round trip.
 * Safe to call frequently; do not use this alone to gate sensitive data.
 */
export const verifySession = cache(async () => {
  const cookie = await getSessionCookie();
  const session = await decryptSession(cookie);
  if (!session) {
    redirect("/login");
  }
  return session;
});

/**
 * Secure check: re-reads the user row from the database so role/account
 * status changes (e.g. a staff approval) take effect without re-login.
 */
export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) {
    redirect("/login");
  }
  return user;
});

export async function requireStaff() {
  const user = await getCurrentUser();
  if (user.role !== "staff") {
    redirect("/dashboard");
  }
  return user;
}

export async function requireApprovedCitizen() {
  const user = await getCurrentUser();
  if (user.role === "staff") {
    redirect("/staff/requests");
  }
  if (user.accountStatus !== "approved") {
    redirect("/account/pending");
  }
  return user;
}

/** Optimistic-only variant for cases where a DB round trip isn't warranted. */
export async function getOptionalSession() {
  const cookie = await getSessionCookie();
  return decryptSession(cookie);
}
