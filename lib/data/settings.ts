import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { appSettings, users } from "@/lib/db/schema";

export const DEFAULT_ID_AUTO_APPROVE_THRESHOLD = 0.85;

export async function getIdAutoApproveThreshold(): Promise<number> {
  const [row] = await db
    .select({ value: appSettings.idAutoApproveThreshold })
    .from(appSettings)
    .limit(1);
  return row?.value ?? DEFAULT_ID_AUTO_APPROVE_THRESHOLD;
}

export async function getAppSettingsWithUpdater() {
  const [row] = await db
    .select({
      id: appSettings.id,
      idAutoApproveThreshold: appSettings.idAutoApproveThreshold,
      updatedAt: appSettings.updatedAt,
      updatedByFirstName: users.firstName,
      updatedByLastName: users.lastName,
    })
    .from(appSettings)
    .leftJoin(users, eq(appSettings.updatedBy, users.id))
    .limit(1);

  return (
    row ?? {
      id: null,
      idAutoApproveThreshold: DEFAULT_ID_AUTO_APPROVE_THRESHOLD,
      updatedAt: null,
      updatedByFirstName: null,
      updatedByLastName: null,
    }
  );
}
