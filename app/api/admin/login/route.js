import { NextResponse } from "next/server";
import {
  applyNoStore,
  hasAdminConfig,
  isAdminPassword,
  setAdminCookie,
} from "../_lib/auth";

const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
const loginAttempts = new Map();

function getClientKey(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function getAttemptState(key) {
  const now = Date.now();
  const current = loginAttempts.get(key);

  if (!current || current.resetAt <= now) {
    return { count: 0, resetAt: now + LOGIN_WINDOW_MS };
  }

  return current;
}

function rememberFailedAttempt(key) {
  const current = getAttemptState(key);
  loginAttempts.set(key, {
    count: current.count + 1,
    resetAt: current.resetAt,
  });
}

export async function POST(request) {
  try {
    if (!hasAdminConfig()) {
      return NextResponse.json(
        { error: "Admin-Login ist noch nicht konfiguriert." },
        { status: 503 }
      );
    }

    const clientKey = getClientKey(request);
    const attemptState = getAttemptState(clientKey);

    if (attemptState.count >= MAX_FAILED_ATTEMPTS) {
      return applyNoStore(
        NextResponse.json(
          {
            error:
              "Zu viele falsche Login-Versuche. Bitte warte ein paar Minuten.",
          },
          { status: 429 }
        )
      );
    }

    const { password } = await request.json();

    if (!isAdminPassword(String(password || ""))) {
      rememberFailedAttempt(clientKey);
      return applyNoStore(
        NextResponse.json(
          { error: "Passwort ist falsch." },
          { status: 401 }
        )
      );
    }

    loginAttempts.delete(clientKey);
    const response = NextResponse.json({ ok: true });
    return setAdminCookie(response);
  } catch (error) {
    console.error("Admin login failed:", error);
    return applyNoStore(
      NextResponse.json(
        {
          error: "Login konnte nicht verarbeitet werden.",
        },
        { status: 500 }
      )
    );
  }
}
