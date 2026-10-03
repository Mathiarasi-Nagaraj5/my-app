import { Suspense } from "react";
import CompleteProfileContent from "./CompleteProfileContent";

export default function CompleteProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-sm px-6 py-16">
          <p className="text-sm text-charcoal/60">Loading...</p>
        </div>
      }
    >
      <CompleteProfileContent />
    </Suspense>
  );
}