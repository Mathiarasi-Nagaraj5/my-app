import Order from "@/app/models/Order";
import { sendWhatsAppTemplate, toWhatsAppNumber } from "./client"; // adjust to your file name

export async function sendOrderConfirmation(order: any): Promise<void> {
  try {
    const phone = order.shippingAddress?.phone;
    if (!phone) return;

    // Atomically claim the send so two callers can't both send it
    const claimed = await Order.findOneAndUpdate(
      { _id: order._id, "whatsapp.confirmationSentAt": { $exists: false } },
      { $set: { "whatsapp.confirmationSentAt": new Date() } }
    );
    if (!claimed) return; // already sent

    const result = await sendWhatsAppTemplate({
      to: toWhatsAppNumber(phone),
      templateName: "order_confirmation",
      bodyParams: [
        order.shippingAddress.fullName?.split(" ")[0] || "there",
        order.orderNumber,
        String(order.total),
      ],
    });

    // Send failed: release the claim so a later retry can send it
    if (!result) {
      await Order.updateOne(
        { _id: order._id },
        { $unset: { "whatsapp.confirmationSentAt": "" } }
      );
    }
  } catch (err) {
    console.error("WhatsApp confirmation error:", err); // never break order flow
  }
}