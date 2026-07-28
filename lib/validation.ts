import { z } from "zod";
import { US_STATES as US_STATES_LIST } from "@/lib/us-states";

const US_STATES = new Set<string>(US_STATES_LIST.map((s) => s.code));

export const signupSchema = z
  .object({
    email: z.string().trim().email({ message: "Enter a valid email address." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(/[a-zA-Z]/, { message: "Password must contain a letter." })
      .regex(/[0-9]/, { message: "Password must contain a number." }),
    confirmPassword: z.string(),
    firstName: z.string().trim().min(1, { message: "First name is required." }).max(120),
    middleName: z.string().trim().max(120).optional().or(z.literal("")),
    lastName: z.string().trim().min(1, { message: "Last name is required." }).max(120),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    address1: z.string().trim().min(1, { message: "Address is required." }).max(255),
    address2: z.string().trim().max(255).optional().or(z.literal("")),
    city: z.string().trim().min(1, { message: "City is required." }).max(120),
    state: z
      .string()
      .trim()
      .toUpperCase()
      .refine((v) => US_STATES.has(v), { message: "Enter a valid two-letter state." }),
    zip: z
      .string()
      .trim()
      .regex(/^\d{5}(-\d{4})?$/, { message: "Enter a valid ZIP code." }),
    companyName: z.string().trim().max(255).optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export const newRequestSchema = z.object({
  departmentId: z.string().uuid({ message: "Select a department." }),
  description: z
    .string()
    .trim()
    .min(10, { message: "Please describe the records you're requesting (at least 10 characters)." })
    .max(5000),
});

export const staffCommentSchema = z.object({
  requestId: z.string().uuid(),
  message: z.string().trim().min(1).max(5000),
  isCustomerVisible: z.boolean(),
});

export const accountDecisionSchema = z.object({
  userId: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
});

export const requestDecisionSchema = z.object({
  requestId: z.string().uuid(),
  departmentId: z.string().uuid(),
  priority: z.enum(["low", "normal", "high"]),
});

export const completeRequestSchema = z.object({
  requestId: z.string().uuid(),
});

export const editRequestSchema = z.object({
  requestId: z.string().uuid(),
  departmentId: z.string().uuid({ message: "Select a department." }),
  description: z
    .string()
    .trim()
    .min(10, { message: "Please describe the records you're requesting (at least 10 characters)." })
    .max(5000),
});

export const withdrawRequestSchema = z.object({
  requestId: z.string().uuid(),
});

export const deleteRequestSchema = z.object({
  requestId: z.string().uuid(),
});

export const extendDueDateSchema = z.object({
  requestId: z.string().uuid(),
  newDueDate: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), { message: "Enter a valid date." }),
  reason: z.string().trim().min(1, { message: "Give a reason for the extension." }).max(1000),
});

// --- File upload constraints ---

export const ID_IMAGE_MAX_BYTES = 8 * 1024 * 1024; // 8MB
export const ID_IMAGE_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const RECORD_DOC_MAX_BYTES = 25 * 1024 * 1024; // 25MB
export const RECORD_DOC_ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
]);

export function validateFile(
  file: File,
  { maxBytes, allowedTypes }: { maxBytes: number; allowedTypes: Set<string> },
): string | null {
  if (file.size === 0) return "File is empty.";
  if (file.size > maxBytes) {
    return `File is too large (max ${Math.round(maxBytes / (1024 * 1024))}MB).`;
  }
  if (!allowedTypes.has(file.type)) {
    return "Unsupported file type.";
  }
  return null;
}
