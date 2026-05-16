import { NextResponse } from "next/server";
import { hasAdminConfig, isAdminAuthenticated } from "../_lib/auth";

export async function GET() {
  return NextResponse.json({
    configured: hasAdminConfig(),
    authenticated: await isAdminAuthenticated(),
  });
}

