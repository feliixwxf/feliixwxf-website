import { NextResponse } from "next/server";
import {
  hasSupabaseConfig,
  supabaseBaseUrl,
  supabaseHeaders,
} from "../../_lib/supabase";

export const CUSTOMER_ACCESS_COOKIE = "feliix_customer_access";
export const CUSTOMER_REFRESH_COOKIE = "feliix_customer_refresh";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function accountConfigMissing() {
  return NextResponse.json(
    { error: "Supabase ist noch nicht konfiguriert." },
    { status: 503 }
  );
}

export function requireAccountConfig() {
  return hasSupabaseConfig && supabaseBaseUrl;
}

export function setCustomerCookies(response, session) {
  if (!session?.access_token) return response;

  response.cookies.set(CUSTOMER_ACCESS_COOKIE, session.access_token, {
    ...COOKIE_OPTIONS,
    maxAge: session.expires_in || 60 * 60,
  });

  if (session.refresh_token) {
    response.cookies.set(CUSTOMER_REFRESH_COOKIE, session.refresh_token, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

export function clearCustomerCookies(response) {
  response.cookies.set(CUSTOMER_ACCESS_COOKIE, "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
  response.cookies.set(CUSTOMER_REFRESH_COOKIE, "", {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  });
  return response;
}

export async function getCustomerUser(request) {
  if (!requireAccountConfig()) return null;

  const token = request.cookies.get(CUSTOMER_ACCESS_COOKIE)?.value;
  if (!token) return null;

  const response = await fetch(`${supabaseBaseUrl}/auth/v1/user`, {
    headers: {
      ...supabaseHeaders,
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const user = await response.json();
  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || "",
  };
}
