import connectDB from "@/app/lib/mongodb";
import ReturnRequest from "@/app/models/ReturnRequest";
import ReturnsPageClient from "@/components/admin/ReturnsPageClient";
import RequireAdmin from "@/components/auth/RequireAdmin";

export default async function AdminReturnsPage() {
  await connectDB();
  const returns = await ReturnRequest.find().sort({ createdAt: -1 }).lean();

  return (
    <RequireAdmin>
      <div >
        <h1 className="mb-1 text-2xl font-medium text-charcoal">Return Requests</h1>
        <p className="text-sm mb-2 text-gray-500">
          View and manage all return requests submitted by customers.
        </p>
        <ReturnsPageClient initialReturns={JSON.parse(JSON.stringify(returns))} />
      </div>
    </RequireAdmin>
  );
}