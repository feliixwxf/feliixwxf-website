import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import {
  hasSupabaseConfig,
  supabaseBaseUrl,
  supabaseServiceHeaders,
} from "../../_lib/supabase";
import {
  createWatermarkedClientImage,
  downloadPortfolioStorageObject,
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

function normalizeLocalImageSrc(value) {
  const src = String(value || "").trim();

  if (src.includes("..")) return "";
  if (src.startsWith("/api/site-assets/image/")) return src;
  if (src.startsWith("/images/") && /\.(jpe?g|png|webp)$/i.test(src)) {
    return src;
  }

  return "";
}

async function loadPortfolioImageBySrc(src, request) {
  const safeSrc = normalizeLocalImageSrc(src);
  if (!safeSrc) return null;

  if (safeSrc.startsWith("/api/site-assets/image/")) {
    try {
      const response = await fetch(new URL(safeSrc, request.url), {
        cache: "no-store",
      });

      if (!response.ok) return null;
      return Buffer.from(await response.arrayBuffer());
    } catch {
      return null;
    }
  }

  const imagePath = path.join(process.cwd(), "public", safeSrc.replace(/^\//, ""));

  try {
    return await readFile(imagePath);
  } catch {
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageId = String(searchParams.get("image") || "").trim();
  const localSrc = normalizeLocalImageSrc(searchParams.get("src"));

  if (!imageId && !localSrc) {
    return NextResponse.json(
      { error: "Download-Link ist unvollständig." },
      { status: 400 }
    );
  }

  let original = null;
  let baseName = "feliixwxf-portfolio";

  if (imageId) {
    if (!hasSupabaseConfig) {
      return NextResponse.json(
        { error: "Portfolio ist noch nicht konfiguriert." },
        { status: 503 }
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

    original = await downloadPortfolioStorageObject(image.path, image.url);
    baseName = sanitizeFilename(image.title || image.path || image.id);
  } else {
    original = await loadPortfolioImageBySrc(localSrc, request);
    baseName = sanitizeFilename(localSrc);
  }

  if (!original) {
    return NextResponse.json(
      { error: "Portfolio-Bild konnte nicht geladen werden." },
      { status: 500 }
    );
  }

  const body = await createWatermarkedClientImage(original, "feliix.wxf");
  const filename = `${baseName}-feliixwxf.jpg`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
