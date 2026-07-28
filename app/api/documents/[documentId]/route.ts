import { eq } from "drizzle-orm";
import { get } from "@vercel/blob";
import { db } from "@/lib/db";
import { requestDocuments, requests } from "@/lib/db/schema";
import { getOptionalSession } from "@/lib/auth/dal";

// Streams a request document from Blob storage to staff or the citizen who
// owns the underlying request. The Blob URL is never sent to the browser.
export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/documents/[documentId]">,
) {
  const session = await getOptionalSession();
  if (!session) {
    return new Response(null, { status: 401 });
  }

  const { documentId } = await ctx.params;

  const [row] = await db
    .select({
      fileUrl: requestDocuments.fileUrl,
      fileName: requestDocuments.fileName,
      requestOwnerId: requests.userId,
    })
    .from(requestDocuments)
    .innerJoin(requests, eq(requestDocuments.requestId, requests.id))
    .where(eq(requestDocuments.id, documentId))
    .limit(1);

  if (!row) {
    return new Response(null, { status: 404 });
  }

  const isOwner = row.requestOwnerId === session.userId;
  if (session.role !== "staff" && !isOwner) {
    return new Response(null, { status: 403 });
  }

  const result = await get(row.fileUrl, { access: "private" });
  if (!result || result.statusCode !== 200) {
    return new Response(null, { status: 502 });
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "Content-Disposition": `attachment; filename="${row.fileName.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
