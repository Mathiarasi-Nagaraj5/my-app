import { NextResponse } from "next/server";
import crypto from "crypto";
import { getGoogleAuthUrl } from "@/app/lib/auth/google";

const STATE_COOKIE_NAME = "google_oauth_state";

// GET /api/auth/google?next=/orders (optional redirect target after login)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const next = searchParams.get("next") || "/";

  // CSRF protection: a random state value, stored in a short-lived cookie,
  // and checked again in the callback — prevents a crafted redirect from
  // completing someone else's OAuth flow.
  const state = crypto.randomBytes(16).toString("hex");

  const response = NextResponse.redirect(getGoogleAuthUrl(state));
  response.cookies.set(STATE_COOKIE_NAME, JSON.stringify({ state, next }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes — plenty for the user to complete the Google flow
  });

  return response;
}