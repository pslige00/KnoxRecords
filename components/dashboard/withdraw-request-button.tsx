"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { withdrawRequest, type RequestFormState } from "@/app/actions/requests";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Ban, Loader2 } from "lucide-react";

export function WithdrawRequestButton({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState<RequestFormState, FormData>(
    withdrawRequest,
    undefined,
  );

  useEffect(() => {
    if (state?.message) toast.error(state.message);
  }, [state]);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Ban className="size-4" />
            Withdraw request
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw this request?</DialogTitle>
          <DialogDescription>
            Staff will stop working on it and it will be marked as withdrawn. This
            can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          <input type="hidden" name="requestId" value={requestId} />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Withdraw request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
