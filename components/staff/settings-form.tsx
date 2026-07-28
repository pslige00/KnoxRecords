"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateSettings, type ActionResult } from "@/app/actions/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function SettingsForm({
  defaultThresholdPercent,
}: {
  defaultThresholdPercent: number;
}) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    updateSettings,
    undefined,
  );

  useEffect(() => {
    if (state?.message) toast.success(state.message);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="max-w-xs space-y-1.5">
        <Label htmlFor="idAutoApproveThresholdPercent">Auto-approve confidence threshold</Label>
        <div className="relative">
          <Input
            id="idAutoApproveThresholdPercent"
            name="idAutoApproveThresholdPercent"
            type="number"
            min={0}
            max={100}
            step={1}
            defaultValue={defaultThresholdPercent}
            required
            className="pr-8"
          />
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            %
          </span>
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Save changes
      </Button>
    </form>
  );
}
