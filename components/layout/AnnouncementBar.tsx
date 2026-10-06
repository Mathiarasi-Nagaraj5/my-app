"use client";

interface AnnouncementBarProps {
  items?: string[];
}

export default function AnnouncementBar({
  items = [],
}: AnnouncementBarProps) {
  return (
   
    <div className="bg-black text-white text-sm py-2 text-center sticky top-0 left-0 z-50 w-full border-b border-charcoal/10">
      {items.map((item, index) => (
        <span key={index} className="mx-4">
          {item}
        </span>
      ))}
    </div>
  );
}