import "server-only";

export type GeocodeResult = {
  street: string;
  city: string;
  state: string;
  zip: string;
};

function titleCase(value: string): string {
  return value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Resolves a free-text address to a normalized street/city/state/zip using
 * the US Census Bureau's public geocoder (no API key required). Matching
 * needs enough context to disambiguate — a bare street address without a
 * city/state rarely returns a match.
 */
export async function geocodeOneLine(query: string): Promise<GeocodeResult | null> {
  const url = new URL("https://geocoding.geo.census.gov/geocoder/locations/onelineaddress");
  url.searchParams.set("address", query);
  url.searchParams.set("benchmark", "Public_AR_Current");
  url.searchParams.set("format", "json");

  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;

  const data = await res.json();
  const match = data?.result?.addressMatches?.[0];
  if (!match?.addressComponents || typeof match.matchedAddress !== "string") return null;

  const { city, state, zip } = match.addressComponents;
  if (!city || !state || !zip) return null;

  const [streetLine] = match.matchedAddress.split(",");
  if (!streetLine) return null;

  return {
    street: titleCase(streetLine.trim()),
    city: titleCase(city),
    state,
    zip,
  };
}
