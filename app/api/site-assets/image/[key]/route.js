import { NextResponse } from "next/server";
import sharp from "sharp";
import {
  hasSupabaseConfig,
  supabaseBaseUrl,
  supabaseHeaders,
} from "../../../_lib/supabase";

export const runtime = "nodejs";

const ASSET_KEYS = new Set([
  "hero_before",
  "hero_after",
  "cover_car",
  "cover_portrait",
  "cover_nature",
  "cover_event",
  "info_image",
]);

const FALLBACKS = {
  hero_before: "/images/vorher.jpg",
  hero_after: "/images/nacher.jpg",
  cover_car: "/images/hyundaititel.jpg",
  cover_nature: "/images/startpoint.jpg",
  cover_event: "/images/abititel.jpg",
};

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
};

const OPTIMIZED_WIDTHS = new Set([600, 900, 1200]);
const OUTPUT_FORMATS = new Set(["webp", "avif", "jpeg", "jpg"]);

function redirectTo(request, url, headers = {}) {
  return NextResponse.redirect(new URL(url, request.url), {
    status: 307,
    headers,
  });
}

function getOptimizedRequest(request) {
  const { searchParams } = new URL(request.url);
  const width = Number(searchParams.get("w") || 0);
  const rawFormat = String(searchParams.get("f") || "webp").toLowerCase();
  const format = rawFormat === "jpg" ? "jpeg" : rawFormat;

  if (!OPTIMIZED_WIDTHS.has(width) || !OUTPUT_FORMATS.has(rawFormat)) {
    return null;
  }

  return { width, format };
}

async function createOptimizedImageResponse(sourceUrl, optimizedRequest) {
  const imageResponse = await fetch(sourceUrl, {
    headers: {
      Accept: "image/avif,image/webp,image/jpeg,image/png,image/*,*/*",
    },
    next: { revalidate: 86400 },
  });

  if (!imageResponse.ok) return null;

  const sourceBuffer = Buffer.from(await imageResponse.arrayBuffer());
  let image = sharp(sourceBuffer, { failOn: "none" })
    .rotate()
    .resize({
      width: optimizedRequest.width,
      withoutEnlargement: true,
    });

  if (optimizedRequest.format === "avif") {
    image = image.avif({ quality: 62 });
  } else if (optimizedRequest.format === "jpeg") {
    image = image.jpeg({ quality: 82, mozjpeg: true });
  } else {
    image = image.webp({ quality: 78 });
  }

  const body = await image.toBuffer();
  const contentType =
    optimizedRequest.format === "avif"
      ? "image/avif"
      : optimizedRequest.format === "jpeg"
        ? "image/jpeg"
        : "image/webp";

  return new NextResponse(body, {
    status: 200,
    headers: {
      ...CACHE_HEADERS,
      "Content-Type": contentType,
    },
  });
}

export async function GET(request, { params }) {
  const { key } = await params;
  const optimizedRequest = getOptimizedRequest(request);

  if (!ASSET_KEYS.has(key)) {
    return NextResponse.json({ error: "Unbekanntes Bild." }, { status: 404 });
  }

  if (!hasSupabaseConfig) {
    return FALLBACKS[key]
      ? redirectTo(request, FALLBACKS[key], CACHE_HEADERS)
      : new NextResponse(null, { status: 404 });
  }

  const response = await fetch(
    `${supabaseBaseUrl}/rest/v1/site_assets?select=url,path,updated_at&key=eq.${encodeURIComponent(
      key
    )}&limit=1`,
    {
      headers: supabaseHeaders,
      next: { revalidate: 300 },
    }
  );

  if (!response.ok) {
    return FALLBACKS[key]
      ? redirectTo(request, FALLBACKS[key], CACHE_HEADERS)
      : new NextResponse(null, { status: 404 });
  }

  const [asset] = await response.json();

  if (!asset?.url) {
    return FALLBACKS[key]
      ? redirectTo(request, FALLBACKS[key], CACHE_HEADERS)
      : new NextResponse(null, { status: 404 });
  }

  const version = asset.updated_at ? new Date(asset.updated_at).getTime() : Date.now();
  const separator = asset.url.includes("?") ? "&" : "?";
  const versionedUrl = `${asset.url}${separator}v=${version}`;

  if (optimizedRequest) {
    const optimizedResponse = await createOptimizedImageResponse(
      versionedUrl,
      optimizedRequest
    ).catch(() => null);

    if (optimizedResponse) return optimizedResponse;
  }

  return NextResponse.redirect(versionedUrl, {
    status: 307,
    headers: CACHE_HEADERS,
  });
}
