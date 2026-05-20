import { NextResponse } from "next/server";
import {
  applyCustomerSessionCookies,
  getCustomerSession,
} from "../_lib/auth";

export async function GET(request) {
  const customerSession = await getCustomerSession(request);

  const response = NextResponse.json({
    authenticated: Boolean(customerSession.user),
    user: customerSession.user,
  });

  return applyCustomerSessionCookies(response, customerSession);
}
