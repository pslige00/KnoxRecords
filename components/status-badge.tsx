import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  REQUEST_STATUS_LABELS,
  PRIORITY_LABELS,
  ACCOUNT_STATUS_LABELS,
} from "@/lib/status-labels";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  in_review: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  awaiting_records: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  normal: "bg-secondary text-secondary-foreground",
  high: "bg-destructive/10 text-destructive",
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
