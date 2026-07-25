import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_COOKIE_NAME = "customer_session";
const SESSION_DURATION = "7d";

interface SessionPayload {
  userId: string;
}

function getSecret() {
  if (!JWT_SECRET) throw new Error("Missing JWT_SECRET environment variable");
  return JWT_SECRET;
}

export function signSession(userId: string): string {
  return jwt.sign({ userId } as SessionPayload, getSecret(), {
    expiresIn: SESSION_DURATION,
  });
}

export function verifySession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  try {
    return jwt.verify(token, getSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE_NAME };