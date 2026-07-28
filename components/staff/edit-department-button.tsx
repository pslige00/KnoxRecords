"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { updateDepartment, type ActionResult } from "@/app/actions/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Loader2, Pencil } from "lucide-react";

export function EditDepartmentButton({
  department,
}: {
  department: { id: string; name: string; contactEmail: string };
}) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    updateDepartment,
    undefined,
  );
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state?.message) {
      toast.success(state.message);
      closeRef.current?.click();
    }
  }, [state]);

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm"><Pencil className="size-4" />Edit</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit department</DialogTitle>
          <DialogDescription>
            Requests routed to this department will notify this email address.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-3">
          <input type="hidden" name="departmentId" value={department.id} />
          <div className="space-y-1.5">
            <Label htmlFor={`name-${department.id}`}>Department name</Label>
            <Input id={`name-${department.id}`} name="name" defaultValue={department.name} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`email-${department.id}`}>Routing email</Label>
            <Input
              id={`email-${department.id}`}
              name="contactEmail"
              type="email"
              defaultValue={department.contactEmail}
              required
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button ref={closeRef} type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
