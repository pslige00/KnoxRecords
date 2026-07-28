"use server";

import { checkRateLimit } from "@/lib/auth/rate-limit";
import { getClientIp } from "@/lib/auth/client-ip";
import { geocodeOneLine, type GeocodeResult } from "@/lib/geocode";

export async function lookupAddress(query: string): Promise<GeocodeResult | null> {
  const trimmed = query.trim();
  if (trimmed.length < 8) return null;

  const ip = await getClientIp();
  const { allowed } = checkRateLimit(`geocode:${ip}`, { limit: 20, windowMs: 60 * 1000 });
  if (!allowed) return null;

  try {
    return await geocodeOneLine(trimmed);
  } catch (err) {
    console.error("Address geocode failed", err);
    return null;
  }
}
