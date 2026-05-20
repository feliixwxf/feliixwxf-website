import { NextResponse } from "next/server";
import {
  storageBucket,
  supabaseBaseUrl,
  supabaseHeaders,
  supabaseServiceHeaders,
} from "../../_lib/supabase";
import {
  accountConfigMissing,
  applyCustomerSessionCookies,
  getCustomerSession,
  requireAccountConfig,
} from "../_lib/auth";

const MAX_FILE_SIZE = 3 * 1024 * 1024;

function safeFileName(name) {
  const extension = name.includes(".") ? name.split(".").pop() : "jpg";

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${String(extension || "jpg").toLowerCase()}`;
}

export async function POST(request) {
  if (!requireAccountConfig()) return accountConfigMissing();

  const customerSession = await getCustomerSession(request);
  const user = customerSession.user;
  const token = customerSession.accessToken;

  if (!user || !token) {
    const response = NextResponse.json(
      { error: "Bitte zuerst einloggen." },
      { status: 401 }
    );
    return applyCustomerSessionCookies(response, customerSession);
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    const response = NextResponse.json(
      { error: "Bitte ein Profilbild auswaehlen." },
      { status: 400 }
    );
    return applyCustomerSessionCookies(response, customerSession);
  }

  if (!String(file.type || "").startsWith("image/")) {
    const response = NextResponse.json(
      { error: "Nur Bilddateien sind erlaubt." },
      { status: 400 }
    );
    return applyCustomerSessionCookies(response, customerSession);
  }

  if (file.size > MAX_FILE_SIZE) {
    const response = NextResponse.json(
      { error: "Das Profilbild darf maximal 3 MB gross sein." },
      { status: 400 }
    );
    return applyCustomerSessionCookies(response, customerSession);
  }

  const path = `avatars/${user.id}/${safeFileName(file.name)}`;
  const bytes = await file.arrayBuffer();
  const uploadResponse = await fetch(
    `${supabaseBaseUrl}/storage/v1/object/${storageBucket}/${path}`,
    {
      method: "POST",
      headers: {
        apikey: supabaseServiceHeaders.apikey,
        Authorization: supabaseServiceHeaders.Authorization,
        "Cache-Control": "31536000",
        "Content-Type": file.type || "image/jpeg",
        "x-upsert": "false",
      },
      body: bytes,
    }
  );

  if (!uploadResponse.ok) {
    const response = NextResponse.json(
      {
        error:
          "Profilbild konnte nicht hochgeladen werden. Bitte pruefe den Supabase Storage Bucket.",
        details: await uploadResponse.text(),
      },
      { status: 500 }
    );
    return applyCustomerSessionCookies(response, customerSession);
  }

  const avatarUrl = `${supabaseBaseUrl}/storage/v1/object/public/${storageBucket}/${path}`;
  const profileResponse = await fetch(`${supabaseBaseUrl}/auth/v1/user`, {
    method: "PUT",
    headers: {
      ...supabaseHeaders,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      data: {
        name: user.name || "",
        avatar_url: avatarUrl,
      },
    }),
  });
  const data = await profileResponse.json().catch(() => ({}));

  if (!profileResponse.ok) {
    const response = NextResponse.json(
      {
        error:
          data.msg ||
          data.message ||
          "Profilbild wurde hochgeladen, aber nicht im Konto gespeichert.",
      },
      { status: 500 }
    );
    return applyCustomerSessionCookies(response, customerSession);
  }

  const result = NextResponse.json({
    user: {
      id: data.id || user.id,
      email: data.email || user.email,
      name: data.user_metadata?.name || user.name || "",
      avatar_url: data.user_metadata?.avatar_url || avatarUrl,
    },
  });

  return applyCustomerSessionCookies(result, customerSession);
}
