import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../_lib/auth";
import {
  hasSupabaseConfig,
  supabaseServiceHeaders,
  supabaseRestUrl,
} from "../_lib/supabase";

function unauthorized() {
  return NextResponse.json(
    { error: "Nicht eingeloggt." },
    { status: 401 }
  );
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Supabase ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  let response = await fetch(
    `${supabaseRestUrl}/rest/v1/reviews?select=id,name,text,stars,avatar_url,customer_user_id,is_approved,created_at&order=created_at.desc&limit=200`,
    {
      headers: supabaseServiceHeaders,
      cache: "no-store",
    }
  );

  let responseDetails = "";

  if (!response.ok) {
    responseDetails = await response.text();

    if (
      responseDetails.toLowerCase().includes("avatar_url") ||
      responseDetails.toLowerCase().includes("customer_user_id")
    ) {
      response = await fetch(
        `${supabaseRestUrl}/rest/v1/reviews?select=id,name,text,stars,is_approved,created_at&order=created_at.desc&limit=200`,
        {
          headers: supabaseServiceHeaders,
          cache: "no-store",
        }
      );
    }
  }

  if (!response.ok) {
    const details = responseDetails || (await response.text());
    return NextResponse.json(
      { error: "Bewertungen konnten nicht geladen werden.", details },
      { status: 500 }
    );
  }

  return NextResponse.json({ reviews: await response.json() });
}

export async function PATCH(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Supabase ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const { id, is_approved } = await request.json();

  if (!id || typeof is_approved !== "boolean") {
    return NextResponse.json(
      { error: "Bewertungs-ID oder Status fehlt." },
      { status: 400 }
    );
  }

  const response = await fetch(
    `${supabaseRestUrl}/rest/v1/reviews?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        ...supabaseServiceHeaders,
        Prefer: "return=representation",
      },
      body: JSON.stringify({ is_approved }),
    }
  );

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      { error: "Bewertungsstatus konnte nicht geaendert werden.", details },
      { status: 500 }
    );
  }

  const [review] = await response.json();
  return NextResponse.json({ review });
}

export async function DELETE(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  if (!hasSupabaseConfig) {
    return NextResponse.json(
      { error: "Supabase ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json(
      { error: "Bewertungs-ID fehlt." },
      { status: 400 }
    );
  }

  const response = await fetch(
    `${supabaseRestUrl}/rest/v1/reviews?id=eq.${encodeURIComponent(id)}`,
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
      { error: "Bewertung konnte nicht geloescht werden.", details },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
