import type { IOrder } from "@/app/models/Order";

const formatINR = (v: number) => `₹${v.toLocaleString("en-IN")}`;
const formatDate = (d: Date) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

// Shared shell so all three emails look consistent — kept intentionally
// plain (table-based, inline styles) since most email clients strip
// <style> blocks and mangle modern CSS.
function emailShell(title: string, bodyHtml: string): string {
  return `
  <div style="font-family: -apple-system, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
    <div style="padding: 24px 0; border-bottom: 2px solid #1a1a1a; margin-bottom: 24px;">
      <span style="font-size: 20px; font-weight: 600;">Elite Soul</span>
    </div>
    <h1 style="font-size: 20px; margin-bottom: 16px;">${title}</h1>
    ${bodyHtml}
    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #888;">
      Questions about your order? Just reply to this email.
    </div>
  </div>`;
}

function itemsTableHtml(order: IOrder): string {
  const rows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
        ${item.name}${item.size ? ` (${item.size})` : ""}${item.color ? `, ${item.color}` : ""} × ${item.quantity}
      </td>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">
        ${formatINR(item.price * item.quantity)}
      </td>
    </tr>`
    )
    .join("");

  return `
  <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
    ${rows}
    <tr><td style="padding: 8px 0;">Subtotal</td><td style="padding: 8px 0; text-align: right;">${formatINR(order.subtotal)}</td></tr>
    <tr><td style="padding: 8px 0;">Delivery</td><td style="padding: 8px 0; text-align: right;">${order.delivery === 0 ? "Free" : formatINR(order.delivery)}</td></tr>
    ${order.discount > 0 ? `<tr><td style="padding: 8px 0;">Discount${order.promoCode ? ` (${order.promoCode})` : ""}</td><td style="padding: 8px 0; text-align: right;">−${formatINR(order.discount)}</td></tr>` : ""}
    <tr style="font-weight: 600;"><td style="padding: 8px 0; border-top: 1px solid #1a1a1a;">Total</td><td style="padding: 8px 0; text-align: right; border-top: 1px solid #1a1a1a;">${formatINR(order.total)}</td></tr>
  </table>`;
}

export function orderConfirmationEmail(order: IOrder): { subject: string; html: string } {
  const html = emailShell(
    `Order confirmed — #${order.orderNumber}`,
    `
    <p style="font-size: 14px;">Hi ${order.shippingAddress.fullName}, thanks for your order! Here's a summary.</p>
    ${itemsTableHtml(order)}
    <p style="font-size: 13px; color: #555;">
      Shipping to: ${order.shippingAddress.addressLine}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
    </p>
    <p style="font-size: 13px; color: #555;">Payment: ${order.paymentMethod.toUpperCase()} · ${order.paymentStatus}</p>
    <p style="font-size: 13px; color: #555;">Placed on ${formatDate(order.createdAt)}</p>
    `
  );
  return { subject: `Order confirmed — #${order.orderNumber}`, html };
}

export function returnStatusEmail(
  order: IOrder,
  status: "Accepted" | "Rejected",
  adminNote?: string
): { subject: string; html: string } {
  const html = emailShell(
    status === "Accepted" ? `Your return has been approved` : `Update on your return request`,
    `
    <p style="font-size: 14px;">Hi ${order.shippingAddress.fullName},</p>
    <p style="font-size: 14px;">
      ${
        status === "Accepted"
          ? `Your return request for order #${order.orderNumber} has been <strong>approved</strong>. We'll be in touch shortly to arrange pickup, and your refund will be processed once the item is received back.`
          : `Your return request for order #${order.orderNumber} has been <strong>declined</strong>.`
      }
    </p>
    ${adminNote ? `<p style="font-size: 13px; color: #555; background: #f7f7f7; padding: 10px 12px; border-radius: 4px;">Note from our team: ${adminNote}</p>` : ""}
    ${itemsTableHtml(order)}
    `
  );
  return {
    subject: status === "Accepted" ? `Return approved — #${order.orderNumber}` : `Return update — #${order.orderNumber}`,
    html,
  };
}

export function refundConfirmationEmail(
  order: IOrder,
  refundAmount: number
): { subject: string; html: string } {
  const html = emailShell(
    `Refund processed — #${order.orderNumber}`,
    `
    <p style="font-size: 14px;">Hi ${order.shippingAddress.fullName},</p>
    <p style="font-size: 14px;">
      A refund of <strong>${formatINR(refundAmount)}</strong> has been issued for order #${order.orderNumber}.
      It should reflect in your original payment method within 5-7 business days.
    </p>
    ${itemsTableHtml(order)}
    `
  );
  return { subject: `Refund processed — #${order.orderNumber}`, html };
}