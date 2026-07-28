import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { requests, departments, users } from "@/lib/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { RequestStatusBadge, PriorityBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDepartments } from "@/lib/data/departments";
import { REQUEST_STATUS_LABELS, PRIORITY_LABELS } from "@/lib/status-labels";
import { Inbox } from "lucide-react";

export default async function StaffRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; status?: string; priority?: string }>;
}) {
  const params = await searchParams;
  const allDepartments = await getDepartments();

  const conditions = [
    params.department ? eq(requests.departmentId, params.department) : undefined,
    params.status ? eq(requests.status, params.status as (typeof requests.$inferSelect)["status"]) : undefined,
    params.priority
      ? eq(requests.priority, params.priority as (typeof requests.$inferSelect)["priority"])
      : undefined,
  ].filter(Boolean);

  const rows = await db
    .select({
      id: requests.id,
      referenceNo: requests.referenceNo,
      status: requests.status,
      priority: requests.priority,
      createdAt: requests.createdAt,
      departmentName: departments.name,
      requesterFirstName: users.firstName,
      requesterLastName: users.lastName,
      aiSummary: requests.aiSummary,
      description: requests.description,
    })
    .from(requests)
    .innerJoin(departments, eq(requests.departmentId, departments.id))
    .innerJoin(users, eq(requests.userId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(requests.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Requests</h1>
        <p className="text-sm text-muted-foreground">{rows.length} results</p>
      </div>

      <form className="flex flex-wrap gap-3" method="get">
        <select
          name="department"
          defaultValue={params.department ?? ""}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">All departments</option>
          {allDepartments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={params.status ?? ""}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          {Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="priority"
          defaultValue={params.priority ?? ""}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">All priorities</option>
          {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-9 rounded-md border bg-secondary px-4 text-sm font-medium text-secondary-foreground"
        >
          Filter
        </button>
        {(params.department || params.status || params.priority) && (
          <Link
            href="/staff/requests"
            className="flex h-9 items-center px-2 text-sm text-muted-foreground underline underline-offset-4"
          >
            Clear
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <Inbox className="size-8" />
            <p>No requests match these filters.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer">
                    <TableCell className="font-mono text-xs">
                      <Link href={`/staff/requests/${r.id}`} className="block">
                        {r.referenceNo}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/staff/requests/${r.id}`} className="block">
                        {r.requesterFirstName} {r.requesterLastName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/staff/requests/${r.id}`} className="block">
                        {r.departmentName}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <Link href={`/staff/requests/${r.id}`} className="block truncate">
                        {r.aiSummary || r.description}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={r.priority} />
                    </TableCell>
                    <TableCell>
                      <RequestStatusBadge status={r.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {r.createdAt.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
