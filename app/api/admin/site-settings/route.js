import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../_lib/auth";
import {
  hasSupabaseConfig,
  supabaseRestUrl,
  supabaseServiceHeaders,
} from "../_lib/supabase";

const SETTING_KEYS = new Set([
  "contact_heading",
  "contact_intro",
  "contact_email",
  "contact_phone",
  "instagram_url",
  "instagram_label",
  "form_action",
]);

function unauthorized() {
  return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
}

async function loadSettings() {
  const response = await fetch(
    `${supabaseRestUrl}/rest/v1/site_settings?select=key,value,updated_at`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const details = await response.text();
    return { error: details };
  }

  const rows = await response.json();

  return {
    settings: Object.fromEntries(rows.map((setting) => [setting.key, setting.value])),
  };
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Supabase ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const result = await loadSettings();

  if (result.error) {
    return NextResponse.json(
      {
        error:
          "Kontaktinfos konnten nicht geladen werden. Fehlt die Tabelle site_settings?",
        details: result.error,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ settings: result.settings });
}

export async function PUT(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Supabase ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const body = await request.json();
  const settings = body?.settings || {};
  const rows = Object.entries(settings)
    .filter(([key]) => SETTING_KEYS.has(key))
    .map(([key, value]) => ({
      key,
      value: String(value || "").trim(),
      updated_at: new Date().toISOString(),
    }));

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Keine gueltigen Kontaktfelder gefunden." },
      { status: 400 }
    );
  }

  const response = await fetch(`${supabaseRestUrl}/rest/v1/site_settings`, {
    method: "POST",
    headers: {
      ...supabaseServiceHeaders,
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(rows),
  });

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      {
        error:
          "Kontaktinfos konnten nicht gespeichert werden. Fehlt die Tabelle site_settings?",
        details,
      },
      { status: 500 }
    );
  }

  const savedRows = await response.json();
  const savedSettings = Object.fromEntries(
    savedRows.map((setting) => [setting.key, setting.value])
  );

  return NextResponse.json({ settings: savedSettings });
}
