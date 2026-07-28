import Link from "next/link";
import { cn } from "@/lib/utils";

function AppIconGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7 3.5h6.5L18 8v11.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19.5v-14A1.5 1.5 0 0 1 7 3.5Z"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path
        d="M7 3.5h6.5L18 8v11.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19.5v-14A1.5 1.5 0 0 1 7 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M13.5 3.5V8H18" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path
        d="M9 13.4l2.1 2.1L15.5 11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <AppIconGlyph className="size-4" />
      </span>
      <span>KnoxRecords</span>
    </Link>
  );
}
