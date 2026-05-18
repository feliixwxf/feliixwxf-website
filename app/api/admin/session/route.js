import { NextResponse } from "next/server";
import {
  applyNoStore,
  hasAdminConfig,
  isAdminAuthenticated,
} from "../_lib/auth";

export async function GET() {
  return applyNoStore(
    NextResponse.json({
      configured: hasAdminConfig(),
      authenticated: await isAdminAuthenticated(),
    })
  );
}
