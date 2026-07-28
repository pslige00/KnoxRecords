"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { uploadRequestDocument, type ActionResult } from "@/app/actions/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload } from "lucide-react";

export function UploadDocumentForm({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(
    uploadRequestDocument,
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
    <form ref={formRef} action={action} className="flex items-center gap-2">
      <input type="hidden" name="requestId" value={requestId} />
      <Input type="file" name="file" required className="max-w-xs" />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        Upload
      </Button>
    </form>
  );
}
