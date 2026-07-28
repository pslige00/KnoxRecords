"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { departments, requests, requestEvents } from "@/lib/db/schema";
import { requireApprovedCitizen } from "@/lib/auth/dal";
import { newRequestSchema, editRequestSchema, withdrawRequestSchema } from "@/lib/validation";
import { classifyRequest } from "@/lib/ai/classify-request";
import { generateReferenceNumber } from "@/lib/reference-number";

const RESPONSE_WINDOW_DAYS = 7;

export type RequestFormState = {
  errors?: Record<string, string[]>;
  message?: string;
} | undefined;

export async function createRequest(
  _prevState: RequestFormState,
  formData: FormData,
): Promise<RequestFormState> {
  const user = await requireApprovedCitizen();

  const validated = newRequestSchema.safeParse({
    departmentId: formData.get("departmentId"),
    description: formData.get("description"),
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { departmentId, description } = validated.data;

  const allDepartments = await db.select().from(departments);
  const selected = allDepartments.find((d) => d.id === departmentId);
  if (!selected) {
    return { message: "Select a valid department." };
  }

  let aiSuggestedDepartmentId: string | null = null;
  let aiPriority: "low" | "normal" | "high" = "normal";
  let aiSummary: string | null = null;
  let aiReasoning: string | null = null;

  try {
    const classification = await classifyRequest({
      description,
      selectedDepartmentSlug: selected.slug,
      departments: allDepartments.map((d) => ({ slug: d.slug, name: d.name })),
    });
    const suggestedDept = allDepartments.find(
      (d) => d.slug === classification.suggestedDepartmentSlug,
    );
    aiSuggestedDepartmentId = suggestedDept?.id ?? null;
    aiPriority = classification.priority;
    aiSummary = classification.summary;
    aiReasoning = classification.reasoning;
  } catch (err) {
    console.error("Request classification failed, using defaults", err);
  }

  const dueDate = new Date(Date.now() + RESPONSE_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [request] = await db
    .insert(requests)
    .values({
      referenceNo: generateReferenceNumber(),
      userId: user.id,
      departmentId: selected.id,
      description,
      aiSuggestedDepartmentId,
      aiPriority,
      aiSummary,
      aiReasoning,
      status: "new",
      priority: aiPriority,
      dueDate,
    })
    .returning();

  await db.insert(requestEvents).values({
    requestId: request.id,
    authorId: user.id,
    message: "Request submitted.",
    isCustomerVisible: true,
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/requests/${request.id}`);
}

export async function editRequest(
  _prevState: RequestFormState,
  formData: FormData,
): Promise<RequestFormState> {
  const user = await requireApprovedCitizen();

  const validated = editRequestSchema.safeParse({
    requestId: formData.get("requestId"),
    departmentId: formData.get("departmentId"),
    description: formData.get("description"),
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const { requestId, departmentId, description } = validated.data;

  const [existing] = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1);
  if (!existing || existing.userId !== user.id) {
    return { message: "Request not found." };
  }
  if (existing.status !== "new") {
    return { message: "This request can no longer be edited — staff has already begun reviewing it." };
  }

  const [dept] = await db.select().from(departments).where(eq(departments.id, departmentId)).limit(1);
  if (!dept) {
    return { message: "Select a valid department." };
  }

  await db
    .update(requests)
    .set({ departmentId, description, updatedAt: new Date() })
    .where(eq(requests.id, requestId));

  await db.insert(requestEvents).values({
    requestId,
    authorId: user.id,
    message: "Request details updated by the requester.",
    isCustomerVisible: true,
  });

  revalidatePath(`/dashboard/requests/${requestId}`);
  redirect(`/dashboard/requests/${requestId}`);
}

export async function withdrawRequest(
  _prevState: RequestFormState,
  formData: FormData,
): Promise<RequestFormState> {
  const user = await requireApprovedCitizen();

  const validated = withdrawRequestSchema.safeParse({
    requestId: formData.get("requestId"),
  });
  if (!validated.success) {
    return { message: "Invalid request." };
  }
  const { requestId } = validated.data;

  const [existing] = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1);
  if (!existing || existing.userId !== user.id) {
    return { message: "Request not found." };
  }
  if (["completed", "rejected", "withdrawn"].includes(existing.status)) {
    return { message: "This request has already been closed and can't be withdrawn." };
  }

  await db
    .update(requests)
    .set({ status: "withdrawn", updatedAt: new Date() })
    .where(eq(requests.id, requestId));

  await db.insert(requestEvents).values({
    requestId,
    authorId: user.id,
    message: "Request withdrawn by the requester.",
    isCustomerVisible: true,
  });

  revalidatePath(`/dashboard/requests/${requestId}`);
  redirect(`/dashboard/requests/${requestId}`);
}
