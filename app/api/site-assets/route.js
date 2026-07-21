import { NextResponse } from "next/server";
import {
  hasSupabaseConfig,
  supabaseBaseUrl,
  supabaseHeaders,
} from "../_lib/supabase";

function withVersion(asset) {
  if (!asset?.url) return asset;

  const version = asset.updated_at
    ? new Date(asset.updated_at).getTime()
    : Date.now();
  const separator = asset.url.includes("?") ? "&" : "?";

  return {
    ...asset,
    url: `${asset.url}${separator}v=${version}`,
  };
}

const publicCacheHeaders = {
  "Cache-Control": "no-store, max-age=0",
};

export async function GET() {
  try {
    if (!hasSupabaseConfig) {
      return NextResponse.json({ assets: {} }, { headers: publicCacheHeaders });
    }

    const response = await fetch(
      `${supabaseBaseUrl}/rest/v1/site_assets?select=key,url,path,updated_at`,
      {
        headers: supabaseHeaders,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const details = await response.text();
      console.error("Could not load site assets:", details);
      return NextResponse.json(
        { assets: {} },
        { status: 200, headers: publicCacheHeaders }
      );
    }

    const rows = await response.json();
    const assets = Object.fromEntries(
      rows.map((asset) => [asset.key, withVersion(asset)])
    );

    return NextResponse.json({ assets }, { headers: publicCacheHeaders });
  } catch (error) {
    console.error("Site asset GET failed:", error);
    return NextResponse.json(
      { assets: {} },
      { status: 200, headers: publicCacheHeaders }
    );
  }
}
