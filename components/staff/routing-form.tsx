"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { assignRequest, type ActionResult } from "@/app/actions/staff";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const PRIORITY_ITEMS = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
];

export function RoutingForm({
  requestId,
  departments,
  currentDepartmentId,
  currentPriority,
}: {
  requestId: string;
  departments: { id: string; name: string }[];
  currentDepartmentId: string;
  currentPriority: string;
}) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    assignRequest,
    undefined,
  );

  useEffect(() => {
    if (state?.message) toast.success(state.message);
  }, [state]);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="requestId" value={requestId} />
      <div className="space-y-1.5">
        <Label htmlFor="departmentId">Department</Label>
        <Select
          name="departmentId"
          defaultValue={currentDepartmentId}
          items={departments.map((d) => ({ value: d.id, label: d.name }))}
          required
        >
          <SelectTrigger id="departmentId" className="w-full">
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
        <Label htmlFor="priority">Priority</Label>
        <Select
          name="priority"
          defaultValue={currentPriority}
          items={PRIORITY_ITEMS}
          required
        >
          <SelectTrigger id="priority" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Save routing
      </Button>
    </form>
  );
}
