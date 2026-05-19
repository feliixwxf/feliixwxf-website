import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../_lib/auth";
import {
  hasSupabaseConfig,
  storageBucket,
  supabaseRestUrl,
  supabaseServiceHeaders,
} from "../_lib/supabase";

const GALLERY_SELECT =
  "id,title,client_name,access_code,is_active,downloads_enabled,expires_at,created_at";
const IMAGE_SELECT =
  "id,gallery_id,url,path,filename,sort_order,created_at";

function unauthorized() {
  return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
}

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 32);
}

function createCode() {
  return `GAL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function loadGalleries() {
  const [galleryResponse, imageResponse, favoriteResponse] = await Promise.all([
    fetch(
      `${supabaseRestUrl}/rest/v1/client_galleries?select=${GALLERY_SELECT}&order=created_at.desc&limit=100`,
      {
        headers: supabaseServiceHeaders,
        cache: "no-store",
      }
    ),
    fetch(
      `${supabaseRestUrl}/rest/v1/client_gallery_images?select=${IMAGE_SELECT}&order=sort_order.asc&order=created_at.desc&limit=500`,
      {
        headers: supabaseServiceHeaders,
        cache: "no-store",
      }
    ),
    fetch(
      `${supabaseRestUrl}/rest/v1/client_favorites?select=id,gallery_id,image_id,created_at&limit=1000`,
      {
        headers: supabaseServiceHeaders,
        cache: "no-store",
      }
    ),
  ]);

  if (!galleryResponse.ok) {
    return { error: await galleryResponse.text() };
  }

  if (!imageResponse.ok) {
    return { error: await imageResponse.text() };
  }

  if (!favoriteResponse.ok) {
    return { error: await favoriteResponse.text() };
  }

  const galleries = await galleryResponse.json();
  const images = await imageResponse.json();
  const favorites = await favoriteResponse.json();

  return {
    galleries: galleries.map((gallery) => {
      const galleryImages = images.filter(
        (image) => image.gallery_id === gallery.id
      );
      const galleryFavorites = favorites.filter(
        (favorite) => favorite.gallery_id === gallery.id
      );

      return {
        ...gallery,
        images: galleryImages,
        favorites: galleryFavorites,
        image_count: galleryImages.length,
        favorite_count: galleryFavorites.length,
      };
    }),
  };
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Supabase ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const result = await loadGalleries();

  if (result.error) {
    return NextResponse.json(
      {
        error:
          "Kundengalerien konnten nicht geladen werden. Fehlt supabase-client-galleries.sql?",
        details: result.error,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ galleries: result.galleries });
}

export async function POST(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Supabase ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const body = await request.json();
  const title = String(body.title || "").trim().slice(0, 100);
  const clientName = String(body.client_name || "").trim().slice(0, 100);
  const accessCode = normalizeCode(body.access_code || createCode());

  if (!title) {
    return NextResponse.json(
      { error: "Bitte einen Galerie-Titel eingeben." },
      { status: 400 }
    );
  }

  if (accessCode.length < 4) {
    return NextResponse.json(
      { error: "Der Galerie-Code muss mindestens 4 Zeichen haben." },
      { status: 400 }
    );
  }

  const response = await fetch(`${supabaseRestUrl}/rest/v1/client_galleries`, {
    method: "POST",
    headers: {
      ...supabaseServiceHeaders,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      title,
      client_name: clientName || null,
      access_code: accessCode,
      is_active: true,
      downloads_enabled: Boolean(body.downloads_enabled),
      expires_at: body.expires_at || null,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      {
        error:
          "Kundengalerie konnte nicht erstellt werden. Ist der Code vielleicht schon vergeben?",
        details,
      },
      { status: 500 }
    );
  }

  const [gallery] = await response.json();
  return NextResponse.json({ gallery: { ...gallery, images: [], favorites: [] } });
}

export async function PATCH(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Supabase ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const body = await request.json();
  const id = String(body.id || "");

  if (!id) {
    return NextResponse.json(
      { error: "Galerie-ID fehlt." },
      { status: 400 }
    );
  }

  const update = {};

  if ("title" in body) update.title = String(body.title || "").trim().slice(0, 100);
  if ("client_name" in body) {
    update.client_name = String(body.client_name || "").trim().slice(0, 100) || null;
  }
  if ("access_code" in body) update.access_code = normalizeCode(body.access_code);
  if ("is_active" in body) update.is_active = Boolean(body.is_active);
  if ("downloads_enabled" in body) {
    update.downloads_enabled = Boolean(body.downloads_enabled);
  }
  if ("expires_at" in body) update.expires_at = body.expires_at || null;

  if (update.access_code && update.access_code.length < 4) {
    return NextResponse.json(
      { error: "Der Galerie-Code muss mindestens 4 Zeichen haben." },
      { status: 400 }
    );
  }

  const response = await fetch(
    `${supabaseRestUrl}/rest/v1/client_galleries?id=eq.${encodeURIComponent(
      id
    )}&select=${GALLERY_SELECT}`,
    {
      method: "PATCH",
      headers: {
        ...supabaseServiceHeaders,
        Prefer: "return=representation",
      },
      body: JSON.stringify(update),
    }
  );

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      { error: "Kundengalerie konnte nicht gespeichert werden.", details },
      { status: 500 }
    );
  }

  const [gallery] = await response.json();
  return NextResponse.json({ gallery });
}

export async function DELETE(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Supabase ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json(
      { error: "Galerie-ID fehlt." },
      { status: 400 }
    );
  }

  const imagesResponse = await fetch(
    `${supabaseRestUrl}/rest/v1/client_gallery_images?select=path&gallery_id=eq.${encodeURIComponent(
      id
    )}`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (imagesResponse.ok) {
    const images = await imagesResponse.json();
    const paths = images.map((image) => image.path).filter(Boolean);

    if (paths.length > 0) {
      await fetch(`${supabaseRestUrl}/storage/v1/object/${storageBucket}`, {
        method: "DELETE",
        headers: supabaseServiceHeaders,
        body: JSON.stringify({ prefixes: paths }),
      });
    }
  }

  const deleteResponse = await fetch(
    `${supabaseRestUrl}/rest/v1/client_galleries?id=eq.${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: {
        ...supabaseServiceHeaders,
        Prefer: "return=minimal",
      },
    }
  );

  if (!deleteResponse.ok) {
    const details = await deleteResponse.text();
    return NextResponse.json(
      { error: "Kundengalerie konnte nicht geloescht werden.", details },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
