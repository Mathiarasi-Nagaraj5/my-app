import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.warn("RESEND_API_KEY is not set — emails will fail to send.");
}

export const resend = new Resend(apiKey);
export const EMAIL_FROM = process.env.EMAIL_FROM || "Elite Soul <orders@example.com>";