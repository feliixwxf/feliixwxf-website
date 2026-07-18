import { NextResponse } from "next/server";
import {
  hasSupabaseConfig,
  supabaseBaseUrl,
  supabaseServiceHeaders,
} from "../../_lib/supabase";
import {
  createWatermarkedClientImage,
  downloadPortfolioStorageObject,
  isDownloadWatermarkEnabled,
} from "../../_lib/storage";

export const runtime = "nodejs";

function sanitizeFilename(value, fallback = "feliixwxf-portfolio") {
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
      { error: "Portfolio ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const imageId = String(searchParams.get("image") || "").trim();

  if (!imageId) {
    return NextResponse.json(
      { error: "Download-Link ist unvollständig." },
      { status: 400 }
    );
  }

  const imageResponse = await fetch(
    `${supabaseBaseUrl}/rest/v1/portfolio_images?select=id,path,url,title&id=eq.${encodeURIComponent(
      imageId
    )}&limit=1`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (!imageResponse.ok) {
    return NextResponse.json(
      { error: "Portfolio-Bild konnte nicht geprüft werden." },
      { status: 500 }
    );
  }

  const [image] = await imageResponse.json();

  if (!image) {
    return NextResponse.json(
      { error: "Portfolio-Bild wurde nicht gefunden." },
      { status: 404 }
    );
  }

  const original = await downloadPortfolioStorageObject(image.path, image.url);

  if (!original) {
    return NextResponse.json(
      { error: "Portfolio-Bild konnte nicht geladen werden." },
      { status: 500 }
    );
  }

  const watermarkEnabled = await isDownloadWatermarkEnabled();
  const body = watermarkEnabled
    ? await createWatermarkedClientImage(original, "feliix.wxf")
    : original;
  const baseName = sanitizeFilename(image.title || image.path || image.id);
  const extension = watermarkEnabled ? "jpg" : getExtension(image.path || image.url);
  const filename = `${baseName}${watermarkEnabled ? "-feliixwxf" : ""}.${extension}`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": watermarkEnabled ? "image/jpeg" : "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
