import connectDB from "@/app/lib/mongodb";
import ReturnRequest from "@/app/models/ReturnRequest";
import ReturnsPageClient from "@/components/admin/ReturnsPageClient";

export default async function AdminReturnsPage() {
  await connectDB();
  const returns = await ReturnRequest.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Return Requests</h1>
      <ReturnsPageClient initialReturns={JSON.parse(JSON.stringify(returns))} />
    </div>
  );
}