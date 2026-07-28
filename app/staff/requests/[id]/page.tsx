import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  requests,
  departments,
  requestEvents,
  requestDocuments,
  users,
} from "@/lib/db/schema";
import { getDepartments } from "@/lib/data/departments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestStatusBadge, PriorityBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Timeline } from "@/components/timeline";
import { Button } from "@/components/ui/button";
import { RoutingForm } from "@/components/staff/routing-form";
import { UploadDocumentForm } from "@/components/staff/upload-document-form";
import { InternalNoteForm } from "@/components/staff/internal-note-form";
import { StatusUpdateForm } from "@/components/staff/status-update-form";
import { FileText, Download, Sparkles } from "lucide-react";

export default async function StaffRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [request] = await db
    .select({
      id: requests.id,
      referenceNo: requests.referenceNo,
      description: requests.description,
      status: requests.status,
      priority: requests.priority,
      createdAt: requests.createdAt,
      departmentId: requests.departmentId,
      departmentName: departments.name,
      aiSummary: requests.aiSummary,
      aiReasoning: requests.aiReasoning,
      aiSuggestedDepartmentId: requests.aiSuggestedDepartmentId,
      requesterId: users.id,
      requesterFirstName: users.firstName,
      requesterLastName: users.lastName,
      requesterEmail: users.email,
    })
    .from(requests)
    .innerJoin(departments, eq(requests.departmentId, departments.id))
    .innerJoin(users, eq(requests.userId, users.id))
    .where(eq(requests.id, id))
    .limit(1);

  if (!request) notFound();

  const allDepartments = await getDepartments();
  const suggestedDept = allDepartments.find((d) => d.id === request.aiSuggestedDepartmentId);
  const showAiSuggestion =
    request.aiSuggestedDepartmentId && request.aiSuggestedDepartmentId !== request.departmentId;

  const events = await db
    .select({
      id: requestEvents.id,
      message: requestEvents.message,
      createdAt: requestEvents.createdAt,
      isCustomerVisible: requestEvents.isCustomerVisible,
      authorId: requestEvents.authorId,
      authorFirstName: users.firstName,
      authorLastName: users.lastName,
    })
    .from(requestEvents)
    .leftJoin(users, eq(requestEvents.authorId, users.id))
    .where(eq(requestEvents.requestId, id))
    .orderBy(asc(requestEvents.createdAt));

  const documents = await db
    .select()
    .from(requestDocuments)
    .where(eq(requestDocuments.requestId, id))
    .orderBy(asc(requestDocuments.uploadedAt));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">{request.referenceNo}</span>
            <RequestStatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{request.departmentName}</h1>
          <p className="text-sm text-muted-foreground">
            {request.requesterFirstName} {request.requesterLastName} · {request.requesterEmail} ·
            Submitted {request.createdAt.toLocaleDateString()}
          </p>
        </div>

        {showAiSuggestion && suggestedDept && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex items-start gap-3 py-4">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="space-y-1 text-sm">
                <p>
                  AI suggested routing this to <strong>{suggestedDept.name}</strong> instead.
                </p>
                {request.aiReasoning && (
                  <p className="text-muted-foreground">{request.aiReasoning}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Request details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {request.aiSummary && (
              <Badge variant="secondary" className="font-normal">
                <Sparkles className="size-3" />
                {request.aiSummary}
              </Badge>
            )}
            <p className="whitespace-pre-wrap text-sm">{request.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
            <UploadDocumentForm requestId={request.id} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Timeline
              events={events.map((e) => ({
                id: e.id,
                message: e.isCustomerVisible ? e.message : `[Internal] ${e.message}`,
                createdAt: e.createdAt,
                authorName: e.authorFirstName
                  ? `${e.authorFirstName} ${e.authorLastName}`
                  : null,
              }))}
            />
            <InternalNoteForm requestId={request.id} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Routing</CardTitle>
          </CardHeader>
          <CardContent>
            <RoutingForm
              requestId={request.id}
              departments={allDepartments}
              currentDepartmentId={request.departmentId}
              currentPriority={request.priority}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notify requester</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusUpdateForm requestId={request.id} currentStatus={request.status} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
