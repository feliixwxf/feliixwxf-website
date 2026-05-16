import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const headers = {
  apikey: SUPABASE_KEY || "",
  Authorization: `Bearer ${SUPABASE_KEY || ""}`,
  "Content-Type": "application/json",
};

const isConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

function cleanReview(review) {
  const name = String(review?.name || "").trim().slice(0, 60);
  const text = String(review?.text || "").trim().slice(0, 600);
  const stars = Number(review?.stars || 5);

  return {
    name,
    text,
    stars: Math.min(5, Math.max(0.5, stars)),
  };
}

export async function GET() {
  if (!isConfigured) {
    return NextResponse.json({ reviews: [] });
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/reviews?select=name,text,stars,created_at&order=created_at.desc&limit=50`,
    {
      headers,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Could not load reviews:", error);
    return NextResponse.json({ reviews: [] }, { status: 200 });
  }

  const reviews = await response.json();
  return NextResponse.json({ reviews });
}

export async function POST(request) {
  const review = cleanReview(await request.json());

  if (!review.name || !review.text) {
    return NextResponse.json(
      { error: "Name und Text sind erforderlich." },
      { status: 400 }
    );
  }

  if (!isConfigured) {
    return NextResponse.json(
      { error: "Online-Speicher ist noch nicht konfiguriert." },
      { status: 503 }
    );
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
    method: "POST",
    headers: {
      ...headers,
      Prefer: "return=representation",
    },
    body: JSON.stringify(review),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Could not save review:", error);

    return NextResponse.json(
      { error: "Bewertung konnte nicht gespeichert werden." },
      { status: 500 }
    );
  }

  const [savedReview] = await response.json();
  return NextResponse.json({ review: savedReview });
}
