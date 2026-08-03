import { NextResponse } from "next/server";
import {
  hasSupabaseConfig,
  supabaseBaseUrl,
  supabaseHeaders,
  storageBucket,
} from "../../../_lib/supabase";

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

function redirectTo(request, url, headers = {}) {
  return NextResponse.redirect(new URL(url, request.url), {
    status: 307,
    headers,
  });
}

function getOptimizedRequest(request) {
  const { searchParams } = new URL(request.url);
  const width = Number(searchParams.get("w") || 0);

  if (!OPTIMIZED_WIDTHS.has(width)) {
    return null;
  }

  return { width };
}

function getSupabaseImageTransformUrl(path, { width }) {
  if (!path) return "";

  const encodedPath = String(path)
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${supabaseBaseUrl}/storage/v1/render/image/public/${storageBucket}/${encodedPath}?width=${width}&quality=76&resize=cover`;
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

  if (optimizedRequest && asset.path) {
    const transformedUrl = getSupabaseImageTransformUrl(
      asset.path,
      optimizedRequest
    );
    const transformedSeparator = transformedUrl.includes("?") ? "&" : "?";

    return NextResponse.redirect(
      `${transformedUrl}${transformedSeparator}v=${version}`,
      {
        status: 307,
        headers: CACHE_HEADERS,
      }
    );
  }

  return NextResponse.redirect(versionedUrl, {
    status: 307,
    headers: CACHE_HEADERS,
  });
}
