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
const OPTIMIZED_FORMATS = new Set(["webp", "avif"]);

function redirectTo(request, url, headers = {}) {
  return NextResponse.redirect(new URL(url, request.url), {
    status: 307,
    headers,
  });
}

function getOptimizedRequest(request) {
  const { searchParams } = new URL(request.url);
  const width = Number(searchParams.get("w") || 0);
  const format = String(searchParams.get("f") || "webp").toLowerCase();

  if (!OPTIMIZED_WIDTHS.has(width) || !OPTIMIZED_FORMATS.has(format)) {
    return null;
  }

  return { width, format };
}

async function createOptimizedImage(url, { width, format }) {
  const sourceResponse = await fetch(url, {
    next: { revalidate: 86400 },
  });

  if (!sourceResponse.ok) return null;

  const sourceBuffer = Buffer.from(await sourceResponse.arrayBuffer());
  let pipeline = sharp(sourceBuffer)
    .rotate()
    .resize({
      width,
      withoutEnlargement: true,
    });

  pipeline =
    format === "avif"
      ? pipeline.avif({ quality: 58, effort: 4 })
      : pipeline.webp({ quality: 72, effort: 4 });

  return pipeline.toBuffer();
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
    `${supabaseBaseUrl}/rest/v1/site_assets?select=url,updated_at&key=eq.${encodeURIComponent(
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
    const image = await createOptimizedImage(versionedUrl, optimizedRequest);

    if (image) {
      return new NextResponse(image, {
        headers: {
          ...CACHE_HEADERS,
          "Content-Type": `image/${optimizedRequest.format}`,
          "Content-Length": String(image.length),
          "Vary": "Accept",
        },
      });
    }
  }

  return NextResponse.redirect(versionedUrl, {
    status: 307,
    headers: CACHE_HEADERS,
  });
}
