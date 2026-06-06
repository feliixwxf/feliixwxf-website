import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../_lib/auth";
import {
  clientGalleryStorageBucket,
  hasSupabaseConfig,
  hasSupabaseServiceConfig,
  supabaseRestUrl,
  supabaseServiceHeaders,
} from "../../_lib/supabase";
import {
  createSignedArchiveUrl,
  downloadClientGalleryStorageObject,
  uploadClientGalleryStorageObject,
} from "../../../_lib/storage";

export const runtime = "nodejs";

const GALLERY_SELECT =
  "id,title,access_code,archive_path,archive_size,archive_created_at";
const GALLERY_BASE_SELECT = "id,title,access_code";
const IMAGE_SELECT =
  "id,gallery_id,url,path,filename,sort_order,created_at";

function unauthorized() {
  return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
}

function sanitizeFileName(value, fallback = "bild") {
  const cleaned = String(value || "")
    .trim()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return cleaned || fallback;
}

function getExtension(image, index) {
  const source = image.filename || image.path || image.url || "";
  const match = String(source).match(/\.([a-zA-Z0-9]{2,5})(?:\?|$)/);
  return match ? match[1].toLowerCase() : `jpg`;
}

function makeUniqueName(image, index, usedNames) {
  const extension = getExtension(image, index);
  const baseName = sanitizeFileName(image.filename || `bild-${index + 1}`);
  let name = `${String(index + 1).padStart(2, "0")}-${baseName}.${extension}`;
  let suffix = 2;

  while (usedNames.has(name)) {
    name = `${String(index + 1).padStart(2, "0")}-${baseName}-${suffix}.${extension}`;
    suffix += 1;
  }

  usedNames.add(name);
  return name;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index;

  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }

  return value >>> 0;
});

function crc32(buffer) {
  let value = 0xffffffff;

  for (const byte of buffer) {
    value = CRC_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8);
  }

  return (value ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(date.getFullYear(), 1980);
  const dosTime =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(date.getSeconds() / 2);
  const dosDate =
    ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();

  return { dosTime, dosDate };
}

function createZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { dosTime, dosDate } = dosDateTime();

  for (const entry of entries) {
    const fileName = Buffer.from(entry.name, "utf8");
    const data = entry.data;
    const checksum = crc32(data);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(fileName.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, fileName, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(fileName.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, fileName);
    offset += localHeader.length + fileName.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const localFiles = Buffer.concat(localParts);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(entries.length, 8);
  endRecord.writeUInt16LE(entries.length, 10);
  endRecord.writeUInt32LE(centralDirectory.length, 12);
  endRecord.writeUInt32LE(localFiles.length, 16);
  endRecord.writeUInt16LE(0, 20);

  return Buffer.concat([localFiles, centralDirectory, endRecord]);
}

async function ensureArchiveMimeType() {
  const bucketResponse = await fetch(
    `${supabaseRestUrl}/storage/v1/bucket/${clientGalleryStorageBucket}`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (bucketResponse.status === 404) {
    const createResponse = await fetch(`${supabaseRestUrl}/storage/v1/bucket`, {
      method: "POST",
      headers: supabaseServiceHeaders,
      body: JSON.stringify({
        id: clientGalleryStorageBucket,
        name: clientGalleryStorageBucket,
        public: false,
        file_size_limit: 52428800,
        allowed_mime_types: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "application/zip",
        ],
      }),
    });

    return createResponse.ok ? "" : createResponse.text();
  }

  if (!bucketResponse.ok) return bucketResponse.text();

  const bucket = await bucketResponse.json();
  const allowedMimeTypes = Array.isArray(bucket.allowed_mime_types)
    ? bucket.allowed_mime_types
    : [];

  if (allowedMimeTypes.includes("application/zip")) return "";

  const updateResponse = await fetch(
    `${supabaseRestUrl}/storage/v1/bucket/${clientGalleryStorageBucket}`,
    {
      method: "PUT",
      headers: supabaseServiceHeaders,
      body: JSON.stringify({
        public: false,
        file_size_limit: bucket.file_size_limit || 52428800,
        allowed_mime_types: [
          ...new Set([
            ...allowedMimeTypes,
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/zip",
          ]),
        ],
      }),
    }
  );

  return updateResponse.ok ? "" : updateResponse.text();
}

async function loadGallery(id) {
  let response = await fetch(
    `${supabaseRestUrl}/rest/v1/client_galleries?select=${GALLERY_SELECT}&id=eq.${encodeURIComponent(
      id
    )}&limit=1`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const details = await response.text();
    const normalizedDetails = details.toLowerCase();

    if (
      normalizedDetails.includes("archive_path") ||
      normalizedDetails.includes("archive_size") ||
      normalizedDetails.includes("archive_created") ||
      normalizedDetails.includes("schema cache")
    ) {
      response = await fetch(
        `${supabaseRestUrl}/rest/v1/client_galleries?select=${GALLERY_BASE_SELECT}&id=eq.${encodeURIComponent(
          id
        )}&limit=1`,
        {
          headers: supabaseServiceHeaders,
          cache: "no-store",
        }
      );
    } else {
      return { error: details };
    }
  }

  if (!response.ok) return { error: await response.text() };

  const [gallery] = await response.json();
  return { gallery };
}

async function loadImages(galleryId) {
  const response = await fetch(
    `${supabaseRestUrl}/rest/v1/client_gallery_images?select=${IMAGE_SELECT}&gallery_id=eq.${encodeURIComponent(
      galleryId
    )}&order=sort_order.asc&order=created_at.asc`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (!response.ok) return { error: await response.text() };
  return { images: await response.json() };
}

async function updateGalleryArchiveState(id, updatePayload) {
  const { archive_created_at, archive_size, archive_url, ...withoutArchiveCreatedAtSizeUrl } =
    updatePayload;
  const withoutArchiveCreatedAt = {
    ...withoutArchiveCreatedAtSizeUrl,
    archive_url,
    archive_size,
  };
  const withoutArchiveCreatedAtSize = {
    ...withoutArchiveCreatedAtSizeUrl,
    archive_url,
  };

  const attempts = [
    updatePayload,
    withoutArchiveCreatedAt,
    withoutArchiveCreatedAtSize,
    withoutArchiveCreatedAtSizeUrl,
  ];

  let details = "";

  for (const payload of attempts) {
    const response = await fetch(
      `${supabaseRestUrl}/rest/v1/client_galleries?id=eq.${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: {
          ...supabaseServiceHeaders,
          Prefer: "return=minimal",
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) return { payload };

    details = await response.text();
    const normalizedDetails = details.toLowerCase();

    if (
      normalizedDetails.includes("archive_path") ||
      (!normalizedDetails.includes("archive_created_at") &&
        !normalizedDetails.includes("archive_size") &&
        !normalizedDetails.includes("archive_url") &&
        !normalizedDetails.includes("schema cache"))
    ) {
      break;
    }
  }

  return { error: details };
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
          "ZIP-Erstellung braucht den SUPABASE_SERVICE_ROLE_KEY in Vercel.",
      },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");

  if (!id) {
    return NextResponse.json(
      { error: "Galerie-ID fehlt." },
      { status: 400 }
    );
  }

  const bucketDetails = await ensureArchiveMimeType();

  if (bucketDetails) {
    return NextResponse.json(
      {
        error: "Der private Kundengalerie-Bucket konnte nicht vorbereitet werden.",
        details: bucketDetails,
      },
      { status: 500 }
    );
  }

  const galleryResult = await loadGallery(id);

  if (galleryResult.error) {
    return NextResponse.json(
      {
        error:
          "Galerie konnte nicht geladen werden. Bitte die aktualisierte supabase-client-galleries.sql ausführen.",
        details: galleryResult.error,
      },
      { status: 500 }
    );
  }

  const gallery = galleryResult.gallery;

  if (!gallery) {
    return NextResponse.json(
      { error: "Galerie wurde nicht gefunden." },
      { status: 404 }
    );
  }

  const imageResult = await loadImages(id);

  if (imageResult.error) {
    return NextResponse.json(
      { error: "Galeriebilder konnten nicht geladen werden.", details: imageResult.error },
      { status: 500 }
    );
  }

  const images = imageResult.images || [];

  if (images.length === 0) {
    return NextResponse.json(
      { error: "Für diese Galerie gibt es noch keine Bilder zum Verpacken." },
      { status: 400 }
    );
  }

  const usedNames = new Set();
  const entries = [];

  for (const [index, image] of images.entries()) {
    const data = await downloadClientGalleryStorageObject(image.path, image.url);

    if (!data) {
      return NextResponse.json(
        {
          error: "Mindestens ein Bild konnte nicht für das ZIP geladen werden.",
          details: image.filename || image.path || image.id,
        },
        { status: 500 }
      );
    }

    entries.push({
      name: makeUniqueName(image, index, usedNames),
      data,
    });
  }

  const archive = createZip(entries);
  const archiveName = `${sanitizeFileName(gallery.title, "kundengalerie")}-${sanitizeFileName(
    gallery.access_code,
    "galerie"
  )}.zip`;
  const archivePath = `client-galleries/${id}/archive/${archiveName}`;

  const uploadResult = await uploadClientGalleryStorageObject(
    archivePath,
    archive,
    "application/zip"
  );

  if (!uploadResult.ok) {
    return NextResponse.json(
      { error: "ZIP konnte nicht hochgeladen werden.", details: uploadResult.details },
      { status: 500 }
    );
  }

  const archiveUrl = await createSignedArchiveUrl(archivePath);
  const archiveCreatedAt = new Date().toISOString();
  const updatePayload = {
    status: "completed",
    is_active: true,
    finals_exported: true,
    archive_prepared: true,
    archive_path: archivePath,
    archive_url: null,
    archive_size: archive.length,
    archive_created_at: archiveCreatedAt,
  };

  const updateResult = await updateGalleryArchiveState(id, updatePayload);

  if (updateResult.error) {
    const normalizedDetails = updateResult.error.toLowerCase();
    const missingArchiveFields =
      normalizedDetails.includes("archive_path") ||
      normalizedDetails.includes("archive_size") ||
      normalizedDetails.includes("archive_url") ||
      normalizedDetails.includes("archive_created") ||
      normalizedDetails.includes("schema cache");

    return NextResponse.json(
      {
        error:
          missingArchiveFields
            ? "ZIP wurde erstellt, aber Supabase kennt die Archiv-Spalten noch nicht."
            : "ZIP wurde erstellt, aber die Galerie konnte nicht aktualisiert werden.",
        details: updateResult.error,
      },
      { status: 500 }
    );
  }

  const savedPayload = updateResult.payload;

  return NextResponse.json({
    gallery: {
      ...gallery,
      ...savedPayload,
      archive_size: savedPayload.archive_size ?? archive.length,
      archive_created_at: savedPayload.archive_created_at || archiveCreatedAt,
      archive_download_url: archiveUrl,
    },
  });
}
