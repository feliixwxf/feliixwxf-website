import crypto from "crypto";

export const CLIENT_GALLERY_SESSION_COOKIE = "feliix_client_gallery_session";
const SESSION_TTL_SECONDS = 60 * 30;

function getSessionSecret() {
  return (
    process.env.CLIENT_GALLERY_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ""
  );
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value) {
  const secret = getSessionSecret();
  if (!secret) return "";

  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

export function createClientGallerySession(galleryId) {
  const payload = base64UrlEncode(
    JSON.stringify({
      galleryId,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    })
  );
  const signature = sign(payload);

  return signature ? `${payload}.${signature}` : "";
}

export function verifyClientGallerySession(token) {
  const [payload, signature] = String(token || "").split(".");
  if (!payload || !signature) return null;

  const expectedSignature = sign(payload);
  const expected = Buffer.from(expectedSignature);
  const actual = Buffer.from(signature);

  if (
    !expectedSignature ||
    expected.length !== actual.length ||
    !crypto.timingSafeEqual(expected, actual)
  ) {
    return null;
  }

  try {
    const data = JSON.parse(base64UrlDecode(payload));
    if (!data.galleryId || !data.exp || data.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return data.galleryId;
  } catch {
    return null;
  }
}

export const clientGallerySessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};
