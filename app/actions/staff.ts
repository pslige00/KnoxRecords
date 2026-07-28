"use server";

import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  users,
  idVerifications,
  requests,
  requestDocuments,
  requestEvents,
  departments,
} from "@/lib/db/schema";
import { requireStaff } from "@/lib/auth/dal";
import {
  accountDecisionSchema,
  requestDecisionSchema,
  validateFile,
  RECORD_DOC_MAX_BYTES,
  RECORD_DOC_ALLOWED_TYPES,
} from "@/lib/validation";
import { uploadRecordDocument } from "@/lib/blob";
import {
  sendAccountApprovedEmail,
  sendAccountRejectedEmail,
  sendRequestStatusEmail,
} from "@/lib/email";
import { REQUEST_STATUS_LABELS } from "@/lib/status-labels";

export type ActionResult = { message?: string } | undefined;

export async function decideAccount(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const staff = await requireStaff();

  const validated = accountDecisionSchema.safeParse({
    userId: formData.get("userId"),
    decision: formData.get("decision"),
  });
  if (!validated.success) {
    return { message: "Invalid request." };
  }
  const { userId, decision } = validated.data;

  const [citizen] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!citizen) {
    return { message: "Account not found." };
  }

  await db.update(users).set({ accountStatus: decision }).where(eq(users.id, userId));

  const [latestVerification] = await db
    .select()
    .from(idVerifications)
    .where(eq(idVerifications.userId, userId))
    .orderBy(desc(idVerifications.createdAt))
    .limit(1);

  if (latestVerification) {
    await db
      .update(idVerifications)
      .set({ reviewedBy: staff.id, reviewedAt: new Date() })
      .where(eq(idVerifications.id, latestVerification.id));
  }

  if (decision === "approved") {
    await sendAccountApprovedEmail(citizen.email, citizen.firstName).catch(() => {});
  } else {
    await sendAccountRejectedEmail(
      citizen.email,
      citizen.firstName,
      "we were unable to verify Tennessee residency from the documentation provided.",
    ).catch(() => {});
  }

  revalidatePath("/staff/accounts");
  return { message: `Account ${decision}.` };
}

export async function assignRequest(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const staff = await requireStaff();

  const validated = requestDecisionSchema.safeParse({
    requestId: formData.get("requestId"),
    departmentId: formData.get("departmentId"),
    priority: formData.get("priority"),
  });
  if (!validated.success) {
    return { message: "Invalid request." };
  }
  const { requestId, departmentId, priority } = validated.data;

  const [dept] = await db.select().from(departments).where(eq(departments.id, departmentId)).limit(1);
  if (!dept) {
    return { message: "Select a valid department." };
  }

  const [existing] = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1);
  if (!existing) {
    return { message: "Request not found." };
  }

  await db
    .update(requests)
    .set({
      departmentId,
      priority,
      assignedStaffId: staff.id,
      status: existing.status === "new" ? "in_review" : existing.status,
      updatedAt: new Date(),
    })
    .where(eq(requests.id, requestId));

  await db.insert(requestEvents).values({
    requestId,
    authorId: staff.id,
    message: `Routed to ${dept.name} with ${priority} priority by ${staff.firstName} ${staff.lastName}.`,
    isCustomerVisible: false,
  });

  revalidatePath(`/staff/requests/${requestId}`);
  return { message: "Routing updated." };
}

export async function uploadRequestDocument(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const staff = await requireStaff();

  const requestId = formData.get("requestId");
  if (typeof requestId !== "string") {
    return { message: "Invalid request." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { message: "Choose a file to upload." };
  }
  const fileError = validateFile(file, {
    maxBytes: RECORD_DOC_MAX_BYTES,
    allowedTypes: RECORD_DOC_ALLOWED_TYPES,
  });
  if (fileError) {
    return { message: fileError };
  }

  const [existing] = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1);
  if (!existing) {
    return { message: "Request not found." };
  }

  const fileUrl = await uploadRecordDocument(file, requestId);

  await db.insert(requestDocuments).values({
    requestId,
    fileUrl,
    fileName: file.name,
    uploadedBy: staff.id,
  });

  await db.insert(requestEvents).values({
    requestId,
    authorId: staff.id,
    message: `${staff.firstName} ${staff.lastName} uploaded "${file.name}".`,
    isCustomerVisible: false,
  });

  revalidatePath(`/staff/requests/${requestId}`);
  return { message: "Document uploaded." };
}

export async function addInternalNote(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const staff = await requireStaff();

  const requestId = formData.get("requestId");
  const message = formData.get("message");
  if (typeof requestId !== "string" || typeof message !== "string" || !message.trim()) {
    return { message: "Enter a note." };
  }

  await db.insert(requestEvents).values({
    requestId,
    authorId: staff.id,
    message: message.trim(),
    isCustomerVisible: false,
  });

  revalidatePath(`/staff/requests/${requestId}`);
  return { message: "Note added." };
}

export async function updateRequestStatus(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const staff = await requireStaff();

  const requestId = formData.get("requestId");
  const status = formData.get("status");
  const customerMessage = formData.get("customerMessage");

  if (
    typeof requestId !== "string" ||
    typeof status !== "string" ||
    !(status in REQUEST_STATUS_LABELS) ||
    typeof customerMessage !== "string" ||
    !customerMessage.trim()
  ) {
    return { message: "Enter a status update message for the customer." };
  }

  const [existing] = await db
    .select()
    .from(requests)
    .where(eq(requests.id, requestId))
    .limit(1);
  if (!existing) {
    return { message: "Request not found." };
  }

  const [citizen] = await db.select().from(users).where(eq(users.id, existing.userId)).limit(1);
  if (!citizen) {
    return { message: "Requester account not found." };
  }

  const typedStatus = status as (typeof requests.$inferSelect)["status"];

  await db
    .update(requests)
    .set({
      status: typedStatus,
      updatedAt: new Date(),
      completedAt: typedStatus === "completed" ? new Date() : existing.completedAt,
    })
    .where(eq(requests.id, requestId));

  await db.insert(requestEvents).values({
    requestId,
    authorId: staff.id,
    message: customerMessage.trim(),
    isCustomerVisible: true,
  });

  await sendRequestStatusEmail({
    to: citizen.email,
    firstName: citizen.firstName,
    referenceNo: existing.referenceNo,
    statusLabel: REQUEST_STATUS_LABELS[typedStatus],
    message: customerMessage.trim(),
    requestId,
  }).catch(() => {});

  revalidatePath(`/staff/requests/${requestId}`);
  revalidatePath(`/dashboard/requests/${requestId}`);
  return { message: "Status updated and customer notified." };
}
