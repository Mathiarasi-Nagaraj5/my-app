export interface FaqItem {
  q: string;
  a: string[]; // each string is one paragraph
}

export interface FaqCategory {
  id: string;
  label: string;
  tag: string;
  items: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "about",
    label: "About Elite Soul",
    tag: "Brand & range",
    items: [
      {
        q: "What is Elite Soul?",
        a: [
          "Elite Soul is an Indian clothing brand making oversized t-shirts, hoodies and pyjama sets for everyday comfort.",
          "We focus on heavyweight cotton, good fits and honest pricing.",
        ],
      },
      {
        q: "What products do you offer?",
        a: [
          "Oversized t-shirts, hoodies (including fleece-lined) and pyjama sets. New styles are added regularly, so check New Arrivals on the shop page.",
        ],
      },
      {
        q: "Are your products unisex?",
        a: [
          "Our oversized fits are designed to be worn by anyone. Check the size options on each product page.",
        ],
      },
    ],
  },
  {
    id: "sizing",
    label: "Sizing & Fit",
    tag: "Find your size",
    items: [
      {
        q: "What sizes are available?",
        a: [
          "Most styles come in S to 5XL. Some styles have fewer sizes, and the available sizes are shown on each product page.",
        ],
      },
      {
        q: "How does the oversized fit run?",
        a: [
          "Our oversized pieces are cut to be relaxed and roomy. If you prefer a regular fit, consider going one size down.",
        ],
      },
      {
        q: "Can I exchange if the size doesn't fit?",
        a: [
          "Yes, you can return an item within 7 days of delivery. See our returns section below and the Policy page for details.",
        ],
      },
    ],
  },
  {
    id: "orders",
    label: "Orders & Delivery",
    tag: "Shipping",
    items: [
      {
        q: "Is delivery free?",
        a: [
          "Delivery is free on all orders above ₹999. A small delivery fee may apply on smaller orders, shown at checkout.",
        ],
      },
      {
        q: "How can I track my order?",
        a: [
          "Log in and open Your Orders to see the latest status. You can also ask our chat assistant to track it for you.",
        ],
      },
      {
        q: "Can I change or cancel my order?",
        a: [
          "Contact us as soon as possible with your order number. We can usually make changes before the order is shipped.",
        ],
      },
    ],
  },
  {
    id: "payments",
    label: "Payments & Returns",
    tag: "Money matters",
    items: [
      {
        q: "Do you offer Cash on Delivery?",
        a: [
          "Yes, you can pay when your order reaches you. Online payments also qualify for free delivery.",
        ],
      },
      {
        q: "What is your Return Policy?",
        a: [
          "We offer 7-day easy returns. The item should be unused and in its original condition. Full details are on our Policy page.",
        ],
      },
      {
        q: "How long do Refunds take?",
        a: [
          "Once we receive and check the returned item, the refund is processed to your original payment method. Contact us if you haven't received it in a reasonable time.",
        ],
      },
    ],
  },
  {
    id: "fabric",
    label: "Fabric & Care",
    tag: "Quality",
    items: [
      {
        q: "What fabric do you use?",
        a: [
          "Premium heavyweight cotton, 240 GSM, so it feels substantial and holds its shape.",
        ],
      },
      {
        q: "How should I wash my clothes?",
        a: [
          "Machine wash cold with similar colours, turn the item inside out, and avoid harsh bleach. Dry in shade to keep colours and prints looking fresh.",
        ],
      },
    ],
  },
];