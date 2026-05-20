import { NextResponse } from "next/server";
import {
  supabaseBaseUrl,
  supabaseServiceHeaders,
} from "../../_lib/supabase";
import {
  accountConfigMissing,
  applyCustomerSessionCookies,
  getCustomerSession,
  requireAccountConfig,
} from "../_lib/auth";

const GALLERY_SELECT =
  "id,title,client_name,client_email,access_code,is_active,downloads_enabled,status,expires_at,created_at";
const LINK_GALLERY_SELECT =
  "id,title,client_email,access_code,is_active,status,expires_at";

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 32);
}

function countByGalleryId(items) {
  return items.reduce((counts, item) => {
    counts[item.gallery_id] = (counts[item.gallery_id] || 0) + 1;
    return counts;
  }, {});
}

export async function GET(request) {
  if (!requireAccountConfig()) return accountConfigMissing();

  const customerSession = await getCustomerSession(request);
  const user = customerSession.user;

  if (!user?.email) {
    const response = NextResponse.json(
      { error: "Bitte zuerst einloggen." },
      { status: 401 }
    );
    return applyCustomerSessionCookies(response, customerSession);
  }

  const response = await fetch(
    `${supabaseBaseUrl}/rest/v1/client_galleries?select=${GALLERY_SELECT}&client_email=ilike.${encodeURIComponent(
      user.email.toLowerCase()
    )}&order=created_at.desc&limit=50`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const result = NextResponse.json(
      {
        error:
          "Galerien konnten nicht geladen werden. Ist die Kunden-E-Mail-Spalte in Supabase angelegt?",
        details: await response.text(),
      },
      { status: 500 }
    );
    return applyCustomerSessionCookies(result, customerSession);
  }

  const galleries = await response.json();
  const visibleGalleries = galleries.filter(
    (gallery) => gallery.is_active !== false && gallery.status !== "paused"
  );

  if (visibleGalleries.length === 0) {
    const result = NextResponse.json({ galleries: [] });
    return applyCustomerSessionCookies(result, customerSession);
  }

  const galleryIdFilter = visibleGalleries
    .map((gallery) => encodeURIComponent(gallery.id))
    .join(",");

  const [imagesResponse, favoritesResponse] = await Promise.all([
    fetch(
      `${supabaseBaseUrl}/rest/v1/client_gallery_images?select=gallery_id&gallery_id=in.(${galleryIdFilter})`,
      {
        headers: supabaseServiceHeaders,
        cache: "no-store",
      }
    ),
    fetch(
      `${supabaseBaseUrl}/rest/v1/client_favorites?select=gallery_id&gallery_id=in.(${galleryIdFilter})`,
      {
        headers: supabaseServiceHeaders,
        cache: "no-store",
      }
    ),
  ]);

  const imageCounts = imagesResponse.ok
    ? countByGalleryId(await imagesResponse.json())
    : {};
  const favoriteCounts = favoritesResponse.ok
    ? countByGalleryId(await favoritesResponse.json())
    : {};

  const result = NextResponse.json({
    galleries: visibleGalleries.map((gallery) => ({
      ...gallery,
      image_count: imageCounts[gallery.id] || 0,
      favorite_count: favoriteCounts[gallery.id] || 0,
    })),
  });

  return applyCustomerSessionCookies(result, customerSession);
}

export async function POST(request) {
  if (!requireAccountConfig()) return accountConfigMissing();

  const customerSession = await getCustomerSession(request);
  const user = customerSession.user;

  if (!user?.email) {
    const response = NextResponse.json(
      { error: "Bitte zuerst einloggen." },
      { status: 401 }
    );
    return applyCustomerSessionCookies(response, customerSession);
  }

  const body = await request.json().catch(() => ({}));
  const code = normalizeCode(body.accessCode);
  const email = user.email.toLowerCase();

  if (!code) {
    const response = NextResponse.json(
      { error: "Galerie-Code fehlt." },
      { status: 400 }
    );
    return applyCustomerSessionCookies(response, customerSession);
  }

  const galleryResponse = await fetch(
    `${supabaseBaseUrl}/rest/v1/client_galleries?select=${LINK_GALLERY_SELECT}&access_code=eq.${encodeURIComponent(
      code
    )}&limit=1`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (!galleryResponse.ok) {
    const response = NextResponse.json(
      { error: "Galerie konnte nicht geprüft werden." },
      { status: 500 }
    );
    return applyCustomerSessionCookies(response, customerSession);
  }

  const [gallery] = await galleryResponse.json();

  if (!gallery || gallery.is_active === false || gallery.status === "paused") {
    const response = NextResponse.json(
      { error: "Galerie-Code wurde nicht gefunden oder ist nicht aktiv." },
      { status: 404 }
    );
    return applyCustomerSessionCookies(response, customerSession);
  }

  if (gallery.expires_at && new Date(gallery.expires_at) <= new Date()) {
    const response = NextResponse.json(
      { error: "Diese Galerie ist abgelaufen." },
      { status: 410 }
    );
    return applyCustomerSessionCookies(response, customerSession);
  }

  const existingEmail = String(gallery.client_email || "").trim().toLowerCase();

  if (existingEmail && existingEmail !== email) {
    const response = NextResponse.json(
      {
        error:
          "Diese Galerie ist bereits mit einer anderen Kunden-E-Mail verknüpft.",
      },
      { status: 409 }
    );
    return applyCustomerSessionCookies(response, customerSession);
  }

  if (existingEmail === email) {
    const response = NextResponse.json({
      gallery,
      linked: false,
      alreadyLinked: true,
    });
    return applyCustomerSessionCookies(response, customerSession);
  }

  const updateResponse = await fetch(
    `${supabaseBaseUrl}/rest/v1/client_galleries?id=eq.${encodeURIComponent(
      gallery.id
    )}`,
    {
      method: "PATCH",
      headers: {
        ...supabaseServiceHeaders,
        Prefer: "return=representation",
      },
      body: JSON.stringify({ client_email: email }),
    }
  );

  if (!updateResponse.ok) {
    const response = NextResponse.json(
      { error: "Galerie konnte nicht mit deinem Konto verknüpft werden." },
      { status: 500 }
    );
    return applyCustomerSessionCookies(response, customerSession);
  }

  const [updatedGallery] = await updateResponse.json();
  const response = NextResponse.json({
    gallery: updatedGallery,
    linked: true,
    alreadyLinked: false,
  });

  return applyCustomerSessionCookies(response, customerSession);
}
