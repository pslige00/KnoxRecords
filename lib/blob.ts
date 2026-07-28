import "server-only";
import { put } from "@vercel/blob";

/**
 * Blobs are stored with "private" access — reading them back requires the
 * BLOB_READ_WRITE_TOKEN (server-side only via `get()`), not just a
 * guessable/unguessable URL. Because some of what we store here (driver's
 * license photos) is sensitive, we never expose these URLs directly to the
 * browser: the DB stores the blob URL and an authenticated route handler
 * fetches + streams the bytes server-side after checking the caller is
 * allowed to see it. See app/api/id-image and app/api/documents.
 */
export async function uploadIdImage(file: File, userId: string) {
  const blob = await put(`id-verifications/${userId}/${file.name}`, file, {
    access: "private",
    addRandomSuffix: true,
  });
  return blob.url;
}

export async function uploadRecordDocument(file: File, requestId: string) {
  const blob = await put(`request-documents/${requestId}/${file.name}`, file, {
    access: "private",
    addRandomSuffix: true,
  });
  return blob.url;
}
