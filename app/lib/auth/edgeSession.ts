import { jwtVerify } from "jose";

// Edge-compatible JWT verification for middleware only. jsonwebtoken (used
// in session.ts for API routes) depends on Node's crypto module and does
// NOT run on the Edge runtime that middleware executes in — using it there
// throws silently, verifySession's try/catch swallows the error, and
// middleware treats every request as logged-out. jose works on both Edge
// and Node, so it's the safe choice specifically for middleware.
const encodedSecret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function verifySessionEdge(token: string | undefined): Promise<{ userId: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    if (typeof payload.userId !== "string") return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}