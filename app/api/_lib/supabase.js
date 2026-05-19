const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const supabaseBaseUrl = SUPABASE_URL
  ? SUPABASE_URL.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "")
  : "";

export const supabaseHeaders = {
  apikey: SUPABASE_ANON_KEY || SUPABASE_KEY || "",
  Authorization: `Bearer ${SUPABASE_ANON_KEY || SUPABASE_KEY || ""}`,
  "Content-Type": "application/json",
};

export const supabaseServiceHeaders = {
  apikey: SUPABASE_SERVICE_KEY || SUPABASE_KEY || "",
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY || SUPABASE_KEY || ""}`,
  "Content-Type": "application/json",
};

export const storageBucket =
  process.env.SUPABASE_STORAGE_BUCKET || "portfolio";
