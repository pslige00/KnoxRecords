"use client";

import { useActionState } from "react";
import { createRequest, type RequestFormState } from "@/app/actions/requests";
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
import { Loader2, Sparkles } from "lucide-react";

export function NewRequestForm({
  departments,
}: {
  departments: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState<RequestFormState, FormData>(
    createRequest,
    undefined,
  );

  return (
    <form action={action} className="space-y-6">
      {state?.message && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="departmentId">Department</Label>
        <Select
          name="departmentId"
          items={departments.map((d) => ({ value: d.id, label: d.name }))}
          required
        >
          <SelectTrigger id="departmentId" className="w-full">
            <SelectValue placeholder="Select the department that holds these records" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.departmentId && (
          <p className="text-sm text-destructive">{state.errors.departmentId[0]}</p>
        )}
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5" />
          Not sure? Describe what you need below — AI will suggest the right
          department before this reaches staff.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">What records are you requesting?</Label>
        <Textarea
          id="description"
          name="description"
          rows={6}
          required
          placeholder="Be as specific as possible: what records, what time period, and any reference numbers you have."
        />
        {state?.errors?.description && (
          <p className="text-sm text-destructive">{state.errors.description[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Submit Request
      </Button>
    </form>
  );
}
