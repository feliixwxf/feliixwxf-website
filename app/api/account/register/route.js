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
  const name = String(body.name || "").trim().slice(0, 100);
  const origin = request.headers.get("origin") || new URL(request.url).origin;
  const redirectTo = `${origin}/konto?verified=1`;

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Bitte eine gueltige E-Mail eingeben." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Das Passwort muss mindestens 8 Zeichen haben." },
      { status: 400 }
    );
  }

  const response = await fetch(
    `${supabaseBaseUrl}/auth/v1/signup?redirect_to=${encodeURIComponent(
      redirectTo
    )}`,
    {
      method: "POST",
      headers: supabaseHeaders,
      body: JSON.stringify({
        email,
        password,
        data: { name },
      }),
    }
  );
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          data.msg ||
          data.message ||
          "Konto konnte nicht erstellt werden. Bitte spaeter erneut versuchen.",
      },
      { status: 400 }
    );
  }

  const result = NextResponse.json({
    user: {
      id: data.user?.id,
      email: data.user?.email || email,
      name,
    },
    needsEmailConfirmation: !data.session,
    message: data.session
      ? "Konto wurde erstellt."
      : "Konto wurde erstellt. Bitte bestaetige deine E-Mail und logge dich danach ein.",
  });

  return setCustomerCookies(result, data.session);
}
