import {
  storageBucket,
  supabaseBaseUrl,
  supabaseServiceHeaders,
} from "./supabase";

const SIGNED_IMAGE_EXPIRES_IN = 60 * 60 * 6;

function encodeStoragePath(path) {
  return String(path || "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function normalizeSignedUrl(signedUrl) {
  if (!signedUrl) return "";
  if (signedUrl.startsWith("http")) return signedUrl;
  return `${supabaseBaseUrl}${signedUrl.startsWith("/") ? "" : "/"}${signedUrl}`;
}

export async function createSignedImageUrl(path, fallbackUrl = "") {
  if (!supabaseBaseUrl || !path) return fallbackUrl || "";

  try {
    const response = await fetch(
      `${supabaseBaseUrl}/storage/v1/object/sign/${storageBucket}/${encodeStoragePath(
        path
      )}`,
      {
        method: "POST",
        headers: supabaseServiceHeaders,
        body: JSON.stringify({ expiresIn: SIGNED_IMAGE_EXPIRES_IN }),
      }
    );

    if (!response.ok) return fallbackUrl || "";

    const data = await response.json();
    return normalizeSignedUrl(data.signedURL || data.signedUrl) || fallbackUrl || "";
  } catch {
    return fallbackUrl || "";
  }
}

export async function withSignedImageUrls(images) {
  return Promise.all(
    images.map(async (image) => ({
      ...image,
      url: await createSignedImageUrl(image.path, image.url),
    }))
  );
}
