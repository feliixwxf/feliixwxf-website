import { NextResponse } from "next/server";
import {
  applyCustomerSessionCookies,
  getCustomerSession,
} from "../account/_lib/auth";

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_KEY_SOURCE = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? "SUPABASE_SERVICE_ROLE_KEY"
  : process.env.SUPABASE_ANON_KEY
    ? "SUPABASE_ANON_KEY"
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? "NEXT_PUBLIC_SUPABASE_ANON_KEY"
      : "missing";
const REVIEW_NOTIFICATION_ENDPOINT =
  process.env.REVIEW_NOTIFICATION_ENDPOINT ||
  process.env.FORMSPREE_ENDPOINT ||
  "https://formspree.io/f/xqennvyy";

const headers = {
  apikey: SUPABASE_KEY || "",
  Authorization: `Bearer ${SUPABASE_KEY || ""}`,
  "Content-Type": "application/json",
};

const isConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
const supabaseRestUrl = SUPABASE_URL
  ? SUPABASE_URL.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "")
  : "";

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

async function fetchReviews(select) {
  const response = await fetch(
    `${supabaseRestUrl}/rest/v1/reviews?select=${select}&is_approved=eq.true&order=created_at.desc&limit=50`,
    {
      headers,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return { response, reviews: null, details: await response.text() };
  }

  return { response, reviews: await response.json(), details: "" };
}

async function notifyNewReview(review, user) {
  if (!REVIEW_NOTIFICATION_ENDPOINT) return;

  try {
    const response = await fetch(REVIEW_NOTIFICATION_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        _subject: "Neue Bewertung auf feliix.wxf",
        source: "Website Bewertung",
        name: review.name,
        stars: `${review.stars}/5`,
        text: review.text,
        customer_email: user?.email || "Nicht eingeloggt",
        account_name: user?.name || "",
        submitted_at: new Date().toISOString(),
        note: "Die Bewertung ist noch nicht öffentlich und muss im Adminbereich freigegeben werden.",
      }),
    });

    if (!response.ok) {
      console.error("Review notification failed:", await response.text());
    }
  } catch (error) {
    console.error("Review notification failed:", error);
  }
}

export async function GET(request) {
  try {
    if (new URL(request.url).searchParams.get("debug") === "1") {
      let urlHost = "";
      let urlValid = false;

      try {
        urlHost = new URL(supabaseRestUrl).host;
        urlValid = true;
      } catch {
        urlValid = false;
      }

      return NextResponse.json({
        configured: isConfigured,
        hasUrl: Boolean(SUPABASE_URL),
        hasKey: Boolean(SUPABASE_KEY),
        keySource: SUPABASE_KEY_SOURCE,
        keyPrefix: SUPABASE_KEY?.slice(0, 3) || "",
        urlValid,
        urlHost,
      });
    }

    if (!isConfigured) {
      return NextResponse.json({ reviews: [] });
    }

    let result = await fetchReviews("name,text,stars,avatar_url,created_at");

    if (!result.response.ok && result.details.toLowerCase().includes("avatar_url")) {
      result = await fetchReviews("name,text,stars,created_at");
    }

    if (!result.response.ok) {
      console.error("Could not load reviews:", result.details);
      return NextResponse.json({ reviews: [] }, { status: 200 });
    }

    return NextResponse.json({ reviews: result.reviews || [] });
  } catch (error) {
    console.error("Review GET failed:", error);
    return NextResponse.json({ reviews: [] }, { status: 200 });
  }
}

export async function POST(request) {
  try {
    const customerSession = await getCustomerSession(request);
    const user = customerSession.user;
    const review = cleanReview(await request.json());
    const reviewPayload = {
      ...review,
      name: user?.name || review.name,
      is_approved: false,
    };

    if (user?.id) reviewPayload.customer_user_id = user.id;
    if (user?.avatar_url) reviewPayload.avatar_url = user.avatar_url;

    if (!reviewPayload.name || !reviewPayload.text) {
      const response = NextResponse.json(
        { error: "Name und Text sind erforderlich." },
        { status: 400 }
      );
      return applyCustomerSessionCookies(response, customerSession);
    }

    if (!isConfigured) {
      const response = NextResponse.json(
        { error: "Online-Speicher ist noch nicht konfiguriert." },
        { status: 503 }
      );
      return applyCustomerSessionCookies(response, customerSession);
    }

    let response = await fetch(`${supabaseRestUrl}/rest/v1/reviews`, {
      method: "POST",
      headers: {
        ...headers,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(reviewPayload),
    });

    if (!response.ok) {
      const error = await response.text();

      if (
        error.toLowerCase().includes("avatar_url") ||
        error.toLowerCase().includes("customer_user_id")
      ) {
        response = await fetch(`${supabaseRestUrl}/rest/v1/reviews`, {
          method: "POST",
          headers: {
            ...headers,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            name: reviewPayload.name,
            text: reviewPayload.text,
            stars: reviewPayload.stars,
            is_approved: false,
          }),
        });
      }

      if (response.ok) {
        await notifyNewReview(reviewPayload, user);

        const result = NextResponse.json({
          review: {
            ...reviewPayload,
            created_at: new Date().toISOString(),
          },
        });
        return applyCustomerSessionCookies(result, customerSession);
      }

      console.error("Could not save review:", error);

      const result = NextResponse.json(
        { error: "Bewertung konnte nicht gespeichert werden.", details: error },
        { status: 500 }
      );
      return applyCustomerSessionCookies(result, customerSession);
    }

    await notifyNewReview(reviewPayload, user);

    const result = NextResponse.json({
      review: {
        ...reviewPayload,
        created_at: new Date().toISOString(),
      },
    });
    return applyCustomerSessionCookies(result, customerSession);
  } catch (error) {
    console.error("Review POST failed:", error);
    return NextResponse.json(
      {
        error: "Bewertung konnte nicht verarbeitet werden.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
