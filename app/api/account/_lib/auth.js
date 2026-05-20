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

async function readCustomerUser(token) {
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

async function refreshCustomerSession(refreshToken) {
  const response = await fetch(
    `${supabaseBaseUrl}/auth/v1/token?grant_type=refresh_token`,
    {
      method: "POST",
      headers: supabaseHeaders,
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data?.access_token) {
    return null;
  }

  return data;
}

export async function getCustomerSession(request) {
  if (!requireAccountConfig()) {
    return { user: null, accessToken: "", session: null, shouldClearCookies: false };
  }

  const accessToken = request.cookies.get(CUSTOMER_ACCESS_COOKIE)?.value || "";
  const refreshToken = request.cookies.get(CUSTOMER_REFRESH_COOKIE)?.value || "";

  if (accessToken) {
    const user = await readCustomerUser(accessToken);
    if (user) {
      return {
        user,
        accessToken,
        session: null,
        shouldClearCookies: false,
      };
    }
  }

  if (!refreshToken) {
    return {
      user: null,
      accessToken: "",
      session: null,
      shouldClearCookies: Boolean(accessToken),
    };
  }

  const session = await refreshCustomerSession(refreshToken);

  if (!session) {
    return {
      user: null,
      accessToken: "",
      session: null,
      shouldClearCookies: true,
    };
  }

  const user =
    session.user && session.user.id
      ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || "",
        }
      : await readCustomerUser(session.access_token);

  if (!user) {
    return {
      user: null,
      accessToken: "",
      session: null,
      shouldClearCookies: true,
    };
  }

  return {
    user,
    accessToken: session.access_token,
    session,
    shouldClearCookies: false,
  };
}

export function applyCustomerSessionCookies(response, customerSession) {
  if (customerSession?.session) {
    return setCustomerCookies(response, customerSession.session);
  }

  if (customerSession?.shouldClearCookies) {
    return clearCustomerCookies(response);
  }

  return response;
}

export async function getCustomerUser(request) {
  const customerSession = await getCustomerSession(request);
  return customerSession.user;
}
