import { NextResponse } from "next/server";
import { applyNoStore, clearAdminCookie } from "../_lib/auth";

export async function POST() {
  const response = applyNoStore(NextResponse.json({ ok: true }));
  return clearAdminCookie(response);
}
