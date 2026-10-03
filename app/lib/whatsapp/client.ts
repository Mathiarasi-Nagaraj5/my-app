const WHATSAPP_API_VERSION = "v21.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

interface SendTemplateParams {
  to: string; // E.164 format, e.g. "919876543210" (no +)
  templateName: string;
  languageCode?: string;
  bodyParams: string[]; // positional values for {{1}}, {{2}}, ... in the template
}

// Sends a pre-approved WhatsApp message template via Meta's Cloud API.
// Business-initiated messages (not a reply within 24h of the customer
// messaging you) MUST use an approved template — a plain free-text message
// will be rejected by Meta outside that window. Templates are created and
// approved in Meta Business Manager, not from code.
export async function sendWhatsAppTemplate({ to, templateName, languageCode = "en", bodyParams }: SendTemplateParams) {
  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.warn("WhatsApp not configured — skipping send.");
    return null;
  }

  const res = await fetch(`https://graph.facebook.com/${WHATSAPP_API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components: [
          {
            type: "body",
            parameters: bodyParams.map((text) => ({ type: "text", text })),
          },
        ],
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`WhatsApp send failed (${res.status}): ${body}`);
    return null;
  }

  return res.json();
}

// Normalizes a 10-digit Indian number into the E.164-ish format WhatsApp
// expects (country code, no +, no spaces/dashes).
export function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits; // already has a country code
}