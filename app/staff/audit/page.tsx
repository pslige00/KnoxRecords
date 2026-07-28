import Link from "next/link";
import { getStaffAuditLog, getStaffMembers } from "@/lib/data/audit";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilterSelect } from "@/components/staff/filter-select";
import { FileText, ShieldCheck, ShieldEllipsis, ListChecks } from "lucide-react";

const CATEGORY_STYLES: Record<string, string> = {
  request:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  account:
    "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
  role:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
};

const CATEGORY_LABELS: Record<string, string> = {
  request: "Request",
  account: "Account",
  role: "Role",
};

export default async function StaffAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ actor?: string }>;
}) {
  const params = await searchParams;
  const actorFilter = params.actor && params.actor !== "all" ? params.actor : undefined;
  const [entries, staffMembers] = await Promise.all([
    getStaffAuditLog({ actorId: actorFilter }),
    getStaffMembers(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          Every staff action across accounts and requests, newest first.
        </p>
      </div>

      <form className="flex flex-wrap items-center gap-3" method="get">
        <FilterSelect
          name="actor"
          defaultValue={params.actor}
          ariaLabel="Filter by staff member"
          options={[
            { value: "all", label: "All staff" },
            ...staffMembers.map((s) => ({ value: s.id, label: `${s.firstName} ${s.lastName}` })),
          ]}
        />
        <button
          type="submit"
          className="h-9 cursor-pointer rounded-lg border border-input bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Filter
        </button>
        {actorFilter && (
          <Link
            href="/staff/audit"
            className="flex h-9 items-center px-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Clear
          </Link>
        )}
      </form>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
            <ListChecks className="size-8" />
            <p>No staff activity recorded yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y p-0">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                  {entry.category === "account" ? (
                    <ShieldCheck className="size-3.5 text-muted-foreground" />
                  ) : entry.category === "role" ? (
                    <ShieldEllipsis className="size-3.5 text-muted-foreground" />
                  ) : (
                    <FileText className="size-3.5 text-muted-foreground" />
                  )}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={CATEGORY_STYLES[entry.category]}>
                      {CATEGORY_LABELS[entry.category]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {entry.createdAt.toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <p className="text-sm">
                    {entry.linkHref ? (
                      <Link href={entry.linkHref} className="hover:underline">
                        {entry.description}
                      </Link>
                    ) : (
                      entry.description
                    )}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
