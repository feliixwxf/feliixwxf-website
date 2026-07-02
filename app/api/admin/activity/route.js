import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../_lib/auth";
import {
  hasSupabaseConfig,
  supabaseRestUrl,
  supabaseServiceHeaders,
} from "../_lib/supabase";

function unauthorized() {
  return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Supabase ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const response = await fetch(
    `${supabaseRestUrl}/rest/v1/admin_activity_logs?select=id,action,target_type,target_id,label,created_at&order=created_at.desc&limit=80`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      {
        error:
          "Protokoll konnte nicht geladen werden. Bitte supabase-security-hardening.sql erneut ausführen.",
        details,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ logs: await response.json() });
}

export async function DELETE() {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Supabase ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const response = await fetch(
    `${supabaseRestUrl}/rest/v1/admin_activity_logs?id=not.is.null`,
    {
      method: "DELETE",
      headers: {
        ...supabaseServiceHeaders,
        Prefer: "return=minimal",
      },
    }
  );

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      {
        error:
          "Aktivitätsverlauf konnte nicht geleert werden. Bitte supabase-security-hardening.sql prüfen.",
        details,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
