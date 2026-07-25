import AccountSidebar from "../../components/account/AccountSidebar";
import AccountDetailsForm from "../../components/account/AccountDetailsForm";
import RecentOrdersPreview from "../../components/account/Recentorderspreview";
import RequireAuth from "../../components/auth/RequireAuth";

export default function ProfilePage() {
  return (
     <RequireAuth>
     <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
        <AccountSidebar />

        <div>
          <h1 className="mb-6 font-serif text-2xl font-medium text-charcoal">
            Account Details
          </h1>
          <AccountDetailsForm />
          <RecentOrdersPreview />
        </div>
      </div>
    </div>
    </RequireAuth>
  );
}