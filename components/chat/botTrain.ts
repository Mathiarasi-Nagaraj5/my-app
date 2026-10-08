export interface BotReply {
  text: string;
  link?: { label: string; href: string };
  suggestions?: string[];
}

interface Intent {
  id: string;
  keywords: string[];   // lowercase; a match on any keyword triggers it
  reply: BotReply;
}

// ✏️ EDIT THESE ANSWERS to match your real policies
const INTENTS: Intent[] = [
  {
    id: "greeting",
    keywords: ["hi", "hello", "hey", "hii", "namaste", "vanakkam"],
    reply: {
      text: "Hi! 👋 How can I help you today?",
      suggestions: ["Size guide", "Delivery time", "Return policy", "Track my order"],
    },
  },
  {
    id: "delivery",
    keywords: ["delivery", "deliver", "shipping", "ship", "arrive", "how long", "days"],
    reply: {
      text: "Delivery is free and usually takes 4-6 days. Orders paid online also get free delivery. Cash on delivery is available.",
      suggestions: ["Return policy", "Track my order"],
    },
  },
  {
    id: "returns",
    keywords: ["return", "refund", "exchange", "replace", "cancel"],
    reply: {
      // ✏️ replace with your real policy
      text: "[Add your return/exchange policy here: how many days, condition of item, how to request.]",
      suggestions: ["Size guide", "Contact support"],
    },
  },
  {
    id: "size",
    keywords: ["size", "sizes", "fit", "measurement", "chart", "xxl", "3xl", "4xl", "5xl"],
    reply: {
      text: "We have sizes S to 5XL. Every product page has a 'Size chart' button next to the size selector. If you're between sizes, size up for a relaxed fit.",
      suggestions: ["Customization", "Delivery time"],
    },
  },
  {
    id: "payment",
    keywords: ["payment", "pay", "cod", "cash on delivery", "upi", "card"],
    reply: {
      text: "You can pay online (free delivery) or choose Cash on Delivery at checkout.",
    },
  },
  {
    id: "custom",
    keywords: ["custom", "customize", "customise", "embroidery", "tailor"],
    reply: {
      text: "Yes, we do custom fit, size and embroidery. Tap 'Customize on WhatsApp' on any product page, or message us directly.",
    },
  },
  {
    id: "track",
    keywords: ["track", "order status", "where is my order", "my order", "tracking"],
    reply: {
      // ✏️ if you have an order-tracking page, put its URL below
      text: "To check your order, please message us on WhatsApp with your order number and phone number, and we'll update you right away.",
    },
  },
  {
    id: "contact",
    keywords: ["contact", "support", "help", "email", "call", "phone", "whatsapp", "human", "agent"],
    reply: {
      text: "You can reach us by email at elitesoul25@gmail.com or on WhatsApp.",
    },
  },
  {
    id: "thanks",
    keywords: ["thanks", "thank you", "thx", "ok thanks"],
    reply: { text: "You're welcome! 😊 Anything else I can help with?" },
  },
];

const FALLBACK: BotReply = {
  text: "I'm not sure about that one. Our team can help you directly on WhatsApp.",
  suggestions: ["Delivery time", "Return policy", "Size guide"],
};

// Product words → search the catalogue instead
const PRODUCT_WORDS = [
  "tshirt", "t-shirt", "tee", "hoodie", "hoodies", "pant", "pants",
  "pyjama", "pajama", "price", "cost", "color", "colour", "available", "stock",
];

export function matchIntent(input: string): { reply: BotReply } | { search: string } {
  const text = input.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return { reply: FALLBACK };

  // 1. best-scoring intent (longer keyword = stronger match)
  let best: { intent: Intent; score: number } | null = null;
  for (const intent of INTENTS) {
    let score = 0;
    for (const k of intent.keywords) {
      const re = new RegExp(`(^|\\s)${k}(\\s|$)`);
      if (re.test(text)) score += k.length;
    }
    if (score > 0 && (!best || score > best.score)) best = { intent, score };
  }
  if (best) return { reply: best.intent.reply };

  // 2. product question → catalogue search
  if (PRODUCT_WORDS.some((w) => text.includes(w))) return { search: text };

  return { reply: FALLBACK };
}