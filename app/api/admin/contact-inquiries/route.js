import { NextResponse } from "next/server";
import { logAdminActivity } from "../_lib/activity";
import { isAdminAuthenticated } from "../_lib/auth";
import {
  hasSupabaseConfig,
  supabaseRestUrl,
  supabaseServiceHeaders,
} from "../_lib/supabase";

const VALID_STATUSES = new Set(["new", "answered"]);

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
    `${supabaseRestUrl}/rest/v1/contact_inquiries?select=id,name,email,phone,message,status,source,user_agent,created_at,answered_at&order=created_at.desc&limit=150`,
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
          "Kontaktanfragen konnten nicht geladen werden. Bitte supabase-contact-inquiries.sql in Supabase ausführen.",
        details,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ inquiries: await response.json() });
}

export async function PATCH(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Supabase ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const payload = await request.json().catch(() => ({}));
  const id = String(payload.id || "").trim();
  const status = String(payload.status || "").trim();

  if (!id || !VALID_STATUSES.has(status)) {
    return NextResponse.json(
      { error: "Kontaktanfrage oder Status fehlt." },
      { status: 400 }
    );
  }

  const response = await fetch(
    `${supabaseRestUrl}/rest/v1/contact_inquiries?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        ...supabaseServiceHeaders,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        status,
        answered_at: status === "answered" ? new Date().toISOString() : null,
      }),
    }
  );

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      { error: "Kontaktstatus konnte nicht gespeichert werden.", details },
      { status: 500 }
    );
  }

  const [inquiry] = await response.json();

  await logAdminActivity({
    action: status === "answered" ? "contact_answered" : "contact_reopened",
    targetType: "contact_inquiry",
    targetId: id,
    label: inquiry?.email || inquiry?.name || "Kontaktanfrage",
  });

  return NextResponse.json({ inquiry });
}

export async function DELETE(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Supabase ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const payload = await request.json().catch(() => ({}));
  const id = String(payload.id || "").trim();

  if (!id) {
    return NextResponse.json(
      { error: "Kontaktanfrage fehlt." },
      { status: 400 }
    );
  }

  const response = await fetch(
    `${supabaseRestUrl}/rest/v1/contact_inquiries?id=eq.${encodeURIComponent(id)}`,
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
      { error: "Kontaktanfrage konnte nicht gelöscht werden.", details },
      { status: 500 }
    );
  }

  await logAdminActivity({
    action: "contact_deleted",
    targetType: "contact_inquiry",
    targetId: id,
    label: "Kontaktanfrage gelöscht",
  });

  return NextResponse.json({ ok: true });
}
