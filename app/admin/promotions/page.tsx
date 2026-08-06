import PromosPageClient from "@/components/admin/PromoPageClient";
import { PromoCodeRecord } from "@/components/admin/PromoTable";

async function getPromos(): Promise<PromoCodeRecord[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/promo`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch promo codes");
  }

  const json = await res.json();
  return json.data as PromoCodeRecord[];
}

export default async function PromosPage() {
  const promos = await getPromos();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Promo Codes</h1>
        <p className="text-sm text-gray-500">
          Manage discount coupons available at checkout.
        </p>
      </div>

      <PromosPageClient initialPromos={promos} />
    </div>
  );
}