import connectDB from "@/app/lib/mongodb";
import PromoCode from "@/app/models/Promocode";
import PromosPageClient from "@/components/admin/PromoPageClient";
import RequireAdmin from "@/components/auth/RequireAdmin";

export default async function PromosPage() {
  await connectDB();
  const promos = await PromoCode.find().sort({ createdAt: -1 }).lean();

  return (
    <RequireAdmin>
    <div>
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-medium text-charcoal">Promo Codes</h1>
        <p className="text-sm text-gray-500">
          Manage discount coupons available at checkout.
        </p>
      </div>

      <PromosPageClient initialPromos={JSON.parse(JSON.stringify(promos))} />
    </div>
    </RequireAdmin>
  );
}