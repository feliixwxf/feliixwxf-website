import { NextResponse } from "next/server";
import {
  hasSupabaseConfig,
  supabaseBaseUrl,
  supabaseServiceHeaders,
} from "../../_lib/supabase";
import {
  createWatermarkedClientImage,
  downloadClientGalleryStorageObject,
  isDownloadWatermarkEnabled,
} from "../../_lib/storage";

export const runtime = "nodejs";

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 32);
}

function sanitizeFilename(value, fallback = "feliixwxf-bild") {
  const cleaned = String(value || "")
    .trim()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

  return cleaned || fallback;
}

function getExtension(value, fallback = "jpg") {
  const match = String(value || "").match(/\.([a-zA-Z0-9]{2,5})(?:\?|$)/);
  return match ? match[1].toLowerCase() : fallback;
}

export async function GET(request) {
  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Kundengalerien sind noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const code = normalizeCode(searchParams.get("code"));
  const imageId = String(searchParams.get("image") || "").trim();

  if (!code || !imageId) {
    return NextResponse.json(
      { error: "Download-Link ist unvollständig." },
      { status: 400 }
    );
  }

  const galleryResponse = await fetch(
    `${supabaseBaseUrl}/rest/v1/client_galleries?select=id,access_code,is_active,downloads_enabled,status,client_name,expires_at&access_code=eq.${encodeURIComponent(
      code
    )}&limit=1`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (!galleryResponse.ok) {
    return NextResponse.json(
      { error: "Galerie konnte nicht geprüft werden." },
      { status: 500 }
    );
  }

  const [gallery] = await galleryResponse.json();

  if (!gallery || gallery.is_active === false || gallery.status === "paused") {
    return NextResponse.json(
      { error: "Galerie wurde nicht gefunden oder ist nicht aktiv." },
      { status: 404 }
    );
  }

  if (gallery.expires_at && new Date(gallery.expires_at) <= new Date()) {
    return NextResponse.json(
      { error: "Diese Galerie ist abgelaufen." },
      { status: 410 }
    );
  }

  if (!gallery.downloads_enabled) {
    return NextResponse.json(
      { error: "Downloads sind für diese Galerie nicht freigegeben." },
      { status: 403 }
    );
  }

  const imageResponse = await fetch(
    `${supabaseBaseUrl}/rest/v1/client_gallery_images?select=id,gallery_id,path,url,filename&id=eq.${encodeURIComponent(
      imageId
    )}&gallery_id=eq.${encodeURIComponent(gallery.id)}&limit=1`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (!imageResponse.ok) {
    return NextResponse.json(
      { error: "Bild konnte nicht geprüft werden." },
      { status: 500 }
    );
  }

  const [image] = await imageResponse.json();

  if (!image) {
    return NextResponse.json(
      { error: "Bild wurde nicht gefunden." },
      { status: 404 }
    );
  }

  const original = await downloadClientGalleryStorageObject(image.path, image.url);

  if (!original) {
    return NextResponse.json(
      { error: "Bild konnte nicht geladen werden." },
      { status: 500 }
    );
  }

  const watermarkEnabled = await isDownloadWatermarkEnabled();
  const body = watermarkEnabled
    ? await createWatermarkedClientImage(original, "feliix.wxf")
    : original;
  const baseName = sanitizeFilename(image.filename || image.path);
  const extension = watermarkEnabled
    ? "jpg"
    : getExtension(image.filename || image.path || image.url);
  const filename = `${baseName}${watermarkEnabled ? "-feliixwxf" : ""}.${extension}`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": watermarkEnabled ? "image/jpeg" : "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
