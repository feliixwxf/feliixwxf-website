import { NextResponse } from "next/server";
import {
  hasSupabaseConfig,
  supabaseBaseUrl,
  supabaseServiceHeaders,
} from "../_lib/supabase";

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 32);
}

export async function POST(request) {
  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Kundengalerien sind noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const { accessCode } = await request.json();
  const code = normalizeCode(accessCode);

  if (!code) {
    return NextResponse.json(
      { error: "Bitte Galerie-Code eingeben." },
      { status: 400 }
    );
  }

  const galleryResponse = await fetch(
    `${supabaseBaseUrl}/rest/v1/client_galleries?select=id,title,client_name,access_code,downloads_enabled,expires_at,created_at&access_code=eq.${encodeURIComponent(
      code
    )}&is_active=eq.true&limit=1`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (!galleryResponse.ok) {
    return NextResponse.json(
      { error: "Galerie konnte nicht geladen werden." },
      { status: 500 }
    );
  }

  const [gallery] = await galleryResponse.json();

  if (!gallery) {
    return NextResponse.json(
      { error: "Galerie-Code wurde nicht gefunden oder ist nicht aktiv." },
      { status: 404 }
    );
  }

  if (gallery.expires_at && new Date(gallery.expires_at) <= new Date()) {
    return NextResponse.json(
      { error: "Diese Galerie ist abgelaufen." },
      { status: 410 }
    );
  }

  const [imageResponse, favoriteResponse] = await Promise.all([
    fetch(
      `${supabaseBaseUrl}/rest/v1/client_gallery_images?select=id,gallery_id,url,filename,sort_order,created_at&gallery_id=eq.${encodeURIComponent(
        gallery.id
      )}&order=sort_order.asc&order=created_at.desc`,
      {
        headers: supabaseServiceHeaders,
        cache: "no-store",
      }
    ),
    fetch(
      `${supabaseBaseUrl}/rest/v1/client_favorites?select=image_id,created_at&gallery_id=eq.${encodeURIComponent(
        gallery.id
      )}`,
      {
        headers: supabaseServiceHeaders,
        cache: "no-store",
      }
    ),
  ]);

  if (!imageResponse.ok || !favoriteResponse.ok) {
    return NextResponse.json(
      { error: "Galerie-Bilder konnten nicht geladen werden." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    gallery,
    images: await imageResponse.json(),
    favorites: await favoriteResponse.json(),
  });
}
