import { CheckCircle2, Circle, Truck } from "lucide-react";

interface StatusEvent {
  status: string;
  activity?: string;
  location?: string;
  statusDate: string;
}

interface TrackingTimelineProps {
  courierName?: string;
  awbCode?: string;
  trackingUrl?: string;
  statusHistory?: StatusEvent[];
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default function TrackingTimeline({ courierName, awbCode, trackingUrl, statusHistory }: TrackingTimelineProps) {
  if (!awbCode) return null;

  const events = statusHistory ?? [];
  // Most recent first for display, but the underlying data is stored oldest-first.
  const reversed = [...events].reverse();

  return (
    <div className="rounded-card border border-charcoal/15 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-2 text-md font-medium text-pink">
          <Truck size={15} className="text-brass" /> Tracking
        </p>
        {trackingUrl && (
          <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brass hover:underline">
            view on courier site
          </a>
        )}
      </div>

      <p className="mb-4 text-xs text-charcoal/55">
        {courierName ?? "Courier"} · AWB {awbCode}
      </p>

      {reversed.length === 0 ? (
        <p className="text-sm text-charcoal/55">Shipment created — waiting for the first courier scan.</p>
      ) : (
        <div className="space-y-4">
          {reversed.map((event, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                {i === 0 ? (
                  <CheckCircle2 size={16} className="text-green-500" />
                ) : (
                  <Circle size={16} className="text-charcoal/25" />
                )}
                {i < reversed.length - 1 && <div className="mt-1 h-full w-px flex-1 bg-charcoal/10" />}
              </div>
              <div className="flex-1 pb-1">
                <p className={`text-sm ${i === 0 ? "font-medium text-charcoal" : "text-charcoal/70"}`}>
                  {event.status}
                </p>
                {event.activity && <p className="text-xs text-charcoal/55">{event.activity}</p>}
                <p className="text-[11px] text-charcoal/40">
                  {formatDateTime(event.statusDate)}
                  {event.location && ` · ${event.location}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}