export const WHY_ICONS = ["truck", "return", "wallet", "shirt", "shield", "heart", "star", "package", "sparkles", "gift"] as const;

export const HOME_DEFAULTS = {
  categories: {
    enabled: true,
    title: "Shop by Category",
    // empty = use the automatic category grid
    items: [] as { name: string; image: string; href: string }[],
  },
  products: {
    enabled: true,
    tabs: [
      { id: "new", label: "New Arrivals", enabled: true, count: 8 },
      { id: "best", label: "Best Sellers", enabled: true, count: 8 },
      { id: "trending", label: "Trending", enabled: true, count: 8 },
    ] as { id: "new" | "best" | "trending"; label: string; enabled: boolean; count: number }[],
  },
  why: {
    enabled: true,
    items: [
      { icon: "truck", title: "Free delivery", sub: "on all online orders" },
      { icon: "return", title: "Easy returns", sub: "7-day no-questions returns" },
      { icon: "wallet", title: "Cash on delivery", sub: "pay when it reaches you" },
      { icon: "shirt", title: "Premium cotton", sub: "240 GSM heavyweight fabric" },
    ] as { icon: string; title: string; sub: string }[],
  },
  testimonials: { enabled: true, title: "What Our Customers Are Saying", minRating: 4, limit: 6 },
  instagram: { enabled: true },
};

export type HomeConfig = typeof HOME_DEFAULTS;

// merges saved values over the defaults, so missing fields never break the page
export function withHomeDefaults(saved: Partial<Record<keyof HomeConfig, unknown>> | undefined): HomeConfig {
  const s = (saved ?? {}) as Record<string, Record<string, unknown>>;
  const out = {} as Record<string, unknown>;
  for (const key of Object.keys(HOME_DEFAULTS) as (keyof HomeConfig)[]) {
    out[key] = { ...HOME_DEFAULTS[key], ...(s[key] ?? {}) };
  }
  return out as HomeConfig;
}