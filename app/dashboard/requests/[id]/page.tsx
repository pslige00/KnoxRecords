import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { requireApprovedCitizen } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { requests, departments, requestEvents, requestDocuments, users } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestStatusBadge, PriorityBadge } from "@/components/status-badge";
import { Timeline } from "@/components/timeline";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireApprovedCitizen();
  const { id } = await params;

  const [request] = await db
    .select({
      id: requests.id,
      referenceNo: requests.referenceNo,
      description: requests.description,
      status: requests.status,
      priority: requests.priority,
      createdAt: requests.createdAt,
      departmentName: departments.name,
      userId: requests.userId,
    })
    .from(requests)
    .innerJoin(departments, eq(requests.departmentId, departments.id))
    .where(eq(requests.id, id))
    .limit(1);

  if (!request || request.userId !== user.id) {
    notFound();
  }

  const events = await db
    .select({
      id: requestEvents.id,
      message: requestEvents.message,
      createdAt: requestEvents.createdAt,
      authorId: requestEvents.authorId,
      authorRole: users.role,
      authorFirstName: users.firstName,
    })
    .from(requestEvents)
    .leftJoin(users, eq(requestEvents.authorId, users.id))
    .where(and(eq(requestEvents.requestId, id), eq(requestEvents.isCustomerVisible, true)))
    .orderBy(asc(requestEvents.createdAt));

  const documents = await db
    .select()
    .from(requestDocuments)
    .where(eq(requestDocuments.requestId, id))
    .orderBy(asc(requestDocuments.uploadedAt));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground">{request.referenceNo}</span>
          <RequestStatusBadge status={request.status} />
          <PriorityBadge priority={request.priority} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{request.departmentName}</h1>
        <p className="text-sm text-muted-foreground">
          Submitted{" "}
          {request.createdAt.toLocaleDateString(undefined, {
            dateStyle: "long",
          })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Request details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm">{request.description}</p>
        </CardContent>
      </Card>

      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm">{doc.fileName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  render={
                    <a href={`/api/documents/${doc.id}`}>
                      <Download className="size-4" />
                    </a>
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline
            events={events.map((e) => ({
              id: e.id,
              message: e.message,
              createdAt: e.createdAt,
              authorName:
                e.authorId === user.id
                  ? "You"
                  : e.authorRole === "staff"
                    ? "Records Team"
                    : null,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
