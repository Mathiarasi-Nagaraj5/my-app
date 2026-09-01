"use client";

interface AnnouncementBarProps {
  items?: string[];
}

export default function AnnouncementBar({
  items = [],
}: AnnouncementBarProps) {
  return (
    <div className="bg-black text-white text-sm py-2 text-center">
      {items.map((item, index) => (
        <span key={index} className="mx-4">
          {item}
        </span>
      ))}
    </div>
  );
}