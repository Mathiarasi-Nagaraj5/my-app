"use client";

import { useState } from "react";
import PromoForm from "./PromoForm";
import PromoTable, { PromoCodeRecord } from "./PromoTable";

interface PromosPageClientProps {
  initialPromos: PromoCodeRecord[];
}

export default function PromosPageClient({ initialPromos }: PromosPageClientProps) {
  const [promos, setPromos] = useState(initialPromos);

  return (
    <>
      <PromoForm onCreated={(newPromo) => setPromos((prev) => [newPromo, ...prev])} />
      <PromoTable promos={promos} onPromosChange={setPromos} />
    </>
  );
}