import "server-only";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import { requestEvents, requests, idVerifications, users } from "@/lib/db/schema";

export type AuditEntry = {
  id: string;
  createdAt: Date;
  actorId: string;
  actorName: string;
  category: "request" | "account";
  description: string;
  linkHref: string | null;
};

/**
 * Staff activity audit log. Built from data already recorded for other
 * purposes (the per-request timeline, and the reviewer/timestamp on ID
 * verifications) rather than a separate audit table, so there's one
 * source of truth for "what happened and who did it."
 */
export async function getStaffAuditLog({
  actorId,
}: {
  actorId?: string;
} = {}): Promise<AuditEntry[]> {
  const requestActionRows = await db
    .select({
      id: requestEvents.id,
      createdAt: requestEvents.createdAt,
      message: requestEvents.message,
      actorId: users.id,
      actorFirstName: users.firstName,
      actorLastName: users.lastName,
      requestId: requests.id,
      requestReferenceNo: requests.referenceNo,
    })
    .from(requestEvents)
    .innerJoin(requests, eq(requestEvents.requestId, requests.id))
    .innerJoin(users, eq(requestEvents.authorId, users.id))
    .where(
      and(
        eq(users.role, "staff"),
        actorId ? eq(users.id, actorId) : undefined,
      ),
    )
    .orderBy(desc(requestEvents.createdAt))
    .limit(200);

  const reviewer = alias(users, "reviewer");
  const citizen = alias(users, "citizen");

  const accountActionRows = await db
    .select({
      id: idVerifications.id,
      reviewedAt: idVerifications.reviewedAt,
      reviewerId: reviewer.id,
      reviewerFirstName: reviewer.firstName,
      reviewerLastName: reviewer.lastName,
      citizenFirstName: citizen.firstName,
      citizenLastName: citizen.lastName,
      citizenAccountStatus: citizen.accountStatus,
    })
    .from(idVerifications)
    .innerJoin(reviewer, eq(idVerifications.reviewedBy, reviewer.id))
    .innerJoin(citizen, eq(idVerifications.userId, citizen.id))
    .where(
      and(
        isNotNull(idVerifications.reviewedBy),
        actorId ? eq(reviewer.id, actorId) : undefined,
      ),
    )
    .orderBy(desc(idVerifications.reviewedAt))
    .limit(200);

  const requestEntries: AuditEntry[] = requestActionRows.map((r) => ({
    id: r.id,
    createdAt: r.createdAt,
    actorId: r.actorId,
    actorName: `${r.actorFirstName} ${r.actorLastName}`,
    category: "request",
    description: r.message,
    linkHref: `/staff/requests/${r.requestId}`,
  }));

  const accountEntries: AuditEntry[] = accountActionRows
    .filter((r) => r.reviewedAt)
    .map((r) => ({
      id: r.id,
      createdAt: r.reviewedAt as Date,
      actorId: r.reviewerId,
      actorName: `${r.reviewerFirstName} ${r.reviewerLastName}`,
      category: "account",
      description: `${r.reviewerFirstName} ${r.reviewerLastName} ${
        r.citizenAccountStatus === "approved" ? "approved" : "rejected"
      } ${r.citizenFirstName} ${r.citizenLastName}'s account.`,
      linkHref: null,
    }));

  return [...requestEntries, ...accountEntries].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

export async function getStaffMembers() {
  return db
    .select({ id: users.id, firstName: users.firstName, lastName: users.lastName })
    .from(users)
    .where(eq(users.role, "staff"))
    .orderBy(users.firstName);
}
