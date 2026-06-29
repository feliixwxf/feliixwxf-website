import { NextResponse } from "next/server";
import {
  hasSupabaseServiceConfig,
  supabaseBaseUrl,
  supabaseServiceHeaders,
} from "../_lib/supabase";

const MAX_ERROR_REPORTS_PER_MINUTE = 12;
const reporterHits = new Map();

function getClientKey(request) {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  return forwardedFor.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(request) {
  const key = getClientKey(request);
  const now = Date.now();
  const windowStart = now - 60_000;
  const hits = (reporterHits.get(key) || []).filter((time) => time > windowStart);

  if (hits.length >= MAX_ERROR_REPORTS_PER_MINUTE) {
    reporterHits.set(key, hits);
    return true;
  }

  hits.push(now);
  reporterHits.set(key, hits);
  return false;
}

function cleanText(value, maxLength) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export async function POST(request) {
  if (!hasSupabaseServiceConfig) {
    return NextResponse.json({ error: "Fehlerprotokoll ist nicht konfiguriert." }, { status: 503 });
  }

  if (isRateLimited(request)) {
    return NextResponse.json({ error: "Bitte später erneut versuchen." }, { status: 429 });
  }

  const data = await request.json().catch(() => ({}));
  const message = cleanText(data.message, 500);

  if (!message) {
    return NextResponse.json({ error: "Fehlermeldung fehlt." }, { status: 400 });
  }

  const payload = {
    type: cleanText(data.type || "client", 80),
    page: cleanText(data.page, 300),
    message,
    source: cleanText(data.source, 200),
    stack: cleanText(data.stack, 1600),
    user_agent: cleanText(request.headers.get("user-agent"), 500),
  };

  const response = await fetch(`${supabaseBaseUrl}/rest/v1/user_error_logs`, {
    method: "POST",
    headers: {
      ...supabaseServiceHeaders,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  }).catch(() => null);

  if (!response?.ok) {
    return NextResponse.json(
      { error: "Fehler konnte nicht gespeichert werden." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
