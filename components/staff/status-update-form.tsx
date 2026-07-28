"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { updateRequestStatus, type ActionResult } from "@/app/actions/staff";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REQUEST_STATUS_LABELS } from "@/lib/status-labels";
import { Loader2, Send } from "lucide-react";

export function StatusUpdateForm({
  requestId,
  currentStatus,
}: {
  requestId: string;
  currentStatus: string;
}) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    updateRequestStatus,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message) {
      toast.success(state.message);
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="requestId" value={requestId} />
      <div className="space-y-1.5">
        <Label htmlFor="status">New status</Label>
        <Select
          name="status"
          defaultValue={currentStatus}
          items={Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
          required
        >
          <SelectTrigger id="status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="customerMessage">Message to requester</Label>
        <Textarea
          id="customerMessage"
          name="customerMessage"
          rows={3}
          required
          placeholder="This will be emailed to the requester and added to their request timeline."
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Update status &amp; notify requester
      </Button>
    </form>
  );
}
