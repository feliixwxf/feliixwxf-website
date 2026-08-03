import { NextResponse } from "next/server";
import {
  hasSupabaseConfig,
  supabaseBaseUrl,
  supabaseServiceHeaders,
} from "../_lib/supabase";
import {
  createSignedArchiveUrl,
  getClientGalleryArchivePath,
  withSignedImageUrls,
} from "../_lib/storage";
import {
  CLIENT_GALLERY_SESSION_COOKIE,
  clientGallerySessionCookieOptions,
  createClientGallerySession,
} from "../_lib/gallery-session";

const GALLERY_SELECT =
  "id,title,client_name,access_code,downloads_enabled,status,cover_image_id,welcome_message,archive_path,archive_size,archive_created_at,expires_at,created_at";
const LEGACY_GALLERY_SELECT =
  "id,title,client_name,access_code,downloads_enabled,welcome_message,expires_at,created_at";
const CODE_ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILED_CODE_ATTEMPTS = 8;
const codeAttempts = new Map();

function getClientKey(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function getAttemptState(key) {
  const now = Date.now();
  const current = codeAttempts.get(key);

  if (!current || current.resetAt <= now) {
    return { count: 0, resetAt: now + CODE_ATTEMPT_WINDOW_MS };
  }

  return current;
}

function rememberFailedAttempt(key) {
  const current = getAttemptState(key);
  codeAttempts.set(key, {
    count: current.count + 1,
    resetAt: current.resetAt,
  });
}

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
  const clientKey = getClientKey(request);
  const attemptState = getAttemptState(clientKey);

  if (!code) {
    return NextResponse.json(
      { error: "Bitte Galerie-Code eingeben." },
      { status: 400 }
    );
  }

  if (attemptState.count >= MAX_FAILED_CODE_ATTEMPTS) {
    return NextResponse.json(
      {
        error:
          "Zu viele falsche Code-Versuche. Bitte warte ein paar Minuten und versuche es erneut.",
      },
      { status: 429 }
    );
  }

  let galleryResponse = await fetch(
    `${supabaseBaseUrl}/rest/v1/client_galleries?select=${GALLERY_SELECT}&access_code=eq.${encodeURIComponent(
      code
    )}&is_active=eq.true&limit=1`,
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
      normalizedDetails.includes("cover_image_id") ||
      normalizedDetails.includes("archive_path") ||
      normalizedDetails.includes("archive_size") ||
      normalizedDetails.includes("archive_created")
    ) {
      galleryResponse = await fetch(
        `${supabaseBaseUrl}/rest/v1/client_galleries?select=${LEGACY_GALLERY_SELECT}&access_code=eq.${encodeURIComponent(
          code
        )}&is_active=eq.true&limit=1`,
        {
          headers: supabaseServiceHeaders,
          cache: "no-store",
        }
      );
    }

    if (!galleryResponse.ok) {
      return NextResponse.json(
        { error: "Galerie konnte nicht geladen werden." },
        { status: 500 }
      );
    }
  }

  const [gallery] = await galleryResponse.json();

  if (!gallery) {
    rememberFailedAttempt(clientKey);
    return NextResponse.json(
      { error: "Galerie-Code wurde nicht gefunden oder ist nicht aktiv." },
      { status: 404 }
    );
  }

  if (gallery.expires_at && new Date(gallery.expires_at) <= new Date()) {
    rememberFailedAttempt(clientKey);
    return NextResponse.json(
      { error: "Diese Galerie ist abgelaufen." },
      { status: 410 }
    );
  }

  const [imageResponse, favoriteResponse] = await Promise.all([
    fetch(
      `${supabaseBaseUrl}/rest/v1/client_gallery_images?select=id,gallery_id,url,path,filename,sort_order,created_at&gallery_id=eq.${encodeURIComponent(
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

  const images = await withSignedImageUrls(await imageResponse.json());
  const coverImage =
    images.find((image) => image.id === gallery.cover_image_id) || images[0];
  const archivePath =
    gallery.status === "completed" ? getClientGalleryArchivePath(gallery) : "";

  const response = NextResponse.json({
    gallery: {
      ...gallery,
      cover_url: coverImage?.url || "",
      archive_download_url:
        gallery.status === "completed" && archivePath
          ? await createSignedArchiveUrl(archivePath)
          : "",
    },
    images,
    favorites: await favoriteResponse.json(),
  });

  const session = createClientGallerySession(gallery.id);
  if (session) {
    response.cookies.set(
      CLIENT_GALLERY_SESSION_COOKIE,
      session,
      clientGallerySessionCookieOptions
    );
  }

  codeAttempts.delete(clientKey);
  return response;
}
