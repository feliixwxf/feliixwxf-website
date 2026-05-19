import { NextResponse } from "next/server";
import { supabaseBaseUrl, supabaseHeaders } from "../../_lib/supabase";
import {
  accountConfigMissing,
  CUSTOMER_ACCESS_COOKIE,
  getCustomerUser,
  requireAccountConfig,
} from "../_lib/auth";

export async function PATCH(request) {
  if (!requireAccountConfig()) return accountConfigMissing();

  const token = request.cookies.get(CUSTOMER_ACCESS_COOKIE)?.value;
  const currentUser = await getCustomerUser(request);

  if (!token || !currentUser) {
    return NextResponse.json(
      { error: "Bitte zuerst einloggen." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim().slice(0, 100);

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
      data: { name },
    }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          data.msg ||
          data.message ||
          "Benutzername konnte nicht gespeichert werden.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    user: {
      id: data.id || currentUser.id,
      email: data.email || currentUser.email,
      name: data.user_metadata?.name || name,
    },
  });
}
