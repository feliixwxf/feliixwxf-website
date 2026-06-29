import { NextResponse } from "next/server";
import sharp from "sharp";
import { logAdminActivity } from "../_lib/activity";
import { isAdminAuthenticated } from "../_lib/auth";
import {
  hasSupabaseConfig,
  hasSupabaseServiceConfig,
  storageBucket,
  supabaseRestUrl,
  supabaseServiceHeaders,
} from "../_lib/supabase";

const CATEGORIES = new Set(["car", "portrait", "nature", "event"]);
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const COMPRESSED_IMAGE_QUALITY = 90;
const COMPRESSED_IMAGE_MAX_EDGE = 2200;
const IMAGE_SELECT_WITH_META =
  "id,category,url,path,sort_order,created_at,title,note,width,height";
const IMAGE_SELECT_BASE = "id,category,url,path,sort_order,created_at";

function unauthorized() {
  return NextResponse.json(
    { error: "Nicht eingeloggt." },
    { status: 401 }
  );
}

function safeFileName(name) {
  const baseName = name.includes(".") ? name.split(".").slice(0, -1).join(".") : name;
  const cleanedBaseName =
    baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "portfolio";

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}-${cleanedBaseName}.webp`;
}

async function compressPortfolioImage(file) {
  const input = Buffer.from(await file.arrayBuffer());
  const result = await sharp(input, { failOn: "none" })
    .rotate()
    .resize({
      width: COMPRESSED_IMAGE_MAX_EDGE,
      height: COMPRESSED_IMAGE_MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: COMPRESSED_IMAGE_QUALITY })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: result.data,
    width: result.info.width || null,
    height: result.info.height || null,
  };
}

async function ensurePortfolioBucket() {
  const bucketResponse = await fetch(
    `${supabaseRestUrl}/storage/v1/bucket/${storageBucket}`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (bucketResponse.ok) {
    const updateResponse = await fetch(
      `${supabaseRestUrl}/storage/v1/bucket/${storageBucket}`,
      {
        method: "PUT",
        headers: supabaseServiceHeaders,
        body: JSON.stringify({
          public: true,
          file_size_limit: MAX_FILE_SIZE,
          allowed_mime_types: ["image/jpeg", "image/png", "image/webp"],
        }),
      }
    );

    return updateResponse.ok ? "" : updateResponse.text();
  }

  if (bucketResponse.status !== 404) {
    return bucketResponse.text();
  }

  const createResponse = await fetch(`${supabaseRestUrl}/storage/v1/bucket`, {
    method: "POST",
    headers: supabaseServiceHeaders,
    body: JSON.stringify({
      id: storageBucket,
      name: storageBucket,
      public: true,
      file_size_limit: MAX_FILE_SIZE,
      allowed_mime_types: ["image/jpeg", "image/png", "image/webp"],
    }),
  });

  return createResponse.ok ? "" : createResponse.text();
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Supabase ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  let response = await fetch(
    `${supabaseRestUrl}/rest/v1/portfolio_images?select=${IMAGE_SELECT_WITH_META}&order=sort_order.asc&order=created_at.desc&limit=200`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    response = await fetch(
      `${supabaseRestUrl}/rest/v1/portfolio_images?select=${IMAGE_SELECT_BASE}&order=sort_order.asc&order=created_at.desc&limit=200`,
      {
        headers: supabaseServiceHeaders,
        cache: "no-store",
      }
    );
  }

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      { error: "Bilder konnten nicht geladen werden.", details },
      { status: 500 }
    );
  }

  const images = await response.json();

  return NextResponse.json({
    images: images.map((image) => ({
      title: "",
      note: "",
      ...image,
    })),
  });
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
          "Portfolio-Uploads brauchen den SUPABASE_SERVICE_ROLE_KEY in Vercel.",
      },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const category = String(formData.get("category") || "");
  const file = formData.get("file");

  if (!CATEGORIES.has(category)) {
    return NextResponse.json(
      { error: "Ungültige Kategorie." },
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
      { error: "Das Bild darf maximal 50 MB gross sein." },
      { status: 400 }
    );
  }

  const bucketError = await ensurePortfolioBucket();

  if (bucketError) {
    return NextResponse.json(
      {
        error: "Der Portfolio-Bucket konnte nicht vorbereitet werden.",
        details: bucketError,
      },
      { status: 500 }
    );
  }

  const path = `${category}/${safeFileName(file.name)}`;
  let processedImage;

  try {
    processedImage = await compressPortfolioImage(file);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Bild konnte nicht komprimiert werden. Bitte JPG, PNG oder WebP verwenden.",
        details: error.message,
      },
      { status: 400 }
    );
  }

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
        "Content-Type": "image/webp",
        "x-upsert": "false",
      },
      body: processedImage.buffer,
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

  let insertResponse = await fetch(
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
        width: processedImage.width,
        height: processedImage.height,
      }),
    }
  );

  if (!insertResponse.ok) {
    const details = await insertResponse.text();
    const missingDimensionColumns =
      details.includes("width") || details.includes("height");

    if (missingDimensionColumns) {
      insertResponse = await fetch(`${supabaseRestUrl}/rest/v1/portfolio_images`, {
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
      });
    } else {
      return NextResponse.json(
        {
          error:
            "Bild wurde hochgeladen, aber nicht in der Galerie gespeichert. Fehlt die Tabelle portfolio_images?",
          details,
        },
        { status: 500 }
      );
    }
  }

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
  await logAdminActivity({
    action: "Portfolio-Bild hochgeladen",
    targetType: "portfolio_image",
    targetId: image.id,
    label: category,
  });
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

  const body = await request.json();
  const { id, orderedIds } = body;

  if (id && ("title" in body || "note" in body)) {
    const title = String(body.title || "").trim().slice(0, 80);
    const note = String(body.note || "").trim().slice(0, 240);

    const response = await fetch(
      `${supabaseRestUrl}/rest/v1/portfolio_images?id=eq.${encodeURIComponent(
        id
      )}&select=${IMAGE_SELECT_WITH_META}`,
      {
        method: "PATCH",
        headers: {
          ...supabaseServiceHeaders,
          Prefer: "return=representation",
        },
        body: JSON.stringify({ title, note }),
      }
    );

    if (!response.ok) {
      const details = await response.text();
      return NextResponse.json(
        {
          error:
            "Bilddetails konnten nicht gespeichert werden. Führe vorher supabase-portfolio-metadata.sql in Supabase aus.",
          details,
        },
        { status: 500 }
      );
    }

    const [image] = await response.json();
    await logAdminActivity({
      action: "Portfolio-Bilddetails gespeichert",
      targetType: "portfolio_image",
      targetId: image.id,
      label: title || note || image.category || "",
    });
    return NextResponse.json({ image });
  }

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

  await logAdminActivity({
    action: "Portfolio-Sortierung gespeichert",
    targetType: "portfolio_image",
    label: `${orderedIds.length} Bilder`,
  });

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

  let storageWarning = "";

  if (!storageResponse.ok) {
    const details = await storageResponse.text();
    const missingStorageFile =
      storageResponse.status === 404 ||
      details.toLowerCase().includes("not found") ||
      details.toLowerCase().includes("not exist");

    if (!missingStorageFile) {
      return NextResponse.json(
        { error: "Bilddatei konnte nicht gelöscht werden.", details },
        { status: 500 }
      );
    }

    storageWarning = details;
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
      { error: "Bildeintrag konnte nicht gelöscht werden.", details },
      { status: 500 }
    );
  }

  await logAdminActivity({
    action: "Portfolio-Bild gelöscht",
    targetType: "portfolio_image",
    targetId: id,
    label: image.path || "",
  });

  return NextResponse.json({
    ok: true,
    warning: storageWarning || undefined,
  });
}
