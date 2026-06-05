import {
  clientGalleryStorageBucket,
  storageBucket,
  supabaseBaseUrl,
  supabaseServiceHeaders,
} from "./supabase";

const SIGNED_IMAGE_EXPIRES_IN = 60 * 60 * 6;
const SIGNED_ARCHIVE_EXPIRES_IN = 60 * 15;
const signedClientImageUrlsEnabled =
  process.env.SUPABASE_SIGN_CLIENT_IMAGES !== "false";

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

      if (!signedClientImageUrlsEnabled) {
        return {
          ...image,
          public_url: publicUrl,
          url: publicUrl,
        };
      }

      return {
        ...image,
        public_url: publicUrl,
        url: await createSignedImageUrl(image.path, publicUrl),
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
