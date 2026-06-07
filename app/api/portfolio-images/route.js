import { NextResponse } from "next/server";
import {
  hasSupabaseConfig,
  supabaseBaseUrl,
  supabaseHeaders,
} from "../_lib/supabase";

export async function GET() {
  try {
    if (!hasSupabaseConfig) {
      return NextResponse.json({ images: [] });
    }

    let response = await fetch(
      `${supabaseBaseUrl}/rest/v1/portfolio_images?select=id,category,url,path,sort_order,created_at,width,height&order=sort_order.asc&order=created_at.desc&limit=200`,
      {
        headers: supabaseHeaders,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      response = await fetch(
        `${supabaseBaseUrl}/rest/v1/portfolio_images?select=id,category,url,path,sort_order,created_at&order=sort_order.asc&order=created_at.desc&limit=200`,
        {
          headers: supabaseHeaders,
          cache: "no-store",
        }
      );
    }

    if (!response.ok) {
      const details = await response.text();
      console.error("Could not load portfolio images:", details);
      return NextResponse.json({ images: [] }, { status: 200 });
    }

    return NextResponse.json({ images: await response.json() });
  } catch (error) {
    console.error("Portfolio image GET failed:", error);
    return NextResponse.json({ images: [] }, { status: 200 });
  }
}
