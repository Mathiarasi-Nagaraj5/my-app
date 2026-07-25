const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";

let cachedToken: { token: string; expiresAt: number } | null = null;

// Shiprocket doesn't use a fixed API key — you log in with the account
// email/password and get back a token valid for ~10 days. Cache it in
// memory so we're not logging in on every single request.
export async function getShiprocketToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const res = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });

  if (!res.ok) throw new Error("Shiprocket login failed");

  const data = await res.json();
  cachedToken = {
    token: data.token,
    expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000, // refresh a day early, to be safe
  };

  return cachedToken.token;
}

export { SHIPROCKET_BASE_URL };