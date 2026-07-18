import { NextResponse } from "next/server";
import { logAdminActivity } from "../_lib/activity";
import { isAdminAuthenticated } from "../_lib/auth";
import {
  hasSupabaseConfig,
  supabaseRestUrl,
  supabaseServiceHeaders,
} from "../_lib/supabase";

const RESOURCES = {
  documents: {
    table: "admin_documents",
    select:
      "id,type,title,client_name,client_email,amount,status,event_date,content,created_at,updated_at",
    order: "updated_at.desc",
    label: "Dokument",
    activityTarget: "admin_document",
  },
  appointments: {
    table: "admin_appointments",
    select:
      "id,title,client_name,client_email,phone,location,starts_at,ends_at,status,notes,created_at,updated_at",
    order: "starts_at.asc",
    label: "Termin",
    activityTarget: "admin_appointment",
  },
  waitlist: {
    table: "admin_waitlist",
    select:
      "id,name,email,phone,interest,desired_period,status,notes,created_at,updated_at",
    order: "created_at.desc",
    label: "Warteliste",
    activityTarget: "admin_waitlist",
  },
};

function unauthorized() {
  return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
}

function missingConfig() {
  return NextResponse.json(
    { error: "Supabase ist noch nicht konfiguriert." },
    { status: 503 }
  );
}

function getResource(value) {
  return RESOURCES[String(value || "").trim()] || null;
}

function text(value, maxLength = 5000) {
  return String(value || "").trim().slice(0, maxLength);
}

function nullableText(value, maxLength = 5000) {
  const cleaned = text(value, maxLength);
  return cleaned || null;
}

function nullableDate(value) {
  const cleaned = text(value, 80);
  if (!cleaned) return null;

  const date = new Date(cleaned);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

function numberOrNull(value) {
  const parsed = Number(String(value || "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizePayload(resourceKey, payload) {
  if (resourceKey === "documents") {
    return {
      type: text(payload.type, 30) || "contract",
      title: text(payload.title, 160) || "Neues Dokument",
      client_name: nullableText(payload.client_name, 160),
      client_email: nullableText(payload.client_email, 220),
      amount: numberOrNull(payload.amount),
      status: text(payload.status, 40) || "draft",
      event_date: nullableDate(payload.event_date),
      content: text(payload.content, 20000),
      updated_at: new Date().toISOString(),
    };
  }

  if (resourceKey === "appointments") {
    return {
      title: text(payload.title, 160) || "Neuer Termin",
      client_name: nullableText(payload.client_name, 160),
      client_email: nullableText(payload.client_email, 220),
      phone: nullableText(payload.phone, 80),
      location: nullableText(payload.location, 220),
      starts_at: nullableDate(payload.starts_at),
      ends_at: nullableDate(payload.ends_at),
      status: text(payload.status, 40) || "planned",
      notes: nullableText(payload.notes, 6000),
      updated_at: new Date().toISOString(),
    };
  }

  return {
    name: text(payload.name, 160) || "Ohne Namen",
    email: nullableText(payload.email, 220),
    phone: nullableText(payload.phone, 80),
    interest: nullableText(payload.interest, 160),
    desired_period: nullableText(payload.desired_period, 160),
    status: text(payload.status, 40) || "open",
    notes: nullableText(payload.notes, 6000),
    updated_at: new Date().toISOString(),
  };
}

async function fetchResource(resourceKey) {
  const resource = RESOURCES[resourceKey];
  const url = `${supabaseRestUrl}/rest/v1/${resource.table}?select=${resource.select}&order=${resource.order}&limit=200`;

  const response = await fetch(url, {
    headers: supabaseServiceHeaders,
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      ok: false,
      error: await response.text(),
    };
  }

  return {
    ok: true,
    data: await response.json(),
  };
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();
  if (!hasSupabaseConfig) return missingConfig();

  const [documents, appointments, waitlist] = await Promise.all([
    fetchResource("documents"),
    fetchResource("appointments"),
    fetchResource("waitlist"),
  ]);

  const failed = [
    documents.ok ? null : documents.error,
    appointments.ok ? null : appointments.error,
    waitlist.ok ? null : waitlist.error,
  ].filter(Boolean);

  if (failed.length > 0) {
    return NextResponse.json(
      {
        error:
          "Verträge & Termine konnten nicht geladen werden. Bitte supabase-contracts-schedule.sql in Supabase ausführen.",
        details: failed.join("\n"),
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    documents: documents.data,
    appointments: appointments.data,
    waitlist: waitlist.data,
  });
}

export async function POST(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  if (!hasSupabaseConfig) return missingConfig();

  const payload = await request.json().catch(() => ({}));
  const resourceKey = String(payload.resource || "").trim();
  const resource = getResource(resourceKey);

  if (!resource) {
    return NextResponse.json({ error: "Bereich fehlt." }, { status: 400 });
  }

  const body = normalizePayload(resourceKey, payload);

  const response = await fetch(`${supabaseRestUrl}/rest/v1/${resource.table}`, {
    method: "POST",
    headers: {
      ...supabaseServiceHeaders,
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      { error: `${resource.label} konnte nicht gespeichert werden.`, details },
      { status: 500 }
    );
  }

  const [item] = await response.json();

  await logAdminActivity({
    action: `${resourceKey}_created`,
    targetType: resource.activityTarget,
    targetId: item?.id,
    label: item?.title || item?.name || resource.label,
  });

  return NextResponse.json({ item });
}

export async function PATCH(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  if (!hasSupabaseConfig) return missingConfig();

  const payload = await request.json().catch(() => ({}));
  const id = text(payload.id, 80);
  const resourceKey = String(payload.resource || "").trim();
  const resource = getResource(resourceKey);

  if (!resource || !id) {
    return NextResponse.json(
      { error: "Bereich oder Eintrag fehlt." },
      { status: 400 }
    );
  }

  const body = normalizePayload(resourceKey, payload);
  const response = await fetch(
    `${supabaseRestUrl}/rest/v1/${resource.table}?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        ...supabaseServiceHeaders,
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      { error: `${resource.label} konnte nicht aktualisiert werden.`, details },
      { status: 500 }
    );
  }

  const [item] = await response.json();

  await logAdminActivity({
    action: `${resourceKey}_updated`,
    targetType: resource.activityTarget,
    targetId: id,
    label: item?.title || item?.name || resource.label,
  });

  return NextResponse.json({ item });
}

export async function DELETE(request) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  if (!hasSupabaseConfig) return missingConfig();

  const payload = await request.json().catch(() => ({}));
  const id = text(payload.id, 80);
  const resourceKey = String(payload.resource || "").trim();
  const resource = getResource(resourceKey);

  if (!resource || !id) {
    return NextResponse.json(
      { error: "Bereich oder Eintrag fehlt." },
      { status: 400 }
    );
  }

  const response = await fetch(
    `${supabaseRestUrl}/rest/v1/${resource.table}?id=eq.${encodeURIComponent(id)}`,
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
      { error: `${resource.label} konnte nicht gelöscht werden.`, details },
      { status: 500 }
    );
  }

  await logAdminActivity({
    action: `${resourceKey}_deleted`,
    targetType: resource.activityTarget,
    targetId: id,
    label: `${resource.label} gelöscht`,
  });

  return NextResponse.json({ ok: true });
}
