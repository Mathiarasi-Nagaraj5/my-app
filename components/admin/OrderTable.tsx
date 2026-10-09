"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Truck, ExternalLink, Download, Printer, Search, X } from "lucide-react";
import OrderStatusSelect from "./OrderStatusSelect";
import ShipmentPanel from "./ShipmentPanel";
import { useModal } from "@/components/ui/ModalProvider";
import ReturnPanel from "./ReturnPanel";
import type { ReturnRecord } from "./ReturnsTable";

type OrderStatus = AdminOrder["status"];
type TabKey = "All" | OrderStatus | "Return Requests";

interface OrderTableProps {
  orders: AdminOrder[];
  returns: ReturnRecord[];                       // NEW
  onReturnChanged: (ret: ReturnRecord) => void;  // NEW
  onStatusChanged: (orderId: string, newStatus: OrderStatus) => void;
  onShipped?: (orderId: string, shipment: AdminOrder["shipment"]) => void;
}

const TABS: TabKey[] = [
  "All", "Confirmed", "Out for Delivery", "Delivered",
  "Cancelled", "Returned", "Return Requests",
];

// one extra column at the end
const GRID =
  "grid grid-cols-[2rem_1fr_1.2fr_0.7fr_0.8fr_1fr_1fr_1.3fr_1fr] items-center gap-2";

const RETURN_BADGE: Record<ReturnRecord["status"], string> = {
  Pending: "bg-amber-100 text-amber-700",
  Accepted: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};
export interface AdminOrder {
  _id: string;
  orderNumber: string;
  shippingAddress: { fullName: string };
  total: number;
  status: "Confirmed" | "Out for Delivery" | "Delivered" | "Cancelled" | "Returned";
  createdAt: string;
  paymentMethod?: "upi" | "card" | "cod";
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  shipment?: {
    awbCode?: string;
    courierName?: string;
    trackingUrl?: string;
    labelUrl?: string;
    manifestUrl?: string;
    pickupScheduledAt?: string;
  };
}





interface ShipResponse {
  error?: string;
  shipment?: AdminOrder["shipment"];
}

interface BulkResult {
  shipped: number;
  skipped: number;
  failed: { orderNumber: string; error: string }[];
}


const formatINR = (v: number): string => `₹${v.toLocaleString("en-IN")}`;
const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

type ShipState =
  | { kind: "shipped" }
  | { kind: "ready" }
  | { kind: "blocked"; reason: string };

function getShipState(order: AdminOrder): ShipState {
  if (order.shipment?.awbCode) return { kind: "shipped" };

  if (order.status === "Cancelled") return { kind: "blocked", reason: "Cancelled" };
  if (order.status === "Delivered") return { kind: "blocked", reason: "Delivered" };
  if (order.status === "Returned") return { kind: "blocked", reason: "Returned" };

  if (order.paymentMethod === "cod" || order.paymentStatus === "PAID") {
    return { kind: "ready" };
  }
  if (order.paymentStatus === "FAILED") return { kind: "blocked", reason: "Payment failed" };
  if (order.paymentStatus === "REFUNDED") return { kind: "blocked", reason: "Refunded" };
  return { kind: "blocked", reason: "Awaiting payment" };
}

const canShipOrder = (order: AdminOrder) => getShipState(order).kind === "ready";


