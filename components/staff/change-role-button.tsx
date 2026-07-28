"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { changeUserRole, type ActionResult } from "@/app/actions/staff";
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
import { Loader2, ShieldMinus, ShieldPlus } from "lucide-react";

export function ChangeRoleButton({
  userId,
  userName,
  currentRole,
}: {
  userId: string;
  userName: string;
  currentRole: "citizen" | "staff";
}) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    changeUserRole,
    undefined,
  );
  const nextRole = currentRole === "staff" ? "citizen" : "staff";
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state?.message) {
      toast.success(state.message);
      closeRef.current?.click();
    }
  }, [state]);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            {nextRole === "staff" ? (
              <ShieldPlus className="size-4" />
            ) : (
              <ShieldMinus className="size-4" />
            )}
            {nextRole === "staff" ? "Promote to staff" : "Demote to citizen"}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {nextRole === "staff" ? "Promote" : "Demote"} {userName}?
          </DialogTitle>
          <DialogDescription>
            {nextRole === "staff"
              ? "This grants full staff access: reviewing accounts, managing requests, and viewing the audit log."
              : "This removes staff access. They'll become a regular citizen account."}
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="role" value={nextRole} />
          <DialogFooter>
            <DialogClose render={<Button ref={closeRef} type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
