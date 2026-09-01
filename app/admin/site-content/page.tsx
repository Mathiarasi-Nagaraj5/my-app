import RequireAdmin from "@/components/auth/RequireAdmin";
import SiteContentEditor from "@/components/admin/SiteContentEditor";

export default function SiteContentPage() {
  return (
    <RequireAdmin>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-6 text-xl font-semibold text-charcoal">Homepage Content</h1>
        <SiteContentEditor />
      </div>
    </RequireAdmin>
  );
}