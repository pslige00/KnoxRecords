import { eq, desc, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, idVerifications } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ID_VERDICT_LABELS } from "@/lib/status-labels";
import { AccountDecisionForm } from "@/components/staff/account-decision-form";
import { ShieldCheck, UserRound } from "lucide-react";

const VERDICT_STYLES: Record<string, string> = {
  approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  needs_review: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

export default async function StaffAccountsPage() {
  const pendingUsers = await db
    .select()
    .from(users)
    .where(eq(users.accountStatus, "pending"))
    .orderBy(desc(users.createdAt));

  const verifications =
    pendingUsers.length === 0
      ? []
      : await db
          .select()
          .from(idVerifications)
          .where(
            inArray(
              idVerifications.userId,
              pendingUsers.map((u) => u.id),
            ),
          )
          .orderBy(desc(idVerifications.createdAt));

  const latestByUser = new Map<string, (typeof verifications)[number]>();
  for (const v of verifications) {
    if (!latestByUser.has(v.userId)) latestByUser.set(v.userId, v);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account Approvals</h1>
        <p className="text-sm text-muted-foreground">
          Accounts the AI reviewer flagged for manual identity verification.
        </p>
      </div>

      {pendingUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <ShieldCheck className="size-8" />
            <p>No accounts waiting on review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pendingUsers.map((u) => {
            const verification = latestByUser.get(u.id);
            return (
              <Card key={u.id}>
                <CardHeader className="flex-row items-start justify-between space-y-0">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-muted">
                      <UserRound className="size-4 text-muted-foreground" />
                    </span>
                    <div>
                      <CardTitle className="text-base">
                        {u.firstName} {u.middleName ? `${u.middleName} ` : ""}
                        {u.lastName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  {verification && (
                    <Badge variant="outline" className={VERDICT_STYLES[verification.aiVerdict]}>
                      {ID_VERDICT_LABELS[verification.aiVerdict]} ·{" "}
                      {Math.round(verification.aiConfidence * 100)}%
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-[160px_1fr]">
                  {verification ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/id-image/${verification.id}`}
                      alt="Uploaded driver's license"
                      className="h-40 w-full rounded-md border object-cover sm:w-40"
                    />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground sm:w-40">
                      No image on file
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p>
                          {u.address1}, {u.city}, {u.state} {u.zip}
                        </p>
                      </div>
                      {verification?.extractedName && (
                        <div>
                          <p className="text-xs text-muted-foreground">Name on ID</p>
                          <p>{verification.extractedName}</p>
                        </div>
                      )}
                      {verification?.extractedDob && (
                        <div>
                          <p className="text-xs text-muted-foreground">DOB on ID</p>
                          <p>{verification.extractedDob}</p>
                        </div>
                      )}
                      {verification?.extractedLicenseNumber && (
                        <div>
                          <p className="text-xs text-muted-foreground">License #</p>
                          <p>{verification.extractedLicenseNumber}</p>
                        </div>
                      )}
                    </div>
                    {verification?.aiReasoning && (
                      <p className="rounded-md bg-muted/60 p-2 text-sm text-muted-foreground">
                        {verification.aiReasoning}
                      </p>
                    )}
                    <AccountDecisionForm userId={u.id} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
