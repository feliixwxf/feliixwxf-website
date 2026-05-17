import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../_lib/auth";
import {
  hasSupabaseConfig,
  storageBucket,
  supabaseRestUrl,
  supabaseServiceHeaders,
} from "../_lib/supabase";

const CATEGORIES = new Set(["car", "portrait", "nature", "event"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function unauthorized() {
  return NextResponse.json(
    { error: "Nicht eingeloggt." },
    { status: 401 }
  );
}

function safeFileName(name) {
  const extension = name.includes(".") ? name.split(".").pop() : "jpg";

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${String(extension || "jpg").toLowerCase()}`;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Supabase ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const response = await fetch(
    `${supabaseRestUrl}/rest/v1/portfolio_images?select=id,category,url,path,sort_order,created_at&order=sort_order.asc&order=created_at.desc&limit=200`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      { error: "Bilder konnten nicht geladen werden.", details },
      { status: 500 }
    );
  }

  return NextResponse.json({ images: await response.json() });
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
  const category = String(formData.get("category") || "");
  const file = formData.get("file");

  if (!CATEGORIES.has(category)) {
    return NextResponse.json(
      { error: "Ungueltige Kategorie." },
      { status: 400 }
    );
  }

  if (!file || typeof file === "string") {
    return NextResponse.json(
      { error: "Bitte ein Bild auswaehlen." },
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

  const path = `${category}/${safeFileName(file.name)}`;
  const bytes = await file.arrayBuffer();
  const countResponse = await fetch(
    `${supabaseRestUrl}/rest/v1/portfolio_images?select=id&category=eq.${encodeURIComponent(
      category
    )}`,
    {
      method: "HEAD",
      headers: {
        ...supabaseServiceHeaders,
        Prefer: "count=exact",
      },
      cache: "no-store",
    }
  );
  const imageCount = Number(
    countResponse.headers.get("content-range")?.split("/")?.[1] || 0
  );

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
          "Bild konnte nicht hochgeladen werden. Ist der Storage Bucket angelegt?",
        details,
      },
      { status: 500 }
    );
  }

  const url = `${supabaseRestUrl}/storage/v1/object/public/${storageBucket}/${path}`;

  const insertResponse = await fetch(
    `${supabaseRestUrl}/rest/v1/portfolio_images`,
    {
      method: "POST",
      headers: {
        ...supabaseServiceHeaders,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        category,
        url,
        path,
        sort_order: imageCount,
      }),
    }
  );

  if (!insertResponse.ok) {
    const details = await insertResponse.text();
    return NextResponse.json(
      {
        error:
          "Bild wurde hochgeladen, aber nicht in der Galerie gespeichert. Fehlt die Tabelle portfolio_images?",
        details,
      },
      { status: 500 }
    );
  }

  const [image] = await insertResponse.json();
  return NextResponse.json({ image });
}

export async function PATCH(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Supabase ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const { orderedIds } = await request.json();

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return NextResponse.json(
      { error: "Sortierung fehlt." },
      { status: 400 }
    );
  }

  const updates = await Promise.all(
    orderedIds.map((id, index) =>
      fetch(
        `${supabaseRestUrl}/rest/v1/portfolio_images?id=eq.${encodeURIComponent(
          id
        )}`,
        {
          method: "PATCH",
          headers: {
            ...supabaseServiceHeaders,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ sort_order: index }),
        }
      )
    )
  );

  const failedUpdate = updates.find((response) => !response.ok);

  if (failedUpdate) {
    const details = await failedUpdate.text();
    return NextResponse.json(
      { error: "Sortierung konnte nicht gespeichert werden.", details },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
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
      { error: "Bild-ID fehlt." },
      { status: 400 }
    );
  }

  const rowResponse = await fetch(
    `${supabaseRestUrl}/rest/v1/portfolio_images?select=id,path&id=eq.${encodeURIComponent(
      id
    )}&limit=1`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (!rowResponse.ok) {
    const details = await rowResponse.text();
    return NextResponse.json(
      { error: "Bild konnte nicht gefunden werden.", details },
      { status: 500 }
    );
  }

  const [image] = await rowResponse.json();

  if (!image) {
    return NextResponse.json(
      { error: "Bild existiert nicht mehr." },
      { status: 404 }
    );
  }

  const storageResponse = await fetch(
    `${supabaseRestUrl}/storage/v1/object/${storageBucket}`,
    {
      method: "DELETE",
      headers: supabaseServiceHeaders,
      body: JSON.stringify({ prefixes: [image.path] }),
    }
  );

  if (!storageResponse.ok) {
    const details = await storageResponse.text();
    return NextResponse.json(
      { error: "Bilddatei konnte nicht geloescht werden.", details },
      { status: 500 }
    );
  }

  const deleteResponse = await fetch(
    `${supabaseRestUrl}/rest/v1/portfolio_images?id=eq.${encodeURIComponent(
      id
    )}`,
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
      { error: "Bildeintrag konnte nicht geloescht werden.", details },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
