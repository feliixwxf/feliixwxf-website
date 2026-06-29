import { NextResponse } from "next/server";
import { logAdminActivity } from "../_lib/activity";
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
    `${supabaseRestUrl}/rest/v1/reviews?select=id,name,text,stars,avatar_url,customer_user_id,account_deleted_at,is_approved,created_at&order=created_at.desc&limit=200`,
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
      responseDetails.toLowerCase().includes("customer_user_id") ||
      responseDetails.toLowerCase().includes("account_deleted_at")
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

  const payload = await request.json();
  const { id, is_approved } = payload;
  const hasApprovalChange = typeof is_approved === "boolean";
  const hasAvatarChange = Object.prototype.hasOwnProperty.call(
    payload,
    "avatar_url"
  );

  if (!id || (!hasApprovalChange && !hasAvatarChange)) {
    return NextResponse.json(
      { error: "Bewertungs-ID oder Änderung fehlt." },
      { status: 400 }
    );
  }

  const updatePayload = {};

  if (hasApprovalChange) {
    updatePayload.is_approved = is_approved;
  }

  if (hasAvatarChange) {
    updatePayload.avatar_url =
      typeof payload.avatar_url === "string" && payload.avatar_url.trim()
        ? payload.avatar_url.trim()
        : null;
  }

  const response = await fetch(
    `${supabaseRestUrl}/rest/v1/reviews?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        ...supabaseServiceHeaders,
        Prefer: "return=representation",
      },
      body: JSON.stringify(updatePayload),
    }
  );

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      { error: "Bewertungsstatus konnte nicht geändert werden.", details },
      { status: 500 }
    );
  }

  const [review] = await response.json();
  await logAdminActivity({
    action: hasApprovalChange
      ? is_approved
        ? "Bewertung freigegeben"
        : "Bewertung ausgeblendet"
      : "Bewertungs-Avatar gespeichert",
    targetType: "review",
    targetId: review.id,
    label: review.name || "",
  });
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
      { error: "Bewertung konnte nicht gelöscht werden.", details },
      { status: 500 }
    );
  }

  await logAdminActivity({
    action: "Bewertung gelöscht",
    targetType: "review",
    targetId: id,
  });

  return NextResponse.json({ ok: true });
}
