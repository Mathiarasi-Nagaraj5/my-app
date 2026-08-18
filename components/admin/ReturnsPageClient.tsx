"use client";

import { useState } from "react";
import ReturnsTable, { ReturnRecord } from "./ReturnsTable";

interface ReturnsPageClientProps {
  initialReturns: ReturnRecord[];
}

export default function ReturnsPageClient({ initialReturns }: ReturnsPageClientProps) {
  const [returns, setReturns] = useState(initialReturns);

  return <ReturnsTable returns={returns} onReturnsChange={setReturns} />;
}