"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, idVerifications } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/passwords";
import { createSession, deleteSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp } from "@/lib/auth/client-ip";
import {
  signupSchema,
  loginSchema,
  validateFile,
  ID_IMAGE_MAX_BYTES,
  ID_IMAGE_ALLOWED_TYPES,
} from "@/lib/validation";
import { uploadIdImage } from "@/lib/blob";
import { verifyDriversLicense } from "@/lib/ai/id-verify";
import { sendAccountApprovedEmail } from "@/lib/email";

export type AuthFormState = {
  errors?: Record<string, string[]>;
  message?: string;
} | undefined;

const AUTO_APPROVE_CONFIDENCE = 0.85;

export async function signup(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const ip = await getClientIp();
  const { allowed } = checkRateLimit(`signup:${ip}`, {
    limit: 5,
    windowMs: 60 * 60 * 1000,
  });
  if (!allowed) {
    return { message: "Too many signup attempts. Please try again later." };
  }

  const validated = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    firstName: formData.get("firstName"),
    middleName: formData.get("middleName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    address1: formData.get("address1"),
    address2: formData.get("address2"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip: formData.get("zip"),
    companyName: formData.get("companyName"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const idImage = formData.get("idImage");
  if (!(idImage instanceof File) || idImage.size === 0) {
    return { message: "Please attach a photo of your Tennessee driver's license." };
  }
  const fileError = validateFile(idImage, {
    maxBytes: ID_IMAGE_MAX_BYTES,
    allowedTypes: ID_IMAGE_ALLOWED_TYPES,
  });
  if (fileError) {
    return { message: fileError };
  }

  const data = validated.data;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);
  if (existing) {
    return { errors: { email: ["An account with this email already exists."] } };
  }

  const passwordHash = await hashPassword(data.password);

  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      middleName: data.middleName || null,
      lastName: data.lastName,
      phone: data.phone || null,
      address1: data.address1,
      address2: data.address2 || null,
      city: data.city,
      state: data.state,
      zip: data.zip,
      companyName: data.companyName || null,
      role: "citizen",
      accountStatus: "pending",
    })
    .returning();

  // Best-effort AI verification. If it fails, the account stays pending
  // for manual staff review rather than blocking signup entirely.
  let autoApproved = false;
  try {
    const fileUrl = await uploadIdImage(idImage, user.id);
    const buffer = Buffer.from(await idImage.arrayBuffer());
    const mediaType = idImage.type as "image/jpeg" | "image/png" | "image/webp";

    const result = await verifyDriversLicense({
      imageBase64: buffer.toString("base64"),
      mediaType,
      claimedFirstName: data.firstName,
      claimedLastName: data.lastName,
    });

    await db.insert(idVerifications).values({
      userId: user.id,
      fileUrl,
      aiVerdict: result.verdict,
      aiConfidence: result.confidence,
      extractedName: result.extractedName,
      extractedDob: result.extractedDob,
      extractedLicenseNumber: result.extractedLicenseNumber,
      aiReasoning: result.reasoning,
    });

    if (result.verdict === "approved" && result.confidence >= AUTO_APPROVE_CONFIDENCE) {
      await db
        .update(users)
        .set({ accountStatus: "approved" })
        .where(eq(users.id, user.id));
      await sendAccountApprovedEmail(user.email, user.firstName).catch(() => {});
      autoApproved = true;
    }
  } catch (err) {
    console.error("ID verification failed, leaving account pending", err);
  }

  await createSession({ userId: user.id, role: "citizen" });
  redirect(autoApproved ? "/dashboard" : "/account/pending");
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const ip = await getClientIp();
  const { allowed } = checkRateLimit(`login:${ip}`, {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!allowed) {
    return { message: "Too many login attempts. Please try again later." };
  }

  const validated = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { email, password } = validated.data;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Generic error message on both "no such user" and "wrong password" to
  // avoid leaking which emails have accounts.
  const genericError = { message: "Invalid email or password." };
  if (!user) return genericError;

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) return genericError;

  await createSession({ userId: user.id, role: user.role });

  if (user.role === "staff") {
    redirect("/staff/requests");
  }
  if (user.accountStatus !== "approved") {
    redirect("/account/pending");
  }
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
