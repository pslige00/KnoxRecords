"use client";

import { useActionState, useState } from "react";
import { editRequest, type RequestFormState } from "@/app/actions/requests";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Pencil, X } from "lucide-react";

export function EditRequestForm({
  request,
  departments,
}: {
  request: { id: string; departmentId: string; description: string };
  departments: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<RequestFormState, FormData>(
    editRequest,
    undefined,
  );

  if (!open) {
    return (
      <div className="space-y-3">
        <p className="whitespace-pre-wrap text-sm">{request.description}</p>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Pencil className="size-4" />
          Edit request
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3 rounded-lg border bg-muted/30 p-4">
      <input type="hidden" name="requestId" value={request.id} />
      {state?.message && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="edit-departmentId">Department</Label>
        <Select
          name="departmentId"
          defaultValue={request.departmentId}
          items={departments.map((d) => ({ value: d.id, label: d.name }))}
          required
        >
          <SelectTrigger id="edit-departmentId" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edit-description">What records are you requesting?</Label>
        <Textarea
          id="edit-description"
          name="description"
          rows={5}
          required
          defaultValue={request.description}
        />
        {state?.errors?.description && (
          <p className="text-sm text-destructive">{state.errors.description[0]}</p>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          <X className="size-4" />
          Cancel
        </Button>
      </div>
    </form>
  );
}
