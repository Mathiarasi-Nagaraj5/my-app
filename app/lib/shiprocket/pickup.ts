import { requestPickup } from "./client";

export async function schedulePickupForOrder(order: any): Promise<
  { ok: true; pickupScheduledAt: Date; alreadyScheduled?: boolean } | { ok: false; message: string }
> {
  const shipmentId = order.shipment?.shiprocketShipmentId;
  if (!shipmentId) return { ok: false, message: "order has no Shiprocket shipment yet" };

  if (order.shipment.pickupScheduledAt) {
    return { ok: true, pickupScheduledAt: order.shipment.pickupScheduledAt, alreadyScheduled: true };
  }

  try {
    const result = await requestPickup([shipmentId]);
    if (result.pickup_status !== 1) return { ok: false, message: "courier could not schedule pickup" };

    const dateStr = result.response?.pickup_scheduled_date;
    const scheduledAt = dateStr ? new Date(dateStr) : new Date();
    order.shipment.pickupScheduledAt = scheduledAt;
    await order.save();
    return { ok: true, pickupScheduledAt: scheduledAt };
  } catch (err: any) {
    if (/already/i.test(err?.message ?? "")) {
      order.shipment.pickupScheduledAt = new Date();
      await order.save();
      return { ok: true, pickupScheduledAt: order.shipment.pickupScheduledAt, alreadyScheduled: true };
    }
    return { ok: false, message: err?.message ?? "pickup request failed" };
  }
}