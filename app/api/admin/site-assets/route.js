import { NextResponse } from "next/server";
import sharp from "sharp";
import { isAdminAuthenticated } from "../_lib/auth";
import {
  hasSupabaseConfig,
  storageBucket,
  supabaseRestUrl,
  supabaseServiceHeaders,
} from "../_lib/supabase";

const ASSET_KEYS = new Set([
  "hero_before",
  "hero_after",
  "cover_car",
  "cover_portrait",
  "cover_nature",
  "cover_event",
  "info_image",
]);
const MAX_FILE_SIZE = 30 * 1024 * 1024;
const COMPRESSED_ASSET_QUALITY = 88;
const SITE_ASSET_SIZES = {
  hero_before: { width: 1400, height: 1750 },
  hero_after: { width: 1400, height: 1750 },
  cover_car: { width: 1200, height: 1600 },
  cover_portrait: { width: 1200, height: 1600 },
  cover_nature: { width: 1200, height: 1600 },
  cover_event: { width: 1200, height: 1600 },
  info_image: { width: 1200, height: 1500 },
};

function unauthorized() {
  return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
}

function safeFileName(name) {
  const baseName = name.includes(".")
    ? name.split(".").slice(0, -1).join(".")
    : name;
  const cleanedBaseName =
    baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "titelbild";

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}-${cleanedBaseName}.webp`;
}

async function compressSiteAsset(file, key) {
  const input = Buffer.from(await file.arrayBuffer());
  const size = SITE_ASSET_SIZES[key] || { width: 1400, height: 1800 };

  return sharp(input, { failOn: "none" })
    .rotate()
    .resize({
      ...size,
      fit: "cover",
      withoutEnlargement: true,
    })
    .webp({ quality: COMPRESSED_ASSET_QUALITY })
    .toBuffer();
}

function withVersion(asset) {
  if (!asset?.url) return asset;

  const version = asset.updated_at
    ? new Date(asset.updated_at).getTime()
    : Date.now();
  const separator = asset.url.includes("?") ? "&" : "?";

  return {
    ...asset,
    url: `${asset.url}${separator}v=${version}`,
  };
}

async function loadAssets() {
  const response = await fetch(
    `${supabaseRestUrl}/rest/v1/site_assets?select=key,url,path,updated_at`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const details = await response.text();
    return { error: details };
  }

  const rows = await response.json();

  return {
    assets: Object.fromEntries(
      rows.map((asset) => [asset.key, withVersion(asset)])
    ),
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

  const result = await loadAssets();

  if (result.error) {
    return NextResponse.json(
      {
        error:
          "Titelbilder konnten nicht geladen werden. Fehlt die Tabelle site_assets?",
        details: result.error,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ assets: result.assets });
}

export async function POST(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Supabase ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const key = String(formData.get("key") || "");
  const file = formData.get("file");

  if (!ASSET_KEYS.has(key)) {
    return NextResponse.json(
      { error: "Ungültiges Bildfeld." },
      { status: 400 }
    );
  }

  if (!file || typeof file === "string") {
    return NextResponse.json(
      { error: "Bitte ein Bild auswählen." },
      { status: 400 }
    );
  }

  if (!String(file.type || "").startsWith("image/")) {
    return NextResponse.json(
      { error: "Nur Bilddateien sind erlaubt." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Das Bild darf maximal 30 MB gross sein." },
      { status: 400 }
    );
  }

  const path = `site-assets/${key}/${safeFileName(file.name)}`;
  let processedImage;

  try {
    processedImage = await compressSiteAsset(file, key);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Titelbild konnte nicht komprimiert werden. Bitte JPG, PNG oder WebP verwenden.",
        details: error.message,
      },
      { status: 400 }
    );
  }

  const uploadResponse = await fetch(
    `${supabaseRestUrl}/storage/v1/object/${storageBucket}/${path}`,
    {
      method: "POST",
      headers: {
        apikey: supabaseServiceHeaders.apikey,
        Authorization: supabaseServiceHeaders.Authorization,
        "Cache-Control": "31536000",
        "Content-Type": "image/webp",
        "x-upsert": "false",
      },
      body: processedImage,
    }
  );

  if (!uploadResponse.ok) {
    const details = await uploadResponse.text();
    return NextResponse.json(
      {
        error:
          "Titelbild konnte nicht hochgeladen werden. Ist der Storage Bucket angelegt?",
        details,
      },
      { status: 500 }
    );
  }

  const url = `${supabaseRestUrl}/storage/v1/object/public/${storageBucket}/${path}`;

  const upsertResponse = await fetch(`${supabaseRestUrl}/rest/v1/site_assets`, {
    method: "POST",
    headers: {
      ...supabaseServiceHeaders,
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      key,
      url,
      path,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!upsertResponse.ok) {
    const details = await upsertResponse.text();
    return NextResponse.json(
      {
        error:
          "Titelbild wurde hochgeladen, aber nicht gespeichert. Fehlt die Tabelle site_assets?",
        details,
      },
      { status: 500 }
    );
  }

  const [asset] = await upsertResponse.json();
  return NextResponse.json({ asset: withVersion(asset) });
}
