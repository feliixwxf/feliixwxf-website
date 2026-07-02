import { NextResponse } from "next/server";
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
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function unauthorized() {
  return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
}

function safeFileName(name) {
  const extension = name.includes(".") ? name.split(".").pop() : "jpg";

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${String(extension || "jpg").toLowerCase()}`;
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
    assets: Object.fromEntries(rows.map((asset) => [asset.key, asset])),
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
      { error: "Das Bild darf maximal 10 MB gross sein." },
      { status: 400 }
    );
  }

  const path = `site-assets/${key}/${safeFileName(file.name)}`;
  const bytes = await file.arrayBuffer();

  const uploadResponse = await fetch(
    `${supabaseRestUrl}/storage/v1/object/${storageBucket}/${path}`,
    {
      method: "POST",
      headers: {
        apikey: supabaseServiceHeaders.apikey,
        Authorization: supabaseServiceHeaders.Authorization,
        "Cache-Control": "31536000",
        "Content-Type": file.type || "image/jpeg",
        "x-upsert": "false",
      },
      body: bytes,
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
  return NextResponse.json({ asset });
}
