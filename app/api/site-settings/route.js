import { NextResponse } from "next/server";
import {
  hasSupabaseConfig,
  supabaseBaseUrl,
  supabaseHeaders,
} from "../_lib/supabase";

export async function GET() {
  try {
    if (!hasSupabaseConfig) {
      return NextResponse.json({ settings: {} });
    }

    const response = await fetch(
      `${supabaseBaseUrl}/rest/v1/site_settings?select=key,value,updated_at`,
      {
        headers: supabaseHeaders,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const details = await response.text();
      console.error("Could not load site settings:", details);
      return NextResponse.json({ settings: {} }, { status: 200 });
    }

    const rows = await response.json();
    const settings = Object.fromEntries(
      rows.map((setting) => [setting.key, setting.value])
    );

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Site settings GET failed:", error);
    return NextResponse.json({ settings: {} }, { status: 200 });
  }
}
