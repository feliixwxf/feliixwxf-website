import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "feliix_admin_session";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const MIN_SECRET_LENGTH = 32;

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function getAdminAccessCode() {
  return process.env.ADMIN_ACCESS_CODE || "";
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function sign(value) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function signaturesMatch(value, signature) {
  const expected = Buffer.from(sign(value));
  const received = Buffer.from(signature || "");

  if (expected.length !== received.length) return false;

  return timingSafeEqual(expected, received);
}

function secureStringMatch(value, expectedValue) {
  const expected = Buffer.from(expectedValue);
  const received = Buffer.from(value || "");

  if (expected.length !== received.length) return false;

  return timingSafeEqual(expected, received);
}

export function isAdminPassword(password) {
  const configuredPassword = getAdminPassword();

  if (!configuredPassword) return false;

  return secureStringMatch(password, configuredPassword);
}

export function isAdminAccessCode(code) {
  const configuredCode = getAdminAccessCode();

  if (!configuredCode) return false;

  return secureStringMatch(code, configuredCode);
}

export function hasAdminConfig() {
  return Boolean(
    getAdminPassword() &&
      getAdminAccessCode() &&
      getSessionSecret().length >= MIN_SECRET_LENGTH
  );
}

export function applyNoStore(response) {
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

export function setAdminCookie(response) {
  const createdAt = Date.now().toString();
  const signature = sign(createdAt);

  response.cookies.set(ADMIN_COOKIE_NAME, `${createdAt}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return applyNoStore(response);
}

export function clearAdminCookie(response) {
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return applyNoStore(response);
}

export async function isAdminAuthenticated() {
  if (!hasAdminConfig()) return false;

  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const [createdAt, signature] = String(session || "").split(".");

  if (!createdAt || !signature) return false;
  if (!signaturesMatch(createdAt, signature)) return false;

  const sessionAge = Date.now() - Number(createdAt);
  return sessionAge >= 0 && sessionAge < SESSION_MAX_AGE * 1000;
}
