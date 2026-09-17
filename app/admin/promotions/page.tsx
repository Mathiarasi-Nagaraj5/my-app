import connectDB from "@/app/lib/mongodb";
import PromoCode from "@/app/models/Promocode";
import PromosPageClient from "@/components/admin/PromoPageClient";

export default async function PromosPage() {
  await connectDB();
  const promos = await PromoCode.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Promo Codes</h1>
        <p className="text-sm text-gray-500">
          Manage discount coupons available at checkout.
        </p>
      </div>

      <PromosPageClient initialPromos={JSON.parse(JSON.stringify(promos))} />
    </div>
  );
}