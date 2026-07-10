import { NextResponse } from "next/server";
import {
  hasSupabaseServiceConfig,
  supabaseBaseUrl,
  supabaseServiceHeaders,
} from "../_lib/supabase";

const MAX_CONTACT_REQUESTS_PER_MINUTE = 5;
const contactHits = new Map();

function getClientKey(request) {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  return forwardedFor.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(request) {
  const key = getClientKey(request);
  const now = Date.now();
  const windowStart = now - 60_000;
  const hits = (contactHits.get(key) || []).filter((time) => time > windowStart);

  if (hits.length >= MAX_CONTACT_REQUESTS_PER_MINUTE) {
    contactHits.set(key, hits);
    return true;
  }

  hits.push(now);
  contactHits.set(key, hits);
  return false;
}

function cleanText(value, maxLength) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanMessage(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, 3000);
}

export async function POST(request) {
  if (!hasSupabaseServiceConfig) {
    return NextResponse.json(
      { error: "Kontaktanfragen sind noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  if (isRateLimited(request)) {
    return NextResponse.json(
      { error: "Bitte warte kurz und versuche es dann erneut." },
      { status: 429 }
    );
  }

  const data = await request.json().catch(() => ({}));
  const name = cleanText(data.name, 160);
  const email = cleanText(data.email, 240).toLowerCase();
  const phone = cleanText(data.phone, 80);
  const message = cleanMessage(data.message);

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, E-Mail und Nachricht sind erforderlich." },
      { status: 400 }
    );
  }

  if (!email.includes("@") || email.length < 5) {
    return NextResponse.json(
      { error: "Bitte gib eine gültige E-Mail-Adresse ein." },
      { status: 400 }
    );
  }

  const payload = {
    name,
    email,
    phone: phone || null,
    message,
    status: "new",
    source: cleanText(data.source || "Kontaktformular", 120),
    user_agent: cleanText(request.headers.get("user-agent"), 500),
  };

  const response = await fetch(`${supabaseBaseUrl}/rest/v1/contact_inquiries`, {
    method: "POST",
    headers: {
      ...supabaseServiceHeaders,
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  }).catch(() => null);

  if (!response?.ok) {
    const details = await response?.text().catch(() => "");
    return NextResponse.json(
      {
        error:
          "Kontaktanfrage konnte nicht gespeichert werden. Bitte versuche es erneut oder schreibe direkt per E-Mail.",
        details,
      },
      { status: 500 }
    );
  }

  const [inquiry] = await response.json();
  return NextResponse.json({ ok: true, inquiry });
}
