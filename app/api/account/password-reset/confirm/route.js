import { NextResponse } from "next/server";
import { supabaseBaseUrl, supabaseHeaders } from "../../../_lib/supabase";
import {
  accountConfigMissing,
  requireAccountConfig,
  setCustomerCookies,
} from "../../_lib/auth";

export async function POST(request) {
  if (!requireAccountConfig()) return accountConfigMissing();

  const body = await request.json().catch(() => ({}));
  const password = String(body.password || "");
  const accessToken = String(body.accessToken || "");
  const refreshToken = String(body.refreshToken || "");

  if (!accessToken) {
    return NextResponse.json(
      { error: "Reset-Link ist ungültig oder abgelaufen." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Das neue Passwort muss mindestens 8 Zeichen haben." },
      { status: 400 }
    );
  }

  const response = await fetch(`${supabaseBaseUrl}/auth/v1/user`, {
    method: "PUT",
    headers: {
      ...supabaseHeaders,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ password }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          data.error_description ||
          data.msg ||
          data.message ||
          "Passwort konnte nicht geändert werden.",
      },
      { status: 400 }
    );
  }

  const result = NextResponse.json({
    user: {
      id: data.id,
      email: data.email || "",
      name: data.user_metadata?.name || "",
      phone: data.user_metadata?.phone || "",
      avatar_url: data.user_metadata?.avatar_url || "",
    },
    message: "Passwort wurde geändert. Du bist jetzt eingeloggt.",
  });

  return setCustomerCookies(result, {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: 60 * 60,
  });
}
