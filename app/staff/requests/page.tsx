import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { requests, departments, users } from "@/lib/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import {
  RequestStatusBadge,
  PriorityBadge,
  OverdueBadge,
  isRequestOverdue,
} from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDepartments } from "@/lib/data/departments";
import {
  REQUEST_STATUS_LABELS,
  PRIORITY_LABELS,
  REQUEST_LIFECYCLE_STAGES,
  REQUEST_LIFECYCLE_STAGE_LABELS,
} from "@/lib/status-labels";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGE_TILE_STYLES: Record<string, string> = {
  new: "border-l-blue-500",
  in_review: "border-l-amber-500",
  awaiting_records: "border-l-violet-500",
  completed: "border-l-emerald-500",
};

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

  const [rows, allForStats] = await Promise.all([
    db
      .select({
        id: requests.id,
        referenceNo: requests.referenceNo,
        status: requests.status,
        priority: requests.priority,
        createdAt: requests.createdAt,
        dueDate: requests.dueDate,
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
      .orderBy(desc(requests.createdAt)),
    db.select({ status: requests.status, dueDate: requests.dueDate }).from(requests),
  ]);

  const stageCounts = REQUEST_LIFECYCLE_STAGES.map((stage) => ({
    stage,
    count: allForStats.filter((r) => r.status === stage).length,
  }));
  const overdueCount = allForStats.filter((r) => isRequestOverdue(r.dueDate, r.status)).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Requests</h1>
        <p className="text-sm text-muted-foreground">{rows.length} results</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stageCounts.map(({ stage, count }) => (
          <Card key={stage} className={cn("border-l-4 py-0", STAGE_TILE_STYLES[stage])}>
            <CardContent className="py-3.5">
              <p className="text-2xl font-semibold tabular-nums">{count}</p>
              <p className="text-xs text-muted-foreground">
                {REQUEST_LIFECYCLE_STAGE_LABELS[stage]}
              </p>
            </CardContent>
          </Card>
        ))}
        <Card className="border-l-4 border-l-orange-500 py-0">
          <CardContent className="py-3.5">
            <p className="text-2xl font-semibold tabular-nums">{overdueCount}</p>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
      </div>

      <form className="flex flex-wrap items-center gap-3" method="get">
        <select
          name="department"
          defaultValue={params.department ?? ""}
          aria-label="Filter by department"
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
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
          aria-label="Filter by status"
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
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
          aria-label="Filter by priority"
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
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
          className="h-9 rounded-lg border border-input bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Filter
        </button>
        {(params.department || params.status || params.priority) && (
          <Link
            href="/staff/requests"
            className="flex h-9 items-center px-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
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
                      <div className="flex flex-wrap items-center gap-1.5">
                        <RequestStatusBadge status={r.status} />
                        {isRequestOverdue(r.dueDate, r.status) && <OverdueBadge />}
                      </div>
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
