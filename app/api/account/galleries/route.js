import { NextResponse } from "next/server";
import {
  supabaseBaseUrl,
  supabaseServiceHeaders,
} from "../../_lib/supabase";
import {
  accountConfigMissing,
  getCustomerUser,
  requireAccountConfig,
} from "../_lib/auth";

const GALLERY_SELECT =
  "id,title,client_name,client_email,access_code,is_active,downloads_enabled,status,expires_at,created_at";

export async function GET(request) {
  if (!requireAccountConfig()) return accountConfigMissing();

  const user = await getCustomerUser(request);

  if (!user?.email) {
    return NextResponse.json(
      { error: "Bitte zuerst einloggen." },
      { status: 401 }
    );
  }

  const response = await fetch(
    `${supabaseBaseUrl}/rest/v1/client_galleries?select=${GALLERY_SELECT}&client_email=eq.${encodeURIComponent(
      user.email.toLowerCase()
    )}&order=created_at.desc&limit=50`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          "Galerien konnten nicht geladen werden. Ist die Kunden-E-Mail-Spalte in Supabase angelegt?",
        details: await response.text(),
      },
      { status: 500 }
    );
  }

  const galleries = await response.json();

  return NextResponse.json({
    galleries: galleries.filter(
      (gallery) => gallery.is_active !== false && gallery.status !== "paused"
    ),
  });
}
