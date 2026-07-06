const messages = [
  "free delivery above ₹999",
  "cash on delivery available",
  "easy 7-day returns",
];

export default function AnnouncementBar() {
  return (
    <div className="bg-charcoal py-2.5 text-center text-xs text-ivory">
      {messages.join("  ·  ")}
    </div>
  );
}