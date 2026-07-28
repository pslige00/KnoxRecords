"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { toast } from "sonner";
import { decideAccount, type ActionResult } from "@/app/actions/staff";
import { Button } from "@/components/ui/button";
import { Check, Loader2, X } from "lucide-react";

export function AccountDecisionForm({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    decideAccount,
    undefined,
  );

  useEffect(() => {
    if (state?.message) toast.success(state.message);
  }, [state]);

  return (
    <form action={action} className="flex gap-2">
      <input type="hidden" name="userId" value={userId} />
      <Button
        type="submit"
        name="decision"
        value="approved"
        size="sm"
        disabled={pending}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        Approve
      </Button>
      <Button
        type="submit"
        name="decision"
        value="rejected"
        size="sm"
        variant="outline"
        disabled={pending}
      >
        <X className="size-4" />
        Reject
      </Button>
    </form>
  );
}
