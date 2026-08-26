import { resend, EMAIL_FROM } from "./client";
import { orderConfirmationEmail, returnStatusEmail, refundConfirmationEmail } from "./templates";
import { generateInvoicePdf } from "@/app/lib/invoice/generateInvoicePdf";
import type { IOrder } from "@/app/models/Order";

interface Attachment {
  filename: string;
  content: Buffer;
}

async function getInvoiceAttachment(order: IOrder): Promise<Attachment | null> {
  try {
    const pdfBuffer = await generateInvoicePdf(order);
    return { filename: `invoice-${order.orderNumber}.pdf`, content: pdfBuffer };
  } catch (err) {
    // Don't let a PDF generation failure block the email itself — send
    // without the attachment rather than not sending at all.
    console.error("Invoice PDF generation failed for email:", err);
    return null;
  }
}

async function safeSend(params: {
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}) {
  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
      attachments: params.attachments,
    });
    if (result.error) {
      console.error("Email send failed:", result.error);
    }
    return result;
  } catch (err) {
    console.error("Email send threw:", err);
    return null;
  }
}

export async function sendOrderConfirmationEmail(order: IOrder) {
  if (!order.shippingAddress.email) return;
  const { subject, html } = orderConfirmationEmail(order);
  const invoice = await getInvoiceAttachment(order);
  return safeSend({
    to: order.shippingAddress.email,
    subject,
    html,
    attachments: invoice ? [invoice] : undefined,
  });
}

export async function sendReturnStatusEmail(order: IOrder, status: "Accepted" | "Rejected", adminNote?: string) {
  if (!order.shippingAddress.email) return;
  const { subject, html } = returnStatusEmail(order, status, adminNote);
  return safeSend({ to: order.shippingAddress.email, subject, html });
}

export async function sendRefundConfirmationEmail(order: IOrder, refundAmount: number) {
  if (!order.shippingAddress.email) return;
  const { subject, html } = refundConfirmationEmail(order, refundAmount);
  const invoice = await getInvoiceAttachment(order);
  return safeSend({
    to: order.shippingAddress.email,
    subject,
    html,
    attachments: invoice ? [invoice] : undefined,
  });
}