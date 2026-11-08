import { unstable_cache } from "next/cache";

export type GoogleRating = { rating: number; count: number };

/** Last confirmed public listing, used only when Google does not answer. */
const FALLBACK: GoogleRating = { rating: 5, count: 11 };

const PLACE_ID = "ChIJwUDJ4XNrpw0RvV9LTVmd9M8";

/** Public Maps preview for this one place. `hl=en` keeps the "N reviews" label stable. */
const PREVIEW_URL =
  "https://www.google.com/maps/preview/place?hl=en&gl=ma&pb=!1m14!1s0x0:0xcff49d594d4b5fbd!3m12!1m3!1d26484.34928390865!2d-6.9249394!3d33.92714015!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1";

function reviewCount(node: unknown[], depth: number): number | null {
  for (const item of node) {
    if (typeof item === "string") {
      const match = /^(\d+)\s+reviews?$/i.exec(item);
      if (match) return Number(match[1]);
    } else if (depth > 0 && Array.isArray(item)) {
      const nested = reviewCount(item, depth - 1);
      if (nested != null) return nested;
    }
  }
  return null;
}

function ratingIn(node: unknown): GoogleRating | null {
  if (!Array.isArray(node)) return null;
  const count = reviewCount(node, 1);
  if (count != null) {
    for (let i = 0; i < node.length - 1; i++) {
      const rating = node[i];
      const next = node[i + 1];
      if (typeof rating === "number" && next === count && rating >= 1 && rating <= 5) {
        return { rating, count };
      }
    }
  }
  for (const child of node) {
    const found = ratingIn(child);
    if (found) return found;
  }
  return null;
}

function parsePreview(body: string): GoogleRating | null {
  if (!body.includes(PLACE_ID)) return null;
  const json = body.replace(/^\)\]\}'\s*/, "");
  try {
    return ratingIn(JSON.parse(json));
  } catch {
    return null;
  }
}

async function readLive(): Promise<GoogleRating> {
  const response = await fetch(PREVIEW_URL, {
    headers: {
      "Accept-Language": "en",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Google reviews ${response.status}`);
  const rating = parsePreview(await response.text());
  if (!rating) throw new Error("Google reviews parse failed");
  return rating;
}

const readCached = unstable_cache(readLive, ["touch-sense-google-rating"], { revalidate: 60 * 60 });

/** Rating and review count for THAI PRAKHOP, refreshed from Google about once an hour. */
export async function getGoogleRating(): Promise<GoogleRating> {
  try {
    return await readCached();
  } catch {
    return FALLBACK;
  }
}
