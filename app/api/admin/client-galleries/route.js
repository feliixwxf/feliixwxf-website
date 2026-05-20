import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../_lib/auth";
import {
  hasSupabaseConfig,
  storageBucket,
  supabaseRestUrl,
  supabaseServiceHeaders,
} from "../_lib/supabase";

const GALLERY_SELECT =
  "id,title,client_name,client_email,access_code,is_active,downloads_enabled,status,internal_note,favorites_reviewed,finals_exported,archive_prepared,client_informed,expires_at,created_at";
const LEGACY_GALLERY_SELECT =
  "id,title,client_name,access_code,is_active,downloads_enabled,expires_at,created_at";
const IMAGE_SELECT =
  "id,gallery_id,url,path,filename,sort_order,created_at";
const VALID_STATUSES = new Set(["active", "paused", "completed"]);

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

async function loadCustomerAccountEmails() {
  try {
    const response = await fetch(
      `${supabaseRestUrl}/auth/v1/admin/users?per_page=1000`,
      {
        headers: supabaseServiceHeaders,
        cache: "no-store",
      }
    );

    if (!response.ok) return new Set();

    const data = await response.json();
    const users = Array.isArray(data.users) ? data.users : [];

    return new Set(
      users
        .map((user) => String(user.email || "").trim().toLowerCase())
        .filter(Boolean)
    );
  } catch {
    return new Set();
  }
}

async function loadGalleries() {
  let galleryResponse = await fetch(
    `${supabaseRestUrl}/rest/v1/client_galleries?select=${GALLERY_SELECT}&order=created_at.desc&limit=100`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );
  if (!galleryResponse.ok) {
    const details = await galleryResponse.text();

    const normalizedDetails = details.toLowerCase();

    if (
      normalizedDetails.includes("status") ||
      normalizedDetails.includes("internal_note") ||
      normalizedDetails.includes("client_email") ||
      normalizedDetails.includes("favorites_reviewed") ||
      normalizedDetails.includes("finals_exported") ||
      normalizedDetails.includes("archive_prepared") ||
      normalizedDetails.includes("client_informed")
    ) {
      galleryResponse = await fetch(
        `${supabaseRestUrl}/rest/v1/client_galleries?select=${LEGACY_GALLERY_SELECT}&order=created_at.desc&limit=100`,
        {
          headers: supabaseServiceHeaders,
          cache: "no-store",
        }
      );
    } else {
      return { error: details };
    }
  }

  const [finalGalleryResponse, imageResponse, favoriteResponse] = await Promise.all([
    galleryResponse,
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

  if (!finalGalleryResponse.ok) {
    return { error: await finalGalleryResponse.text() };
  }

  if (!imageResponse.ok) {
    return { error: await imageResponse.text() };
  }

  if (!favoriteResponse.ok) {
    return { error: await favoriteResponse.text() };
  }

  const galleries = await finalGalleryResponse.json();
  const images = await imageResponse.json();
  const favorites = await favoriteResponse.json();
  const customerAccountEmails = await loadCustomerAccountEmails();

  return {
    galleries: galleries.map((gallery) => {
      const galleryImages = images.filter(
        (image) => image.gallery_id === gallery.id
      );
      const galleryFavorites = favorites.filter(
        (favorite) => favorite.gallery_id === gallery.id
      );
      const clientEmail = String(gallery.client_email || "").trim().toLowerCase();
      const favoriteLastAt = galleryFavorites.reduce((latest, favorite) => {
        if (!favorite.created_at) return latest;
        if (!latest) return favorite.created_at;

        return new Date(favorite.created_at) > new Date(latest)
          ? favorite.created_at
          : latest;
      }, "");

      return {
        ...gallery,
        images: galleryImages,
        favorites: galleryFavorites,
        image_count: galleryImages.length,
        favorite_count: galleryFavorites.length,
        favorite_last_at: favoriteLastAt,
        account_exists: clientEmail
          ? customerAccountEmails.has(clientEmail)
          : false,
        account_status: clientEmail
          ? customerAccountEmails.has(clientEmail)
            ? "linked"
            : "email_set"
          : "missing_email",
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
  const clientEmail = String(body.client_email || "")
    .trim()
    .toLowerCase()
    .slice(0, 160);
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
      ...(clientEmail ? { client_email: clientEmail } : {}),
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
  if ("client_email" in body) {
    update.client_email =
      String(body.client_email || "").trim().toLowerCase().slice(0, 160) ||
      null;
  }
  if ("access_code" in body) update.access_code = normalizeCode(body.access_code);
  if ("is_active" in body) update.is_active = Boolean(body.is_active);
  if ("status" in body) {
    const status = String(body.status || "").trim();

    if (!VALID_STATUSES.has(status)) {
      return NextResponse.json(
        { error: "Ungültiger Galerie-Status." },
        { status: 400 }
      );
    }

    update.status = status;
  }
  if ("downloads_enabled" in body) {
    update.downloads_enabled = Boolean(body.downloads_enabled);
  }
  if ("internal_note" in body) {
    update.internal_note = String(body.internal_note || "").trim().slice(0, 2000);
  }
  if ("favorites_reviewed" in body) {
    update.favorites_reviewed = Boolean(body.favorites_reviewed);
  }
  if ("finals_exported" in body) {
    update.finals_exported = Boolean(body.finals_exported);
  }
  if ("archive_prepared" in body) {
    update.archive_prepared = Boolean(body.archive_prepared);
  }
  if ("client_informed" in body) {
    update.client_informed = Boolean(body.client_informed);
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
    )}`,
    {
      method: "PATCH",
      headers: {
        ...supabaseServiceHeaders,
        Prefer: "return=minimal",
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

  return NextResponse.json({ gallery: { id, ...update } });
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
      { error: "Kundengalerie konnte nicht gelöscht werden.", details },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
