import type {
  ShiprocketAuthResponse,
  ServiceabilityResponse,
  CreateForwardOrderPayload,
  CreateForwardOrderResponse,
  AssignAwbResponse,
  GenerateLabelResponse,
  GenerateManifestResponse,
  RequestPickupResponse,
  TrackByAwbResponse,
  CreateReturnOrderResponse,
  CreateReturnOrderPayload,
} from "./types";

const BASE_URL = process.env.SHIPROCKET_BASE_URL || "https://apiv2.shiprocket.in/v1/external";
const EMAIL = process.env.SHIPROCKET_EMAIL || "";
const PASSWORD = process.env.SHIPROCKET_PASSWORD || "";

if (!EMAIL || !PASSWORD) {
  // Thrown at import time only if actually missing when a route imports this
  // module — mirrors how mongodb.ts guards MONGODB_URI.
  console.warn("SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD are not set — Shiprocket calls will fail.");
}

// Shiprocket tokens are valid ~10 days. Cached the same way as the mongoose
// connection in mongodb.ts — a global survives across hot-reloads in dev and
// across warm serverless invocations, so we don't re-login on every request.
declare global {
  var shiprocketTokenCache:
    | {
        token: string | null;
        expiresAt: number | null; // epoch ms
        promise: Promise<string> | null;
      }
    | undefined;
}

const tokenCache = global.shiprocketTokenCache ?? {
  token: null,
  expiresAt: null,
  promise: null,
};
global.shiprocketTokenCache = tokenCache;

const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000; // refresh a day early, Shiprocket's own expiry is ~10 days

async function login(): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Shiprocket login failed (${res.status}): ${body}`);
  }

  const data: ShiprocketAuthResponse = await res.json();
  tokenCache.token = data.token;
  tokenCache.expiresAt = Date.now() + TOKEN_TTL_MS;
  return data.token;
}

async function getToken(): Promise<string> {
  if (tokenCache.token && tokenCache.expiresAt && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }
  // Dedup concurrent logins the same way connectDB dedups concurrent connects.
  if (!tokenCache.promise) {
    tokenCache.promise = login().finally(() => {
      tokenCache.promise = null;
    });
  }
  return tokenCache.promise;
}

interface ShiprocketFetchOptions {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  /** retried once automatically on 401 with a fresh token */
  _retried?: boolean;
}

async function shiprocketFetch<T>(path: string, opts: ShiprocketFetchOptions = {}): Promise<T> {
  const token = await getToken();

  let url = `${BASE_URL}${path}`;
  if (opts.query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(opts.query)) {
      if (value !== undefined) params.set(key, String(value));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (res.status === 401 && !opts._retried) {
    // Token expired/invalidated server-side before our cache expected it —
    // force a fresh login once, then retry.
    tokenCache.token = null;
    tokenCache.expiresAt = null;
    return shiprocketFetch<T>(path, { ...opts, _retried: true });
  }

  const data = await res.json();

  if (!res.ok) {
    const message = data?.message || data?.errors ? JSON.stringify(data) : `Shiprocket API error (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

// ---- Public API -----------------------------------------------------

export function checkServiceability(params: {
  pickupPincode: string;
  deliveryPincode: string;
  weightKg: number;
  cod: boolean;
}): Promise<ServiceabilityResponse> {
  return shiprocketFetch<ServiceabilityResponse>("/courier/serviceability/", {
    query: {
      pickup_postcode: params.pickupPincode,
      delivery_postcode: params.deliveryPincode,
      weight: params.weightKg,
      cod: params.cod ? 1 : 0,
    },
  });
}

export function createForwardOrder(payload: CreateForwardOrderPayload): Promise<CreateForwardOrderResponse> {
  return shiprocketFetch<CreateForwardOrderResponse>("/orders/create/adhoc", {
    method: "POST",
    body: payload,
  });
}

export function assignAwb(params: { shipmentId: number; courierId: number }): Promise<AssignAwbResponse> {
  return shiprocketFetch<AssignAwbResponse>("/courier/assign/awb", {
    method: "POST",
    body: { shipment_id: params.shipmentId, courier_id: params.courierId },
  });
}

export function generateLabel(shipmentIds: number[]): Promise<GenerateLabelResponse> {
  return shiprocketFetch<GenerateLabelResponse>("/courier/generate/label", {
    method: "POST",
    body: { shipment_id: shipmentIds },
  });
}

export function generateManifest(shipmentIds: number[]): Promise<GenerateManifestResponse> {
  return shiprocketFetch<GenerateManifestResponse>("/manifests/generate", {
    method: "POST",
    body: { shipment_id: shipmentIds },
  });
}

export function requestPickup(shipmentIds: number[]): Promise<RequestPickupResponse> {
  return shiprocketFetch<RequestPickupResponse>("/courier/generate/pickup", {
    method: "POST",
    body: { shipment_id: shipmentIds },
  });
}

export function trackByAwb(awbCode: string): Promise<TrackByAwbResponse> {
  return shiprocketFetch<TrackByAwbResponse>(`/courier/track/awb/${awbCode}`);
}

export function cancelShipment(orderIds: number[]): Promise<{ message: string }> {
  return shiprocketFetch<{ message: string }>("/orders/cancel", {
    method: "POST",
    body: { ids: orderIds },
  });
}
export function createReturnOrder(payload: CreateReturnOrderPayload): Promise<CreateReturnOrderResponse> {
  return shiprocketFetch<CreateReturnOrderResponse>("/orders/create/return", {
    method: "POST",
    body: payload,
  });
}