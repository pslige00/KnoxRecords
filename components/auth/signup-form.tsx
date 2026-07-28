"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { signup, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { US_STATES } from "@/lib/us-states";
import { Loader2, ShieldCheck, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function IdUploadField({
  error,
  onFileChange,
}: {
  error?: string;
  onFileChange?: (file: File | null) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0] ?? null;
    setFileName(file?.name ?? null);
    onFileChange?.(file);
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          error
            ? "border-destructive/50 bg-destructive/5"
            : dragActive
              ? "border-primary bg-primary/5"
              : "border-border",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (inputRef.current) inputRef.current.files = e.dataTransfer.files;
          handleFiles(e.dataTransfer.files);
        }}
      >
        <Upload className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {fileName ?? "Drag a photo here, or click to select a file"}
        </p>
        <input
          ref={inputRef}
          id="idImage"
          name="idImage"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-invalid={!!error}
          className="absolute inset-0 size-0 opacity-0"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          Choose file
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    signup,
    undefined,
  );
  const [fileError, setFileError] = useState<string | null>(null);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        const file = new FormData(e.currentTarget).get("idImage");
        if (!(file instanceof File) || file.size === 0) {
          e.preventDefault();
          setFileError("Please attach a photo of your Tennessee driver's license.");
        }
      }}
      className="space-y-8"
    >
      {state?.message && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Account</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field id="email" label="Email address" error={state?.errors?.email?.[0]}>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </Field>
          </div>
          <Field id="password" label="Password" error={state?.errors?.password?.[0]}>
            <Input id="password" name="password" type="password" required autoComplete="new-password" />
          </Field>
          <Field
            id="confirmPassword"
            label="Confirm password"
            error={state?.errors?.confirmPassword?.[0]}
          >
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Personal information</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="firstName" label="First name" error={state?.errors?.firstName?.[0]}>
            <Input id="firstName" name="firstName" required autoComplete="given-name" />
          </Field>
          <Field id="middleName" label="Middle name">
            <Input id="middleName" name="middleName" autoComplete="additional-name" />
          </Field>
          <Field id="lastName" label="Last name" error={state?.errors?.lastName?.[0]}>
            <Input id="lastName" name="lastName" required autoComplete="family-name" />
          </Field>
        </div>
        <Field id="phone" label="Phone (optional)">
          <Input id="phone" name="phone" type="tel" autoComplete="tel" />
        </Field>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Address</h3>
        <Field id="address1" label="Address" error={state?.errors?.address1?.[0]}>
          <Input id="address1" name="address1" required autoComplete="address-line1" />
        </Field>
        <Field id="address2" label="Address line 2 (optional)">
          <Input id="address2" name="address2" autoComplete="address-line2" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="city" label="City" error={state?.errors?.city?.[0]}>
            <Input id="city" name="city" required autoComplete="address-level2" />
          </Field>
          <Field id="state" label="State" error={state?.errors?.state?.[0]}>
            <Select
              name="state"
              items={US_STATES.map((s) => ({ value: s.code, label: s.name }))}
              required
            >
              <SelectTrigger id="state" className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((s) => (
                  <SelectItem key={s.code} value={s.code}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field id="zip" label="ZIP code" error={state?.errors?.zip?.[0]}>
            <Input id="zip" name="zip" required autoComplete="postal-code" />
          </Field>
        </div>
        <Field id="companyName" label="Company name (if applicable)">
          <Input id="companyName" name="companyName" />
        </Field>
      </section>

      <section className="space-y-3 rounded-lg border bg-muted/30 p-4">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Tennessee&apos;s public records policy requires proof of Tennessee
            citizenship before records can be inspected or copied. Attach a
            photo of your Tennessee driver&apos;s license — an AI reviewer
            gives most accounts an instant decision; anything uncertain goes
            to a staff member for manual review.
          </p>
        </div>
        <IdUploadField
          error={fileError ?? undefined}
          onFileChange={(file) => {
            if (file) setFileError(null);
          }}
        />
      </section>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Create account
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
