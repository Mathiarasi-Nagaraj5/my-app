import AccountSidebar from "../../components/account/Accountsidebar";
import AccountDetailsForm from "../../components/account/Accountdetailsform";
import RecentOrdersPreview from "../../components/account/Recentorderspreview";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
        <AccountSidebar />

        <div>
          <h1 className="mb-6 font-serif text-2xl font-medium text-charcoal">
            account details
          </h1>
          <AccountDetailsForm />
          <RecentOrdersPreview />
        </div>
      </div>
    </div>
  );
}