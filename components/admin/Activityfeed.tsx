import { PackagePlus, IndianRupee } from "lucide-react";

export interface ActivityEvent {
  id: string;
  type: "order" | "payment";
  message: string;
  meta?: string;
  timeAgo: string;
}

const ICONS = { order: PackagePlus, payment: IndianRupee };

export default function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <div className="rounded-card border border-charcoal/10 bg-white p-4">
      <p className="mb-4 text-md text-charcoal">Activity feed</p>

      {events.length === 0 ? (
        <p className="py-6 text-center text-xs text-charcoal/50">Nothing to show yet.</p>
      ) : (
        <ul className="space-y-4">
          {events.map((event) => {
            const Icon = ICONS[event.type];
            return (
              <li key={event.id} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pink/10 text-pink">
                  <Icon size={14} />
                </span>
                <div className="flex-1">
                  <p className="text-xs text-charcoal">{event.message}</p>
                  {event.meta && <p className="text-[11px] text-charcoal/50">{event.meta}</p>}
                </div>
                <span className="shrink-0 text-[11px] text-charcoal/40">{event.timeAgo}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}