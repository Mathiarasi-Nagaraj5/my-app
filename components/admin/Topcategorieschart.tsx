"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export interface CategorySlice {
  category: string; // "t-shirts" | "hoodies" | "pyjamas" | "uncategorised"
  percent: number;
}

// Approximate — swap for your real tailwind.config hex values if these
// don't match (pink is confirmed from checkout's Razorpay theme color;
// the rest are reasonable guesses at charcoal / brass / a couple of
// neutral extensions so the slices stay legible).
const COLORS = ["#e0629b", "#2b2a28", "#b8934a", "#4c8d7c", "#8b7fb8"];

const LABELS: Record<string, string> = {
  "t-shirts": "T-shirts",
  hoodies: "Hoodies",
  pyjamas: "Pyjamas",
  uncategorised: "Uncategorised",
};

export default function TopCategoriesChart({ data }: { data: CategorySlice[] }) {
  return (
    <div className="rounded-card border border-charcoal/10 bg-white p-4">
      <p className="mb-4 text-md text-charcoal">Top categories</p>

      {data.length === 0 ? (
        <p className="py-8 text-center text-xs text-charcoal/50">No sales yet.</p>
      ) : (
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="55%" height={150}>
            <PieChart>
              <Pie
                data={data}
                dataKey="percent"
                nameKey="category"
                innerRadius={45}
                outerRadius={72}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
            </PieChart>
          </ResponsiveContainer>

          <ul className="flex-1 space-y-2">
            {data.map((slice, i) => (
              <li key={slice.category} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-charcoal/70">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  {LABELS[slice.category] ?? slice.category}
                </span>
                <span className="font-medium text-charcoal">{slice.percent.toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}