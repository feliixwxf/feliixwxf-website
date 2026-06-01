import { NextResponse } from "next/server";
import { supabaseBaseUrl, supabaseHeaders } from "../../../_lib/supabase";
import { accountConfigMissing, requireAccountConfig } from "../../_lib/auth";

export async function POST(request) {
  if (!requireAccountConfig()) return accountConfigMissing();

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();

  if (!email) {
    return NextResponse.json(
      { error: "Bitte gib deine E-Mail-Adresse ein." },
      { status: 400 }
    );
  }

  const origin = request.headers.get("origin") || new URL(request.url).origin;
  const redirectTo = `${origin}/konto?reset=1`;

  const response = await fetch(
    `${supabaseBaseUrl}/auth/v1/recover?redirect_to=${encodeURIComponent(
      redirectTo
    )}`,
    {
      method: "POST",
      headers: supabaseHeaders,
      body: JSON.stringify({ email }),
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
          "Reset-Mail konnte nicht gesendet werden.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message:
      "Wenn ein Konto mit dieser E-Mail existiert, wurde eine Reset-Mail gesendet.",
  });
}
