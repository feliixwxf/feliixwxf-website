import { NextResponse } from "next/server";
import {
  hasSupabaseConfig,
  supabaseBaseUrl,
  supabaseServiceHeaders,
} from "../../_lib/supabase";

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 32);
}

async function loadGalleryByCode(code) {
  const response = await fetch(
    `${supabaseBaseUrl}/rest/v1/client_galleries?select=id,expires_at&access_code=eq.${encodeURIComponent(
      code
    )}&is_active=eq.true&limit=1`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (!response.ok) return null;

  const [gallery] = await response.json();

  if (!gallery) return null;
  if (gallery.expires_at && new Date(gallery.expires_at) <= new Date()) {
    return null;
  }

  return gallery;
}

export async function POST(request) {
  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Kundengalerien sind noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const { accessCode, imageId, favorite } = await request.json();
  const code = normalizeCode(accessCode);

  if (!code || !imageId) {
    return NextResponse.json(
      { error: "Galerie-Code oder Bild-ID fehlt." },
      { status: 400 }
    );
  }

  const gallery = await loadGalleryByCode(code);

  if (!gallery) {
    return NextResponse.json(
      { error: "Galerie-Code wurde nicht gefunden oder ist nicht aktiv." },
      { status: 404 }
    );
  }

  const imageResponse = await fetch(
    `${supabaseBaseUrl}/rest/v1/client_gallery_images?select=id&gallery_id=eq.${encodeURIComponent(
      gallery.id
    )}&id=eq.${encodeURIComponent(imageId)}&limit=1`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (!imageResponse.ok) {
    return NextResponse.json(
      { error: "Bild konnte nicht geprueft werden." },
      { status: 500 }
    );
  }

  const [image] = await imageResponse.json();

  if (!image) {
    return NextResponse.json(
      { error: "Bild gehoert nicht zu dieser Galerie." },
      { status: 400 }
    );
  }

  if (favorite) {
    const response = await fetch(`${supabaseBaseUrl}/rest/v1/client_favorites`, {
      method: "POST",
      headers: {
        ...supabaseServiceHeaders,
        Prefer: "resolution=ignore-duplicates,return=representation",
      },
      body: JSON.stringify({
        gallery_id: gallery.id,
        image_id: imageId,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Favorit konnte nicht gespeichert werden." },
        { status: 500 }
      );
    }
  } else {
    const response = await fetch(
      `${supabaseBaseUrl}/rest/v1/client_favorites?gallery_id=eq.${encodeURIComponent(
        gallery.id
      )}&image_id=eq.${encodeURIComponent(imageId)}`,
      {
        method: "DELETE",
        headers: {
          ...supabaseServiceHeaders,
          Prefer: "return=minimal",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Favorit konnte nicht entfernt werden." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true });
}
