import RequireAdmin from "@/components/auth/RequireAdmin";
import AdminChangePasswordForm from "@/components/admin/AdminChangePasswordForm";

export default function AdminProfilePage() {
  return (
    <RequireAdmin>
      <div className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="mb-6 text-xl font-semibold text-gray-900">Admin Profile</h1>

        <div className="mb-8 rounded-lg border border-gray-200 p-5">
          <h2 className="mb-3 text-sm font-medium text-gray-900">Change Password</h2>
          <AdminChangePasswordForm />
        </div>
      </div>
    </RequireAdmin>
  );
}