import {
  clientGalleryStorageBucket,
  storageBucket,
  supabaseBaseUrl,
  supabaseServiceHeaders,
} from "./supabase";
import sharp from "sharp";

const SIGNED_IMAGE_EXPIRES_IN = 60 * 60 * 6;
const SIGNED_ARCHIVE_EXPIRES_IN = 60 * 15;

function sanitizeArchivePart(value, fallback = "galerie") {
  const cleaned = String(value || "")
    .trim()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return cleaned || fallback;
}

export function getClientGalleryArchivePath(gallery) {
  if (gallery?.archive_path) return gallery.archive_path;
  if (!gallery?.id) return "";

  const archiveName = `${sanitizeArchivePart(
    gallery.title,
    "kundengalerie"
  )}-${sanitizeArchivePart(gallery.id, "galerie")}.zip`;

  return `client-galleries/${gallery.id}/archive/${archiveName}`;
}

function encodeStoragePath(path) {
  return String(path || "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function normalizeSignedUrl(signedUrl) {
  if (!signedUrl) return "";
  if (signedUrl.startsWith("http")) return signedUrl;
  if (signedUrl.startsWith("/object/")) {
    return `${supabaseBaseUrl}/storage/v1${signedUrl}`;
  }
  return `${supabaseBaseUrl}${signedUrl.startsWith("/") ? "" : "/"}${signedUrl}`;
}

export async function createSignedImageUrl(path, fallbackUrl = "") {
  return createSignedStorageUrl(path, fallbackUrl, SIGNED_IMAGE_EXPIRES_IN);
}

export async function createSignedArchiveUrl(path, fallbackUrl = "") {
  return createSignedStorageUrl(path, fallbackUrl, SIGNED_ARCHIVE_EXPIRES_IN);
}

export async function createSignedStorageUrl(
  path,
  fallbackUrl = "",
  expiresIn = SIGNED_IMAGE_EXPIRES_IN
) {
  if (!supabaseBaseUrl || !path) return fallbackUrl || "";

  try {
    const response = await fetch(
      `${supabaseBaseUrl}/storage/v1/object/sign/${clientGalleryStorageBucket}/${encodeStoragePath(
        path
      )}`,
      {
        method: "POST",
        headers: supabaseServiceHeaders,
        body: JSON.stringify({ expiresIn }),
      }
    );

    if (!response.ok) return fallbackUrl || "";

    const data = await response.json();
    return normalizeSignedUrl(data.signedURL || data.signedUrl) || fallbackUrl || "";
  } catch {
    return fallbackUrl || "";
  }
}

function isPublicStorageUrl(url) {
  return String(url || "").includes("/storage/v1/object/public/");
}

function safeClientImageFallback(url) {
  return isPublicStorageUrl(url) ? url : "";
}

export async function downloadClientGalleryStorageObject(path, fallbackUrl = "") {
  if (!supabaseBaseUrl || !path) return null;

  let response = await fetch(
    `${supabaseBaseUrl}/storage/v1/object/${clientGalleryStorageBucket}/${encodeStoragePath(
      path
    )}`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (!response.ok && fallbackUrl) {
    response = await fetch(fallbackUrl, { cache: "no-store" });
  }

  if (!response.ok) return null;

  return Buffer.from(await response.arrayBuffer());
}

export async function downloadPortfolioStorageObject(path, fallbackUrl = "") {
  if (!supabaseBaseUrl || !path) return null;

  let response = await fetch(
    `${supabaseBaseUrl}/storage/v1/object/${storageBucket}/${encodeStoragePath(
      path
    )}`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (!response.ok && fallbackUrl) {
    response = await fetch(fallbackUrl, { cache: "no-store" });
  }

  if (!response.ok) return null;

  return Buffer.from(await response.arrayBuffer());
}

function escapeSvgText(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function createWatermarkedClientImage(buffer, label = "feliix.wxf") {
  if (!buffer) return null;

  const image = sharp(buffer, { failOn: "none" }).rotate();
  const metadata = await image.metadata();
  const width = metadata.width || 1600;
  const height = metadata.height || 1200;
  const shortestSide = Math.min(width, height);
  const fontSize = Math.max(52, Math.round(shortestSide * 0.082));
  const strokeWidth = Math.max(3, Math.round(fontSize * 0.055));
  const safeLabel = escapeSvgText(label || "feliix.wxf");
  const pillWidth = fontSize * 7.6;
  const pillHeight = fontSize * 1.85;

  const watermark = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <g transform="translate(${width / 2} ${height / 2}) rotate(-18)">
        <rect
          x="${-pillWidth / 2}"
          y="${-pillHeight / 2}"
          width="${pillWidth}"
          height="${pillHeight}"
          rx="${fontSize * 0.32}"
          fill="#000000"
          fill-opacity="0.26"
        />
        <text
          x="0"
          y="0"
          text-anchor="middle"
          dominant-baseline="middle"
          font-family="sans-serif"
          font-size="${fontSize}"
          font-weight="900"
          fill="#ffffff"
          fill-opacity="0.74"
          stroke="#000000"
          stroke-width="${strokeWidth}"
          stroke-opacity="0.52"
          paint-order="stroke"
        >${safeLabel}</text>
      </g>
    </svg>
  `);

  return image
    .composite([{ input: watermark, blend: "over" }])
    .jpeg({ quality: 94, mozjpeg: true })
    .toBuffer();
}

export async function isDownloadWatermarkEnabled() {
  if (!supabaseBaseUrl) return false;

  try {
    const response = await fetch(
      `${supabaseBaseUrl}/rest/v1/site_settings?select=value&key=eq.download_watermark_enabled&limit=1`,
      {
        headers: supabaseServiceHeaders,
        cache: "no-store",
      }
    );

    if (!response.ok) return false;

    const [setting] = await response.json();
    return String(setting?.value || "") === "true";
  } catch {
    return false;
  }
}

export async function uploadClientGalleryStorageObject(
  path,
  body,
  contentType
) {
  if (!supabaseBaseUrl || !path) return { ok: false, details: "Storage fehlt." };

  const response = await fetch(
    `${supabaseBaseUrl}/storage/v1/object/${clientGalleryStorageBucket}/${encodeStoragePath(
      path
    )}`,
    {
      method: "POST",
      headers: {
        ...supabaseServiceHeaders,
        "Content-Type": contentType,
        "x-upsert": "true",
      },
      body,
    }
  );

  return {
    ok: response.ok,
    details: response.ok ? "" : await response.text(),
  };
}

export async function withSignedImageUrls(images) {
  return Promise.all(
    images.map(async (image) => {
      const publicUrl = image.url || "";
      const fallbackUrl = safeClientImageFallback(publicUrl);

      return {
        ...image,
        public_url: publicUrl,
        url: await createSignedImageUrl(image.path, fallbackUrl),
      };
    })
  );
}

export async function deleteClientGalleryStoragePaths(paths) {
  const prefixes = paths.filter(Boolean);

  if (!supabaseBaseUrl || prefixes.length === 0) return;

  await fetch(
    `${supabaseBaseUrl}/storage/v1/object/${clientGalleryStorageBucket}`,
    {
      method: "DELETE",
      headers: supabaseServiceHeaders,
      body: JSON.stringify({ prefixes }),
    }
  );

  if (clientGalleryStorageBucket !== storageBucket) {
    await fetch(`${supabaseBaseUrl}/storage/v1/object/${storageBucket}`, {
      method: "DELETE",
      headers: supabaseServiceHeaders,
      body: JSON.stringify({ prefixes }),
    });
  }
}
