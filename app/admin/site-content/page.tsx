import RequireAdmin from "@/components/auth/RequireAdmin";
import SiteContentEditor from "@/components/admin/SiteContentEditor";

export default function SiteContentPage() {
  return (
    <RequireAdmin>
      <div >
        <h1 className="mb-1 text-2xl font-medium text-charcoal">Site Content</h1>
          <p className="text-sm mb-2 text-gray-500">
            View and manage all site content for your store, including the home page, categories, and policy.
        </p>
        <SiteContentEditor />
      </div>
    </RequireAdmin>
  );
}