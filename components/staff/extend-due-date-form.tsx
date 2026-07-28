"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { extendDueDate, type ActionResult } from "@/app/actions/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarClock, Loader2 } from "lucide-react";

export function ExtendDueDateForm({
  requestId,
  currentDueDate,
}: {
  requestId: string;
  currentDueDate: Date | null;
}) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    extendDueDate,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message) {
      toast.success(state.message);
      formRef.current?.reset();
    }
  }, [state]);

  const today = new Date().toISOString().slice(0, 10);
  const defaultNewDate = currentDueDate
    ? new Date(currentDueDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    : undefined;

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="requestId" value={requestId} />
      <div className="space-y-1.5">
        <Label htmlFor="newDueDate">New due date</Label>
        <Input
          id="newDueDate"
          name="newDueDate"
          type="date"
          min={today}
          defaultValue={defaultNewDate}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          name="reason"
          rows={2}
          required
          placeholder="Why does this request need more time?"
        />
      </div>
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <CalendarClock className="size-4" />}
        Extend &amp; notify requester
      </Button>
    </form>
  );
}
