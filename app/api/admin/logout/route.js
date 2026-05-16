import { NextResponse } from "next/server";
import { clearAdminCookie } from "../_lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  return clearAdminCookie(response);
}

