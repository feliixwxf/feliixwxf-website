import { NextResponse } from "next/server";
import {
  hasSupabaseConfig,
  supabaseBaseUrl,
  supabaseHeaders,
} from "../_lib/supabase";

const publicCacheHeaders = {
  "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
};

export async function GET() {
  try {
    if (!hasSupabaseConfig) {
      return NextResponse.json(
        { settings: {} },
        { headers: publicCacheHeaders }
      );
    }

    const response = await fetch(
      `${supabaseBaseUrl}/rest/v1/site_settings?select=key,value,updated_at`,
      {
        headers: supabaseHeaders,
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      const details = await response.text();
      console.error("Could not load site settings:", details);
      return NextResponse.json(
        { settings: {} },
        { status: 200, headers: publicCacheHeaders }
      );
    }

    const rows = await response.json();
    const settings = Object.fromEntries(
      rows.map((setting) => [setting.key, setting.value])
    );

    return NextResponse.json({ settings }, { headers: publicCacheHeaders });
  } catch (error) {
    console.error("Site settings GET failed:", error);
    return NextResponse.json(
      { settings: {} },
      { status: 200, headers: publicCacheHeaders }
    );
  }
}
