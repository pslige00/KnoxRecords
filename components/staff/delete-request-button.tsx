"use client";

import { useActionState } from "react";
import { deleteRequest, type ActionResult } from "@/app/actions/staff";
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
import { Loader2, Trash2 } from "lucide-react";

export function DeleteRequestButton({ requestId }: { requestId: string }) {
  const [, action, pending] = useActionState<ActionResult, FormData>(deleteRequest, undefined);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm">
            <Trash2 className="size-4" />
            Delete request
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Permanently delete this request?</DialogTitle>
          <DialogDescription>
            This removes the request, its documents, and its full activity history —
            including from the audit log. This is meant for erroneous or duplicate
            requests, not routine closure; use a status update to reject or complete a
            real request instead. This can&apos;t be undone.
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
              Delete permanently
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
