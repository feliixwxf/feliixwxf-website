import { NextResponse } from "next/server";
import {
  SUPABASE_SERVICE_KEY,
  storageBucket,
  supabaseBaseUrl,
  supabaseServiceHeaders,
} from "../../_lib/supabase";
import {
  accountConfigMissing,
  applyCustomerSessionCookies,
  clearCustomerCookies,
  getCustomerSession,
  requireAccountConfig,
} from "../_lib/auth";

async function bestEffortFetch(url, options) {
  try {
    const response = await fetch(url, options);
    return { ok: response.ok, details: response.ok ? "" : await response.text() };
  } catch (error) {
    return {
      ok: false,
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

async function deleteAvatarFiles(userId) {
  const listResponse = await fetch(
    `${supabaseBaseUrl}/storage/v1/object/list/${storageBucket}`,
    {
      method: "POST",
      headers: supabaseServiceHeaders,
      body: JSON.stringify({
        prefix: `avatars/${userId}`,
        limit: 100,
      }),
    }
  );

  if (!listResponse.ok) return;

  const files = await listResponse.json().catch(() => []);
  const prefixes = files
    .map((file) => file?.name)
    .filter(Boolean)
    .map((name) => `avatars/${userId}/${name}`);

  if (prefixes.length === 0) return;

  await bestEffortFetch(`${supabaseBaseUrl}/storage/v1/object/${storageBucket}`, {
    method: "DELETE",
    headers: supabaseServiceHeaders,
    body: JSON.stringify({ prefixes }),
  });
}

export async function DELETE(request) {
  if (!requireAccountConfig()) return accountConfigMissing();

  if (!SUPABASE_SERVICE_KEY) {
    return NextResponse.json(
      { error: "Server-Schlüssel für Kontolöschung fehlt." },
      { status: 503 }
    );
  }

  const customerSession = await getCustomerSession(request);
  const user = customerSession.user;

  if (!user?.id || !user?.email) {
    const response = NextResponse.json(
      { error: "Bitte zuerst einloggen." },
      { status: 401 }
    );
    return applyCustomerSessionCookies(response, customerSession);
  }

  const body = await request.json().catch(() => ({}));

  if (body.confirm !== "LÖSCHEN") {
    const response = NextResponse.json(
      { error: "Bitte bestätige die Löschung mit LÖSCHEN." },
      { status: 400 }
    );
    return applyCustomerSessionCookies(response, customerSession);
  }

  const email = user.email.toLowerCase();
  const galleryResponse = await fetch(
    `${supabaseBaseUrl}/rest/v1/client_galleries?select=id&client_email=ilike.${encodeURIComponent(
      email
    )}&limit=200`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );
  const galleries = galleryResponse.ok
    ? await galleryResponse.json().catch(() => [])
    : [];
  const galleryIds = galleries.map((gallery) => gallery.id).filter(Boolean);

  if (galleryIds.length > 0) {
    const galleryIdFilter = galleryIds.map(encodeURIComponent).join(",");

    await bestEffortFetch(
      `${supabaseBaseUrl}/rest/v1/client_favorites?gallery_id=in.(${galleryIdFilter})`,
      {
        method: "DELETE",
        headers: {
          ...supabaseServiceHeaders,
          Prefer: "return=minimal",
        },
      }
    );
  }

  await bestEffortFetch(
    `${supabaseBaseUrl}/rest/v1/reviews?customer_user_id=eq.${encodeURIComponent(
      user.id
    )}`,
    {
      method: "DELETE",
      headers: {
        ...supabaseServiceHeaders,
        Prefer: "return=minimal",
      },
    }
  );

  await bestEffortFetch(
    `${supabaseBaseUrl}/rest/v1/client_galleries?client_email=ilike.${encodeURIComponent(
      email
    )}`,
    {
      method: "PATCH",
      headers: {
        ...supabaseServiceHeaders,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        client_email: null,
        client_name: null,
        welcome_message: "",
      }),
    }
  );

  await deleteAvatarFiles(user.id);

  const deleteUserResponse = await fetch(
    `${supabaseBaseUrl}/auth/v1/admin/users/${encodeURIComponent(user.id)}`,
    {
      method: "DELETE",
      headers: supabaseServiceHeaders,
    }
  );

  if (!deleteUserResponse.ok) {
    const response = NextResponse.json(
      {
        error: "Konto konnte nicht vollständig gelöscht werden.",
        details: await deleteUserResponse.text(),
      },
      { status: 500 }
    );
    return applyCustomerSessionCookies(response, customerSession);
  }

  return clearCustomerCookies(
    NextResponse.json({
      ok: true,
      removedGalleryLinks: galleryIds.length,
    })
  );
}
