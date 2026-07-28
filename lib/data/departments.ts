import "server-only";
import { db } from "@/lib/db";
import { departments } from "@/lib/db/schema";

export async function getDepartments() {
  return db.select().from(departments).orderBy(departments.name);
}
