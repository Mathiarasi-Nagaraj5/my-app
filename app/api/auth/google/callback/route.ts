import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectDB from "@/app/lib/mongodb";
import User from "@/app/models/User";
import { exchangeCodeForToken, fetchGoogleProfile } from "@/app/lib/auth/google";
import { signSession } from "@/app/lib/auth/session";
import { setSessionCookie } from "@/app/lib/auth/cookies";

const STATE_COOKIE_NAME = "google_oauth_state";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const error = searchParams.get("error");

  const cookieStore = await cookies();
  const stateCookieRaw = cookieStore.get(STATE_COOKIE_NAME)?.value;
  cookieStore.delete(STATE_COOKIE_NAME); // one-time use regardless of outcome

  const failRedirect = (reason: string) =>
    NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}`);

  if (error) {
    return failRedirect("google_denied");
  }
  if (!code || !returnedState || !stateCookieRaw) {
    return failRedirect("invalid_request");
  }

  let expectedState: string;
  let next: string;
  try {
    const parsed = JSON.parse(stateCookieRaw);
    expectedState = parsed.state;
    next = parsed.next || "/";
  } catch {
    return failRedirect("invalid_state");
  }

  if (returnedState !== expectedState) {
    return failRedirect("state_mismatch");
  }

  try {
    const tokens = await exchangeCodeForToken(code);
    const profile = await fetchGoogleProfile(tokens.access_token);

    if (!profile.email_verified) {
      return failRedirect("email_not_verified");
    }

    await connectDB();

    // Match by googleId first (returning Google user), then by email
    // (an existing credentials account signing in with Google for the
    // first time — link the accounts rather than creating a duplicate).
    let user = await User.findOne({ googleId: profile.sub });

    if (!user) {
      user = await User.findOne({ email: profile.email.toLowerCase() });
      if (user) {
        // Link: an account with this email already exists (likely
        // password-based) — attach the Google id so future Google logins
        // match directly, without touching their existing password.
        user.googleId = profile.sub;
        if (user.provider === "credentials" && !user.passwordHash) {
          user.provider = "google";
        }
        await user.save();
      }
    }

 // inside the callback, in the "user not found → create" branch:
if (!user) {
  user = await User.create({
    fullName: profile.name || profile.email.split("@")[0],
    email: profile.email.toLowerCase(),
    googleId: profile.sub,
    provider: "google",
    role: "customer",
  });

  const token = signSession(String(user._id));
  await setSessionCookie(token);

  // New Google account has no phone — send them to complete it before
  // continuing wherever they were headed.
  return NextResponse.redirect(`${origin}/complete-profile?next=${encodeURIComponent(next)}`);
}

// existing user (returning Google login, or linked account) — existing behavior unchanged:
const token = signSession(String(user._id));
await setSessionCookie(token);

if (!user.phone) {
  return NextResponse.redirect(`${origin}/complete-profile?next=${encodeURIComponent(next)}`);
}

return NextResponse.redirect(`${origin}${next}`);}
 catch (err) {
    console.error("Google OAuth callback error:", err);
    return failRedirect("google_auth_failed");
  }
}