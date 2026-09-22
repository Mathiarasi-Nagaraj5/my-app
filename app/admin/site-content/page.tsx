import RequireAdmin from "@/components/auth/RequireAdmin";
import SiteContentEditor from "@/components/admin/SiteContentEditor";

export default function SiteContentPage() {
  return (
    <RequireAdmin>
      <div >
        <h1 className="mb-1 text-2xl font-medium text-charcoal">Homepage Content</h1>
          <p className="text-sm mb-2 text-gray-500">
            Edit the content displayed on the homepage of the website.
        </p>
        <SiteContentEditor />
      </div>
    </RequireAdmin>
  );
}