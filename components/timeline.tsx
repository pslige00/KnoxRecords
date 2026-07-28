import { MessageSquare } from "lucide-react";

export type TimelineEvent = {
  id: string;
  message: string;
  createdAt: Date;
  authorName: string | null;
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <ol className="space-y-4">
      {events.map((event) => (
        <li key={event.id} className="flex gap-3">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
            <MessageSquare className="size-3.5 text-muted-foreground" />
          </span>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {event.authorName ?? "System"}
              </span>
              <span>
                {event.createdAt.toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm">{event.message}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
