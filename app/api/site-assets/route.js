import { NextResponse } from "next/server";
import {
  hasSupabaseConfig,
  supabaseBaseUrl,
  supabaseHeaders,
} from "../_lib/supabase";

export async function GET() {
  try {
    if (!hasSupabaseConfig) {
      return NextResponse.json({ assets: {} });
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
      return NextResponse.json({ assets: {} }, { status: 200 });
    }

    const rows = await response.json();
    const assets = Object.fromEntries(rows.map((asset) => [asset.key, asset]));

    return NextResponse.json({ assets });
  } catch (error) {
    console.error("Site asset GET failed:", error);
    return NextResponse.json({ assets: {} }, { status: 200 });
  }
}