function paymentBadge(status?: AdminOrder["paymentStatus"]): string {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-700";
    case "FAILED":
      return "bg-red-100 text-red-700";
    case "REFUNDED":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadPaymentsCsv(rows: AdminOrder[]): void {
  const header = [
    "Order No",
    "Customer",
    "Date",
    "Payment Method",
    "Payment Status",
    "Order Status",
    "Total (INR)",
    "AWB",
    "Courier",
  ];
  const lines = rows.map((o) =>
    [
      o.orderNumber,
      o.shippingAddress.fullName,
      new Date(o.createdAt).toISOString().slice(0, 10),
      (o.paymentMethod ?? "").toUpperCase(),
      o.paymentStatus ?? "PENDING",
      o.status,
      o.total,
      o.shipment?.awbCode ?? "",
      o.shipment?.courierName ?? "",
    ]
      .map(csvCell)
      .join(",")
  );

  // BOM so Excel reads the ₹-free UTF-8 text correctly
  const blob = new Blob(["\uFEFF" + [header.join(","), ...lines].join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `payments-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function OrderTable({
  orders, returns, onReturnChanged, onStatusChanged, onShipped,
}: OrderTableProps) {
  // ...existing state...
  const [returnOpenId, setReturnOpenId] = useState<string | null>(null);

  const returnsByOrder = useMemo(
    () => new Map(returns.map((r) => [r.orderId, r])),
    [returns]
  );

  const { alert } = useModal();

  const [tab, setTab] = useState<TabKey>("All");
  const [query, setQuery] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bulkRunning, setBulkRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null
  );
  
  const [result, setResult] = useState<BulkResult | null>(null);
const [labelsRunning, setLabelsRunning] = useState<boolean>(false);
  const selectAllRef = useRef<HTMLInputElement>(null);
const counts = useMemo(() => {
  const map: Record<TabKey, number> = {
    All: orders.length, Confirmed: 0, "Out for Delivery": 0,
    Delivered: 0, Cancelled: 0, Returned: 0, "Return Requests": 0,
  };
  for (const o of orders) {
    map[o.status] += 1;
    if (returnsByOrder.has(o._id)) map["Return Requests"] += 1;
  }
  return map;
}, [orders, returnsByOrder]);
const [labelRowId, setLabelRowId] = useState<string | null>(null);

async function handleRowLabel(order: AdminOrder): Promise<void> {
  if (order.shipment?.labelUrl) {
    window.open(order.shipment.labelUrl, "_blank");
    return;
  }

  setLabelRowId(order._id);
  const win = window.open("", "_blank"); // before the await
  try {
    const res = await fetch("/api/shiprocket/bulk-label", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderIds: [order._id] }),
    });
    const data = await res.json();

    const url: string | undefined = data.labels?.[order._id] ?? data.combinedUrl;
    if (!res.ok || !data.success || !url) {
      throw new Error(
        data.failed?.[0]?.error ?? data.message ?? "Label isn't ready yet. Try again shortly."
      );
    }

    onShipped?.(order._id, { ...order.shipment, labelUrl: url });
    if (win) win.location.href = url;
  } catch (e) {
    win?.close();
    await alert({
      title: "Couldn't get label",
      message: e instanceof Error ? e.message : "Something went wrong",
      variant: "error",
    });
  } finally {
    setLabelRowId(null);
  }
}
const visible = useMemo(() => {
  const q = query.trim().toLowerCase();
  return orders.filter((o) => {
    if (tab === "Return Requests") {
      if (!returnsByOrder.has(o._id)) return false;
    } else if (tab !== "All" && o.status !== tab) return false;
    if (!q) return true;
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.shippingAddress.fullName.toLowerCase().includes(q)
    );
  });
}, [orders, tab, query, returnsByOrder]);
  const selectedOrders = useMemo(
    () => orders.filter((o) => selected.has(o._id)),
    [orders, selected]
  );
  const labelSelected = selectedOrders.filter((o) => o.shipment?.awbCode);

  const shippableSelected = selectedOrders.filter(canShipOrder);
const labelEligible = selectedOrders.filter((o) => o.shipment?.awbCode);
  const allVisibleSelected =
    visible.length > 0 && visible.every((o) => selected.has(o._id));
  const someVisibleSelected = visible.some((o) => selected.has(o._id));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        someVisibleSelected && !allVisibleSelected;
    }
  }, [someVisibleSelected, allVisibleSelected]);

  function changeTab(next: TabKey): void {
    setTab(next);
    setSelected(new Set());
  }

  function toggleOne(id: string): void {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll(): void {
    setSelected(allVisibleSelected ? new Set() : new Set(visible.map((o) => o._id)));
  }

  async function shipOne(order: AdminOrder): Promise<string | null> {
    try {
      const res = await fetch(`/api/admin/orders/${order._id}/ship`, {
        method: "POST",
      });
      const data = (await res.json()) as ShipResponse;
      if (!res.ok) return data.error ?? "Failed to ship order";
      onShipped?.(order._id, data.shipment);
      onStatusChanged(order._id, "Out for Delivery");
      return null;
    } catch {
      return "Network error";
    }
  }

  async function handleShip(order: AdminOrder): Promise<void> {
    setShippingId(order._id);
    const error = await shipOne(order);
    setShippingId(null);
    if (error) {
      await alert({
        title: "Couldn't ship order",
        message: error,
        variant: "error",
      });
    }
  }

  async function handleBulkShip(): Promise<void> {
    if (bulkRunning || shippableSelected.length === 0) return;

    setBulkRunning(true);
    setResult(null);
    setProgress({ done: 0, total: shippableSelected.length });

    const failed: BulkResult["failed"] = [];
    let shipped = 0;

    // one at a time so Shiprocket's rate limits aren't hit
    for (const order of shippableSelected) {
      const error = await shipOne(order);
      if (error) failed.push({ orderNumber: order.orderNumber, error });
      else shipped += 1;
      setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
    }

    setResult({
      shipped,
      failed,
      skipped: selectedOrders.length - shippableSelected.length,
    });
    setProgress(null);
    setBulkRunning(false);
    setSelected(new Set());
  }


  function handleDownloadPayments(): void {
    downloadPaymentsCsv(selectedOrders.length > 0 ? selectedOrders : visible);
  }

  if (orders.length === 0) {
    return <p className="text-sm text-charcoal/55">no orders yet.</p>;
  }

async function handlePrintLabels(): Promise<void> {
  if (labelsRunning || labelSelected.length === 0) return;
  setLabelsRunning(true);

  // open synchronously so the browser doesn't block it as a popup
  const win = window.open("", "_blank");

  try {
    const res = await fetch("/api/shiprocket/bulk-label", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderIds: labelSelected.map((o) => o._id) }),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message ?? "Failed to generate labels");
    }

    // save newly created label URLs so rows show "View label" straight away
    for (const o of labelSelected) {
      const url = data.labels?.[o._id];
      if (url) onShipped?.(o._id, { ...o.shipment, labelUrl: url });
    }

    const failedText = (data.failed ?? [])
      .map((f: { orderNumber: string; error: string }) => `#${f.orderNumber}: ${f.error}`)
      .join("\n");

    if (!data.combinedUrl) {
      throw new Error(failedText || "Labels aren't ready yet. Try again in a few seconds.");
    }

    if (win) win.location.href = data.combinedUrl;
    else window.location.href = data.combinedUrl;

    if (failedText) {
      await alert({
        title: "Some labels were skipped",
        message: failedText,
        variant: "error",
      });
    }
  } catch (e) {
    win?.close();
    await alert({
      title: "Couldn't get labels",
      message: e instanceof Error ? e.message : "Something went wrong",
      variant: "error",
    });
  } finally {
    setLabelsRunning(false);
  }
}
  return (
    <div className="space-y-3">
      {/* tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => changeTab(t)}
            className={
              t === tab
                ? "rounded-full bg-pink px-4 py-1.5 text-sm font-medium text-white"
                : "rounded-full border border-charcoal/15 bg-white px-4 py-1.5 text-sm text-charcoal/70 hover:border-pink hover:text-pink"
            }
          >
            {t} <span className="opacity-70">({counts[t]})</span>
          </button>
        ))}
      </div>

      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
          />
            <input value={query} onChange={(e) => { setQuery(e.target.value); setSelected(new Set()); }} 
            placeholder="Search order no or customer"
            className="w-full rounded-full border border-charcoal/15 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-pink"
          />
        </div>
        <button
          type="button"
          onClick={handleDownloadPayments}
          disabled={visible.length === 0}
          className="flex items-center gap-1.5 rounded-full border border-charcoal/20 bg-white px-4 py-2 text-sm text-charcoal/80 hover:border-pink hover:text-pink disabled:opacity-40"
        >
          <Download size={14} />
          Download payments
          {selected.size > 0 ? ` (${selected.size})` : ""}
        </button>
      </div>

      {/* bulk result */}
      {result && (
        <div className="relative rounded-card border border-charcoal/10 bg-white p-4 text-sm">
          <button
            type="button"
            onClick={() => setResult(null)}
            aria-label="Dismiss"
            className="absolute right-3 top-3 text-charcoal/40 hover:text-charcoal"
          >
            <X size={15} />
          </button>
          <p className="font-medium text-charcoal">
            {result.shipped} shipped
            {result.skipped > 0 ? `, ${result.skipped} skipped (not eligible)` : ""}
            {result.failed.length > 0 ? `, ${result.failed.length} failed` : ""}
          </p>
          {result.failed.length > 0 && (
            <ul className="mt-2 space-y-1 text-red-600">
              {result.failed.map((f) => (
                <li key={f.orderNumber}>
                  #{f.orderNumber}: {f.error}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* table */}
      <div className="overflow-x-auto rounded-card border border-charcoal/10 bg-white">
        <div className="min-w-[980px]">
          <div
            className={`${GRID} border-b border-charcoal/10 bg-ivory px-4 py-2 text-sm font-medium text-pink`}
          >
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleAll}
              aria-label="Select all orders"
              className="h-4 w-4 accent-pink"
            />
            <span>Order No</span>
            <span>Customer</span>
            <span>Date</span>
            <span>Total</span>
            <span>Payment</span>
            <span>Status</span>
            <span>Shipping</span>
            <span>Return</span>
          </div>

          {visible.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-charcoal/55">
              No orders match this filter.
            </p>
          )}

          {visible.map((order) => {
              const canShip = canShipOrder(order);
              const isExpanded = expandedId === order._id;
              const isSelected = selected.has(order._id);
              const ret = returnsByOrder.get(order._id); 
const shipState = getShipState(order);
            return (
              <div
                key={order._id}
                className={`border-b border-charcoal/10 last:border-0 ${
                  isSelected ? "bg-pink/5" : ""
                }`}
              >
                <div className={`${GRID} px-4 py-2 text-sm text-charcoal`}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOne(order._id)}
                    aria-label={`Select order ${order.orderNumber}`}
                    className="h-4 w-4 accent-pink"
                  />
                  
                  <span>#{order.orderNumber}</span>
                  <span className="truncate">{order.shippingAddress.fullName}</span>
                  <span>{formatDate(order.createdAt)}</span>
                  <span>{formatINR(order.total)}</span>

                  <span className="flex flex-col items-start gap-0.5">
                    <span className="text-xs uppercase text-charcoal/60">
                      {order.paymentMethod ?? "—"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${paymentBadge(
                        order.paymentStatus
                      )}`}
                    >
                     {order.paymentMethod === "cod" && order.paymentStatus !== "PAID"
  ? "COD · collect"
  : order.paymentStatus ?? "PENDING"}
                    </span>
                  </span>

                  <OrderStatusSelect
                    orderId={order._id}
                    status={order.status}
                    onChanged={onStatusChanged}
                  />

                {order.shipment?.awbCode ? (
  <div className="flex flex-col items-start gap-1">
    <a
      href={order.shipment.trackingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-brass hover:underline"
    >
      {order.shipment.courierName ?? "Track"}
      <ExternalLink size={11} />
    </a>

    <div className="flex items-center gap-2 text-[11px]">
      <button
        type="button"
        onClick={() => void handleRowLabel(order)}
        disabled={labelRowId === order._id}
        className="flex items-center gap-1 text-pink hover:underline disabled:opacity-50"
      >
        <Printer size={11} />
        {labelRowId === order._id
          ? "..."
          : order.shipment.labelUrl
          ? "View label"
          : "Generate label"}
      </button>
      <button
        type="button"
        onClick={() => setExpandedId(isExpanded ? null : order._id)}
        className="text-charcoal/40 hover:text-charcoal/60"
      >
        {isExpanded ? "hide" : "more"}
      </button>
    </div>
  </div>
) : canShip ? (
                    <button
                      type="button"
                      onClick={() => void handleShip(order)}
                      disabled={shippingId === order._id || bulkRunning}
                      className="flex w-fit items-center gap-1 rounded border border-charcoal/20 px-2 py-1 text-charcoal/70 hover:border-brass hover:text-brass disabled:opacity-50"
                    >
                      <Truck size={12} />
                      {shippingId === order._id ? "shipping..." : "ship"}
                    </button>
                   )  : shipState.kind === "blocked" ? (
  <span className="text-xs text-charcoal/50">{shipState.reason}</span>
) : null}

  {/* NEW: return cell */}
  {ret ? (
    <div className="flex flex-col items-start gap-0.5">
      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${RETURN_BADGE[ret.status]}`}>
        Return {ret.status.toLowerCase()}
      </span>
      <button
        type="button"
        onClick={() => setReturnOpenId(returnOpenId === order._id ? null : order._id)}
        className="text-[11px] text-pink hover:underline"
      >
        {returnOpenId === order._id ? "hide" : ret.status === "Pending" ? "review" : "view"}
      </button>
    </div>
  ) : (
    <span className="text-charcoal/30">—</span>
  )}
</div>

                {isExpanded && order.shipment?.awbCode && (
                  <ShipmentPanel
                    orderId={order._id}
                    shipment={order.shipment}
                    onUpdated={(shipment) => onShipped?.(order._id, shipment)}
                  />
                  
                )}
                {ret && returnOpenId === order._id && (
  <ReturnPanel
    ret={ret}
    onChanged={(updated) => {
      onReturnChanged(updated);
      // the API sets order.status = "Returned" on accept, so mirror it locally
      if (updated.status === "Accepted") onStatusChanged(order._id, "Returned");
    }}
  />
)}
              </div>
            );
          })}
        </div>
      </div>

      {/* floating bulk bar */}
      {selected.size > 0 && (
        <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-charcoal px-5 py-3 text-ivory shadow-xl">
          <div className="text-sm">
            <strong>{selected.size}</strong> selected
            {progress && (
              <span className="ml-3 text-ivory/70">
                Shipping {progress.done}/{progress.total}...
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handleBulkShip()}
              disabled={bulkRunning || shippableSelected.length === 0}
              className="flex items-center gap-1.5 rounded-full bg-pink px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
            >
              <Truck size={14} />
              Ship selected ({shippableSelected.length})
            </button>
         <button
  type="button"
  onClick={() => void handlePrintLabels()}
  disabled={bulkRunning || labelsRunning || labelSelected.length === 0}
  className="flex items-center gap-1.5 rounded-full border border-ivory/30 px-4 py-2 text-sm hover:border-pink hover:text-pink disabled:opacity-40"
>
  <Printer size={14} />
  {labelsRunning ? "Preparing..." : `Print labels (${labelSelected.length})`}
</button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              disabled={bulkRunning}
              className="px-2 py-2 text-sm text-ivory/70 hover:text-ivory disabled:opacity-40"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}