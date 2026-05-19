import { NextResponse } from "next/server";
import { supabaseBaseUrl, supabaseHeaders } from "../../_lib/supabase";
import {
  accountConfigMissing,
  requireAccountConfig,
  setCustomerCookies,
} from "../_lib/auth";

export async function POST(request) {
  if (!requireAccountConfig()) return accountConfigMissing();

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json(
      { error: "Bitte E-Mail und Passwort eingeben." },
      { status: 400 }
    );
  }

  const response = await fetch(
    `${supabaseBaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: supabaseHeaders,
      body: JSON.stringify({ email, password }),
    }
  );
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          data.error_description ||
          data.msg ||
          data.message ||
          "Login fehlgeschlagen. Bitte pruefe deine Daten.",
      },
      { status: 401 }
    );
  }

  const result = NextResponse.json({
    user: {
      id: data.user?.id,
      email: data.user?.email || email,
      name: data.user?.user_metadata?.name || "",
    },
  });

  return setCustomerCookies(result, data);
}
