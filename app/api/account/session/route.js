import { NextResponse } from "next/server";
import { getCustomerUser } from "../_lib/auth";

export async function GET(request) {
  const user = await getCustomerUser(request);

  return NextResponse.json({
    authenticated: Boolean(user),
    user,
  });
}
