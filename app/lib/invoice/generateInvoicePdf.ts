import PDFDocument from "pdfkit";
import type { IOrder } from "@/app/models/Order";
import { computeGstForItem, splitGst } from "./gst";

const formatINR = (v: number) => `Rs. ${v.toLocaleString("en-IN")}`;

// Brand accent — matches the app's pink (#e0629b) used in CheckoutSteps'
// Razorpay theme color, so the invoice doesn't look like a disconnected
// system-generated afterthought.
const ACCENT = "#e0629b";
const DARK = "#1a1a1a";
const MUTED = "#6b6b6b";
const LIGHT_BG = "#faf7f8";

export function generateInvoicePdf(order: IOrder): Promise<Buffer> {
  const chunks: Buffer[] = [];
  const doc = new PDFDocument({ size: "A4", margin: 0 });

  doc.on("data", (chunk) => chunks.push(chunk));

  return new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const businessName = process.env.BUSINESS_NAME || "Elite Soul";
    const businessAddress = process.env.BUSINESS_ADDRESS || "";
    const businessGstin = process.env.BUSINESS_GSTIN || "";
    const supportEmail = process.env.SUPPORT_EMAIL || "";
    const pageWidth = doc.page.width;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;

    // ---- Header bar ----
    doc.rect(0, 0, pageWidth, 90).fill(ACCENT);
    doc.fillColor("#fff").fontSize(22).font("Helvetica-Bold").text(businessName, margin, 30);
    doc.fontSize(9).font("Helvetica").fillColor("#ffe6f0");
    if (businessAddress) doc.text(businessAddress, margin, 58, { width: contentWidth - 180 });

    doc.fontSize(18).font("Helvetica-Bold").fillColor("#fff").text("TAX INVOICE", margin, 30, {
      width: contentWidth,
      align: "right",
    });
    doc.fontSize(9).font("Helvetica").fillColor("#ffe6f0");
    doc.text(`Order #${order.orderNumber}`, margin, 58, { width: contentWidth, align: "right" });
    doc.text(new Date(order.createdAt).toLocaleDateString("en-IN"), margin, 71, {
      width: contentWidth,
      align: "right",
    });

    let y = 115;

    // GSTIN line, below the header bar
    doc.fontSize(9).fillColor(businessGstin ? MUTED : "#c00");
    doc.text(businessGstin ? `GSTIN: ${businessGstin}` : "GSTIN not configured — set BUSINESS_GSTIN", margin, y);
    y += 25;

    // ---- Billed to card ----
    doc.roundedRect(margin, y, contentWidth, 70, 4).fill(LIGHT_BG);
    doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold").text("BILLED TO", margin + 14, y + 12);
    doc.font("Helvetica").fontSize(10).fillColor(DARK);
    doc.text(order.shippingAddress.fullName, margin + 14, y + 27);
    doc.fontSize(9).fillColor(MUTED);
    doc.text(order.shippingAddress.phone, margin + 14, y + 42);
    doc.text(
      `${order.shippingAddress.addressLine}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`,
      margin + 14,
      y + 55,
      { width: contentWidth - 28 }
    );
    y += 90;

    // ---- Items table ----
    const col = { name: margin, qty: margin + 210, taxable: margin + 260, rate: margin + 330, tax: margin + 380, total: margin + 440 };

    doc.rect(margin, y, contentWidth, 22).fill(DARK);
    doc.fillColor("#fff").fontSize(8.5).font("Helvetica-Bold");
    doc.text("ITEM", col.name + 10, y + 7);
    doc.text("QTY", col.qty, y + 7);
    doc.text("TAXABLE", col.taxable, y + 7);
    doc.text("GST%", col.rate, y + 7);
    doc.text("TAX", col.tax, y + 7);
    doc.text("TOTAL", col.total, y + 7);
    y += 22;

    let totalTaxableValue = 0;
    let totalTax = 0;

    order.items.forEach((item, i) => {
      const gst = computeGstForItem(item.price, item.quantity);
      totalTaxableValue += gst.taxableValue;
      totalTax += gst.taxAmount;

      const rowHeight = 26;
      if (i % 2 === 1) doc.rect(margin, y, contentWidth, rowHeight).fill(LIGHT_BG);

      doc.fillColor(DARK).fontSize(9).font("Helvetica");
      doc.text(item.name, col.name + 10, y + 8, { width: 195 });
      doc.text(String(item.quantity), col.qty, y + 8);
      doc.text(gst.taxableValue.toFixed(2), col.taxable, y + 8);
      doc.text(`${gst.taxRate}%`, col.rate, y + 8);
      doc.text(gst.taxAmount.toFixed(2), col.tax, y + 8);
      doc.font("Helvetica-Bold").text(formatINR(gst.grossValue), col.total, y + 8);
      y += rowHeight;
    });

    doc.moveTo(margin, y).lineTo(margin + contentWidth, y).strokeColor("#ddd").lineWidth(1).stroke();
    y += 16;

    // ---- Totals block, right-aligned ----
    const gstSplit = splitGst(totalTax, order.shippingAddress.state);
    const totalsX = margin + 300;
    const totalsWidth = contentWidth - 300;

    function totalsRow(label: string, value: string, bold = false) {
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(bold ? 11 : 9.5).fillColor(DARK);
      doc.text(label, totalsX, y, { width: totalsWidth * 0.55 });
      doc.text(value, totalsX, y, { width: totalsWidth, align: "right" });
      y += bold ? 20 : 16;
    }

    totalsRow("Taxable Value", formatINR(totalTaxableValue));
    if (gstSplit.isIntraState) {
      totalsRow("CGST", formatINR(gstSplit.cgst));
      totalsRow("SGST", formatINR(gstSplit.sgst));
    } else {
      totalsRow("IGST", formatINR(gstSplit.igst));
    }
    totalsRow("Delivery", order.delivery === 0 ? "Free" : formatINR(order.delivery));
    if (order.discount > 0) {
      totalsRow(`Discount${order.promoCode ? ` (${order.promoCode})` : ""}`, `- ${formatINR(order.discount)}`);
    }

    y += 4;
    doc.moveTo(totalsX, y).lineTo(margin + contentWidth, y).strokeColor(ACCENT).lineWidth(1.5).stroke();
    y += 8;
    totalsRow("Grand Total", formatINR(order.total), true);

    y += 20;

    // ---- Payment + place of supply ----
    doc.fontSize(9).fillColor(MUTED).font("Helvetica");
    doc.text(`Payment: ${order.paymentMethod.toUpperCase()} — ${order.paymentStatus}`, margin, y);
    doc.text(`Place of Supply: ${order.shippingAddress.state}`, margin, y + 14);

    // ---- Footer ----
    const footerY = doc.page.height - 90;
    doc.moveTo(margin, footerY).lineTo(margin + contentWidth, footerY).strokeColor("#eee").lineWidth(1).stroke();
    doc.fontSize(11).font("Helvetica-Bold").fillColor(ACCENT).text("Thank you for your order!", margin, footerY + 14);
    doc.fontSize(8).font("Helvetica").fillColor(MUTED);
    doc.text(
      supportEmail ? `Questions about this invoice? Reach us at ${supportEmail}.` : "This is a system-generated invoice.",
      margin,
      footerY + 30
    );

    doc.end();
  });
}