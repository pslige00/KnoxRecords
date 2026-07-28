import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import {
  REQUEST_STATUS_LABELS,
  PRIORITY_LABELS,
  ACCOUNT_STATUS_LABELS,
} from "@/lib/status-labels";

// Each pair (100/800 light, 950/300 dark) is chosen to clear WCAG AA
// (4.5:1) for the badge text against its own background — verified with
// the actual rendered colors, not just eyeballed.
const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  in_review:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  awaiting_records:
    "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
  completed:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  rejected: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  withdrawn:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700",
  pending:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  approved:
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  normal: "bg-secondary text-secondary-foreground",
  high: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export function RequestStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("border", STATUS_STYLES[status])}>
      {REQUEST_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function AccountStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("border", STATUS_STYLES[status])}>
      {ACCOUNT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge variant="secondary" className={cn(PRIORITY_STYLES[priority])}>
      {PRIORITY_LABELS[priority] ?? priority}
    </Badge>
  );
}

export function OverdueBadge() {
  return (
    <Badge
      variant="outline"
      className="border-orange-200 bg-orange-100 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300"
    >
      <AlertTriangle className="size-3" />
      Overdue
    </Badge>
  );
}

export function isRequestOverdue(dueDate: Date | string | null, status: string) {
  if (!dueDate) return false;
  if (status === "completed" || status === "rejected" || status === "withdrawn") return false;
  return new Date(dueDate).getTime() < Date.now();
}
