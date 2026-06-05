import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../_lib/auth";
import {
  clientGalleryStorageBucket,
  hasSupabaseConfig,
  hasSupabaseServiceConfig,
  supabaseRestUrl,
  supabaseServiceHeaders,
} from "../_lib/supabase";
import {
  createSignedImageUrl,
  deleteClientGalleryStoragePaths,
} from "../../_lib/storage";

const MAX_FILE_SIZE = 15 * 1024 * 1024;

function unauthorized() {
  return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
}

function safeFileName(name) {
  const extension = name.includes(".") ? name.split(".").pop() : "jpg";

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${String(extension || "jpg").toLowerCase()}`;
}

async function ensureClientGalleryBucket() {
  const bucketResponse = await fetch(
    `${supabaseRestUrl}/storage/v1/bucket/${clientGalleryStorageBucket}`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (bucketResponse.ok) return "";

  if (bucketResponse.status !== 404) {
    return bucketResponse.text();
  }

  const createResponse = await fetch(`${supabaseRestUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: supabaseServiceHeaders,
    body: JSON.stringify({
      id: clientGalleryStorageBucket,
      name: clientGalleryStorageBucket,
      public: false,
      file_size_limit: 52428800,
      allowed_mime_types: ["image/jpeg", "image/png", "image/webp"],
    }),
  });

  if (createResponse.ok) return "";

  return createResponse.text();
}

export async function POST(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Supabase ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  if (!hasSupabaseServiceConfig) {
    return NextResponse.json(
      {
        error:
          "Private Kundenbilder brauchen den SUPABASE_SERVICE_ROLE_KEY in Vercel.",
      },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const galleryId = String(formData.get("galleryId") || "");
  const file = formData.get("file");

  if (!galleryId) {
    return NextResponse.json(
      { error: "Bitte zuerst eine Kundengalerie auswählen." },
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
      { error: "Das Bild darf maximal 15 MB gross sein." },
      { status: 400 }
    );
  }

  const countResponse = await fetch(
    `${supabaseRestUrl}/rest/v1/client_gallery_images?select=id&gallery_id=eq.${encodeURIComponent(
      galleryId
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

  const path = `client-galleries/${galleryId}/${safeFileName(file.name)}`;
  const bytes = await file.arrayBuffer();
  const bucketError = await ensureClientGalleryBucket();

  if (bucketError) {
    return NextResponse.json(
      {
        error:
          "Der private Kundengalerie-Bucket konnte nicht vorbereitet werden.",
        details: bucketError,
      },
      { status: 500 }
    );
  }

  const uploadResponse = await fetch(
    `${supabaseRestUrl}/storage/v1/object/${clientGalleryStorageBucket}/${path}`,
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
      { error: "Kundenbild konnte nicht hochgeladen werden.", details },
      { status: 500 }
    );
  }

  const url = `${supabaseRestUrl}/storage/v1/object/${clientGalleryStorageBucket}/${path}`;
  const insertResponse = await fetch(
    `${supabaseRestUrl}/rest/v1/client_gallery_images`,
    {
      method: "POST",
      headers: {
        ...supabaseServiceHeaders,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        gallery_id: galleryId,
        url,
        path,
        filename: file.name || null,
        sort_order: imageCount,
      }),
    }
  );

  if (!insertResponse.ok) {
    const details = await insertResponse.text();
    return NextResponse.json(
      {
        error:
          "Bild wurde hochgeladen, aber nicht in der Kundengalerie gespeichert.",
        details,
      },
      { status: 500 }
    );
  }

  const [image] = await insertResponse.json();
  const signedUrl = await createSignedImageUrl(image.path);

  return NextResponse.json({
    image: {
      ...image,
      public_url: image.url,
      url: signedUrl,
      image_load_error: signedUrl
        ? ""
        : "Bild wurde hochgeladen, aber der private Bildlink konnte nicht erstellt werden.",
    },
  });
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
    return NextResponse.json({ error: "Bild-ID fehlt." }, { status: 400 });
  }

  const rowResponse = await fetch(
    `${supabaseRestUrl}/rest/v1/client_gallery_images?select=id,path&id=eq.${encodeURIComponent(
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
      { error: "Kundenbild konnte nicht gefunden werden.", details },
      { status: 500 }
    );
  }

  const [image] = await rowResponse.json();

  if (!image) {
    return NextResponse.json(
      { error: "Kundenbild existiert nicht mehr." },
      { status: 404 }
    );
  }

  await deleteClientGalleryStoragePaths([image.path]);

  const deleteResponse = await fetch(
    `${supabaseRestUrl}/rest/v1/client_gallery_images?id=eq.${encodeURIComponent(
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
      { error: "Kundenbild konnte nicht gelöscht werden.", details },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
