import { NextResponse } from "next/server";
import { clearCustomerCookies } from "../_lib/auth";

export async function POST() {
  return clearCustomerCookies(NextResponse.json({ ok: true }));
}
