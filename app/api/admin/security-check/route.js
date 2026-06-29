import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "../_lib/auth";
import {
  clientGalleryStorageBucket,
  hasSupabaseConfig,
  hasSupabaseServiceConfig,
  storageBucket,
  supabaseRestUrl,
  supabaseServiceHeaders,
} from "../_lib/supabase";

const REQUIRED_TABLES = [
  "reviews",
  "portfolio_images",
  "site_settings",
  "site_assets",
  "client_galleries",
  "client_gallery_images",
  "client_favorites",
  "admin_activity_logs",
];

function unauthorized() {
  return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
}

async function checkTable(table) {
  try {
    const response = await fetch(
      `${supabaseRestUrl}/rest/v1/${table}?select=*&limit=1`,
      {
        headers: supabaseServiceHeaders,
        cache: "no-store",
      }
    );

    return {
      key: `table-${table}`,
      label: `Tabelle ${table}`,
      ok: response.ok,
      detail: response.ok
        ? "Erreichbar"
        : (await response.text()).slice(0, 180),
    };
  } catch (error) {
    return {
      key: `table-${table}`,
      label: `Tabelle ${table}`,
      ok: false,
      detail: error.message,
    };
  }
}

async function checkBucket(bucket, expectedPublic) {
  try {
    const response = await fetch(
      `${supabaseRestUrl}/storage/v1/bucket/${bucket}`,
      {
        headers: supabaseServiceHeaders,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return {
        key: `bucket-${bucket}`,
        label: `Bucket ${bucket}`,
        ok: false,
        detail: (await response.text()).slice(0, 180),
      };
    }

    const data = await response.json();
    const isPublic = Boolean(data.public);

    return {
      key: `bucket-${bucket}`,
      label: `Bucket ${bucket}`,
      ok: isPublic === expectedPublic,
      detail: isPublic
        ? "Öffentlich"
        : "Privat",
    };
  } catch (error) {
    return {
      key: `bucket-${bucket}`,
      label: `Bucket ${bucket}`,
      ok: false,
      detail: error.message,
    };
  }
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const checks = [
    {
      key: "supabase-url",
      label: "Supabase URL",
      ok: hasSupabaseConfig,
      detail: hasSupabaseConfig ? "Vorhanden" : "Fehlt in Vercel",
    },
    {
      key: "service-role",
      label: "Service Role Key",
      ok: hasSupabaseServiceConfig,
      detail: hasSupabaseServiceConfig
        ? "Serverseitig vorhanden"
        : "SUPABASE_SERVICE_ROLE_KEY fehlt",
    },
  ];

  if (!hasSupabaseConfig || !hasSupabaseServiceConfig) {
    return NextResponse.json({ checks });
  }

  const [portfolioBucket, clientBucket, ...tableChecks] = await Promise.all([
    checkBucket(storageBucket, true),
    checkBucket(clientGalleryStorageBucket, false),
    ...REQUIRED_TABLES.map((table) => checkTable(table)),
  ]);

  return NextResponse.json({
    checks: [...checks, portfolioBucket, clientBucket, ...tableChecks],
  });
}
