"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FilterOption = { value: string; label: string };

/** A GET-form-friendly select: submits via its `name` like a native
 * <select>, but renders through our own popup so text stays legible in
 * both themes instead of relying on the browser's native dropdown chrome. */
export function FilterSelect({
  name,
  defaultValue,
  ariaLabel,
  options,
}: {
  name: string;
  defaultValue?: string;
  ariaLabel: string;
  options: FilterOption[];
}) {
  return (
    <Select name={name} defaultValue={defaultValue || "all"} items={options}>
      <SelectTrigger aria-label={ariaLabel} className="h-9 w-auto min-w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
