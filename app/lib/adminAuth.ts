import crypto from "crypto";

// MVP-level admin auth: one shared password (ADMIN_PASSWORD), one session
// token signed with ADMIN_SECRET. No per-user accounts or expiry — good
// enough for a single owner running the store. Upgrade to NextAuth with
// a real User model + roles once you have multiple admin staff.

function getSecret() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error("Missing ADMIN_SECRET environment variable");
  return secret;
}

export function generateAdminToken() {
  return crypto.createHmac("sha256", getSecret()).update("admin-session").digest("hex");
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  return token === generateAdminToken();
}