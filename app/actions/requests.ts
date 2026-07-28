"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { departments, requests, requestEvents } from "@/lib/db/schema";
import { requireApprovedCitizen } from "@/lib/auth/dal";
import { newRequestSchema } from "@/lib/validation";
import { classifyRequest } from "@/lib/ai/classify-request";
import { generateReferenceNumber } from "@/lib/reference-number";

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
