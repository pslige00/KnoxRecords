"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { addInternalNote, type ActionResult } from "@/app/actions/staff";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export function InternalNoteForm({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    addInternalNote,
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
    <form ref={formRef} action={action} className="space-y-2">
      <input type="hidden" name="requestId" value={requestId} />
      <Textarea name="message" placeholder="Internal note (not visible to the requester)…" rows={2} required />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Add internal note
      </Button>
    </form>
  );
}
