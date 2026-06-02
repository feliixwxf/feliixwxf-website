import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../_lib/auth";
import {
  hasSupabaseServiceConfig,
  supabaseRestUrl,
  supabaseServiceHeaders,
} from "../_lib/supabase";

function unauthorized() {
  return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function getDisplayName(user) {
  const metadata = user.user_metadata || {};

  return (
    metadata.username ||
    metadata.display_name ||
    metadata.full_name ||
    metadata.name ||
    ""
  );
}

export async function GET(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseServiceConfig) {
    return NextResponse.json(
      { error: "Supabase Service-Key fehlt für die Kundensuche." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const emailSearch = normalize(searchParams.get("email"));

  try {
    const response = await fetch(
      `${supabaseRestUrl}/auth/v1/admin/users?per_page=1000`,
      {
        headers: supabaseServiceHeaders,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Kundenkonten konnten nicht geladen werden.",
          details: await response.text(),
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const users = Array.isArray(data.users) ? data.users : [];
    const accounts = users
      .map((user) => ({
        id: user.id,
        email: normalize(user.email),
        name: getDisplayName(user),
        created_at: user.created_at || "",
        last_sign_in_at: user.last_sign_in_at || "",
        email_confirmed_at: user.email_confirmed_at || "",
      }))
      .filter((account) => account.email)
      .filter((account) =>
        emailSearch ? account.email.includes(emailSearch) : true
      )
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 25);

    return NextResponse.json({ accounts });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Kundenkonten konnten nicht gesucht werden.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
