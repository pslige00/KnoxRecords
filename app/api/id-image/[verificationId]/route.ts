import { eq } from "drizzle-orm";
import { get } from "@vercel/blob";
import { db } from "@/lib/db";
import { idVerifications } from "@/lib/db/schema";
import { getOptionalSession } from "@/lib/auth/dal";

// Streams a driver's license image from Blob storage to staff only. The
// underlying Blob URL is never sent to the browser directly (see lib/blob.ts).
// Uses direct 401/403 responses (not redirects) since this is consumed by
// <img> tags, not navigated to as a page.
export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/id-image/[verificationId]">,
) {
  const session = await getOptionalSession();
  if (!session) {
    return new Response(null, { status: 401 });
  }
  if (session.role !== "staff") {
    return new Response(null, { status: 403 });
  }

  const { verificationId } = await ctx.params;

  const [verification] = await db
    .select()
    .from(idVerifications)
    .where(eq(idVerifications.id, verificationId))
    .limit(1);

  if (!verification) {
    return new Response(null, { status: 404 });
  }

  const result = await get(verification.fileUrl, { access: "private" });
  if (!result || result.statusCode !== 200) {
    return new Response(null, { status: 502 });
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "Cache-Control": "private, no-store",
    },
  });
}
