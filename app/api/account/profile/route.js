import { NextResponse } from "next/server";
import { supabaseBaseUrl, supabaseHeaders } from "../../_lib/supabase";
import {
  accountConfigMissing,
  applyCustomerSessionCookies,
  getCustomerSession,
  requireAccountConfig,
} from "../_lib/auth";

export async function PATCH(request) {
  if (!requireAccountConfig()) return accountConfigMissing();

  const customerSession = await getCustomerSession(request);
  const token = customerSession.accessToken;
  const currentUser = customerSession.user;

  if (!token || !currentUser) {
    const response = NextResponse.json(
      { error: "Bitte zuerst einloggen." },
      { status: 401 }
    );
    return applyCustomerSessionCookies(response, customerSession);
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim().slice(0, 100);
  const phone = String(body.phone || "").trim().slice(0, 40);

  if (!name) {
    return NextResponse.json(
      { error: "Bitte einen Benutzernamen eingeben." },
      { status: 400 }
    );
  }

  const response = await fetch(`${supabaseBaseUrl}/auth/v1/user`, {
    method: "PUT",
    headers: {
      ...supabaseHeaders,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      data: {
        name,
        phone,
        avatar_url: currentUser.avatar_url || "",
      },
    }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const result = NextResponse.json(
      {
        error:
          data.msg ||
          data.message ||
          "Benutzername konnte nicht gespeichert werden.",
      },
      { status: 400 }
    );
    return applyCustomerSessionCookies(result, customerSession);
  }

  const result = NextResponse.json({
    user: {
      id: data.id || currentUser.id,
      email: data.email || currentUser.email,
      name: data.user_metadata?.name || name,
      phone: data.user_metadata?.phone || phone,
      avatar_url: data.user_metadata?.avatar_url || currentUser.avatar_url || "",
    },
  });

  return applyCustomerSessionCookies(result, customerSession);
}
