import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../_lib/auth";
import { logAdminActivity } from "../_lib/activity";
import {
  hasSupabaseServiceConfig,
  supabaseRestUrl,
  supabaseServiceHeaders,
} from "../_lib/supabase";

function unauthorized() {
  return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseServiceConfig) {
    return NextResponse.json(
      { error: "Supabase Service Role Key fehlt." },
      { status: 503 }
    );
  }

  const response = await fetch(
    `${supabaseRestUrl}/rest/v1/user_error_logs?select=id,type,page,message,source,stack,user_agent,is_resolved,created_at&order=created_at.desc&limit=80`,
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
          "Nutzerfehler konnten nicht geladen werden. Bitte supabase-security-hardening.sql erneut ausführen.",
        details,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ errors: await response.json() });
}

export async function PATCH(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseServiceConfig) {
    return NextResponse.json(
      { error: "Supabase Service Role Key fehlt." },
      { status: 503 }
    );
  }

  const { id, isResolved } = await request.json().catch(() => ({}));

  if (!id) {
    return NextResponse.json({ error: "Fehler-ID fehlt." }, { status: 400 });
  }

  const response = await fetch(
    `${supabaseRestUrl}/rest/v1/user_error_logs?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        ...supabaseServiceHeaders,
        Prefer: "return=representation",
      },
      body: JSON.stringify({ is_resolved: Boolean(isResolved) }),
    }
  );

  const data = await response.json().catch(() => []);

  if (!response.ok) {
    return NextResponse.json(
      { error: "Fehlerstatus konnte nicht gespeichert werden." },
      { status: 500 }
    );
  }

  return NextResponse.json({ errorLog: data[0] || null });
}

export async function DELETE(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseServiceConfig) {
    return NextResponse.json(
      { error: "Supabase Service Role Key fehlt." },
      { status: 503 }
    );
  }

  const { id } = await request.json().catch(() => ({}));

  if (!id) {
    return NextResponse.json({ error: "Fehler-ID fehlt." }, { status: 400 });
  }

  const response = await fetch(
    `${supabaseRestUrl}/rest/v1/user_error_logs?id=eq.${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: {
        ...supabaseServiceHeaders,
        Prefer: "return=representation",
      },
    }
  );

  const data = await response.json().catch(() => []);

  if (!response.ok) {
    return NextResponse.json(
      { error: "Nutzerfehler konnte nicht gelöscht werden." },
      { status: 500 }
    );
  }

  await logAdminActivity({
    action: "delete",
    targetType: "user_error",
    targetId: id,
    label: data[0]?.source || data[0]?.page || "Nutzerfehler gelöscht",
  });

  return NextResponse.json({ ok: true });
}
