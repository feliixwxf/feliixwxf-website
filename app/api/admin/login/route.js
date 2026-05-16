import { NextResponse } from "next/server";
import {
  hasAdminConfig,
  isAdminPassword,
  setAdminCookie,
} from "../_lib/auth";

export async function POST(request) {
  try {
    if (!hasAdminConfig()) {
      return NextResponse.json(
        { error: "Admin-Login ist noch nicht konfiguriert." },
        { status: 503 }
      );
    }

    const { password } = await request.json();

    if (!isAdminPassword(String(password || ""))) {
      return NextResponse.json(
        { error: "Passwort ist falsch." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });
    return setAdminCookie(response);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Login konnte nicht verarbeitet werden.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

