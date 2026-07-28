import { Check, Ban, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  REQUEST_LIFECYCLE_STAGES,
  REQUEST_LIFECYCLE_STAGE_LABELS,
  TERMINAL_REQUEST_STATUSES,
} from "@/lib/status-labels";

export function RequestStageTracker({ status }: { status: string }) {
  if ((TERMINAL_REQUEST_STATUSES as readonly string[]).includes(status)) {
    const isWithdrawn = status === "withdrawn";
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm",
          isWithdrawn
            ? "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
            : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300",
        )}
      >
        {isWithdrawn ? (
          <Ban className="size-4 shrink-0" />
        ) : (
          <XCircle className="size-4 shrink-0" />
        )}
        <span>
          {isWithdrawn
            ? "This request was withdrawn by the requester."
            : "This request was rejected."}
        </span>
      </div>
    );
  }

  const currentIndex = REQUEST_LIFECYCLE_STAGES.indexOf(
    status as (typeof REQUEST_LIFECYCLE_STAGES)[number],
  );
  const isComplete = status === "completed";

  return (
    <ol className="flex items-start">
      {REQUEST_LIFECYCLE_STAGES.map((stage, i) => {
        const done = isComplete || i < currentIndex;
        const current = !isComplete && i === currentIndex;
        const isLast = i === REQUEST_LIFECYCLE_STAGES.length - 1;

        return (
          <li key={stage} className={cn("flex items-center", !isLast && "flex-1")}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors",
                  done &&
                    "border-primary bg-primary text-primary-foreground",
                  current &&
                    "border-primary bg-background text-primary ring-4 ring-primary/15",
                  !done && !current && "border-border bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "max-w-20 text-center text-xs leading-tight",
                  done || current ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {REQUEST_LIFECYCLE_STAGE_LABELS[stage]}
              </span>
            </div>
            {!isLast && (
              <span
                className={cn(
                  "mx-1.5 mt-3.5 h-0.5 flex-1 rounded-full transition-colors",
                  done ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
