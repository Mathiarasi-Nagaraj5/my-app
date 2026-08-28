import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "./rateLimit";

export function enforceRateLimit(
  req: Request,
  routeName: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const ip = getClientIp(req);
  const result = checkRateLimit(`${routeName}:${ip}`, limit, windowMs);

  if (!result.allowed) {
    const retryAfterSeconds = Math.ceil((result.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { success: false, message: "too many requests — please try again shortly" },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }
  return null;
}