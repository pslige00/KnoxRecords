import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { requireApprovedCitizen } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { requests, departments } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  RequestStatusBadge,
  PriorityBadge,
  OverdueBadge,
  isRequestOverdue,
} from "@/components/status-badge";
import { FileSearch, Plus } from "lucide-react";

export default async function DashboardPage() {
  const user = await requireApprovedCitizen();

  const myRequests = await db
    .select({
      id: requests.id,
      referenceNo: requests.referenceNo,
      description: requests.description,
      aiSummary: requests.aiSummary,
      status: requests.status,
      priority: requests.priority,
      createdAt: requests.createdAt,
      dueDate: requests.dueDate,
      departmentName: departments.name,
    })
    .from(requests)
    .innerJoin(departments, eq(requests.departmentId, departments.id))
    .where(eq(requests.userId, user.id))
    .orderBy(desc(requests.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Requests</h1>
          <p className="text-sm text-muted-foreground">
            Track the status of every public records request you&apos;ve submitted.
          </p>
        </div>
        <Button
          render={
            <Link href="/dashboard/requests/new">
              <Plus className="size-4" />
              New Request
            </Link>
          }
        />
      </div>

      {myRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted">
              <FileSearch className="size-6 text-muted-foreground" />
            </span>
            <div>
              <p className="font-medium">No requests yet</p>
              <p className="text-sm text-muted-foreground">
                Submit your first public records request to get started.
              </p>
            </div>
            <Button render={<Link href="/dashboard/requests/new">New Request</Link>} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {myRequests.map((r) => (
            <Link key={r.id} href={`/dashboard/requests/${r.id}`}>
              <Card className="transition-colors hover:border-primary/50">
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {r.referenceNo}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{r.departmentName}</span>
                    </div>
                    <p className="truncate font-medium">{r.aiSummary || r.description}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <PriorityBadge priority={r.priority} />
                    <RequestStatusBadge status={r.status} />
                    {isRequestOverdue(r.dueDate, r.status) && <OverdueBadge />}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
