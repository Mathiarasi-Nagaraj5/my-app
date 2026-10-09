"use client";

interface AnnouncementBarProps {
  items?: string[];
}

export default function AnnouncementBar({ items = [] }: AnnouncementBarProps) {
  if (items.length === 0) return null;

  return (
    <div className="group relative w-full overflow-hidden bg-charcoal text-white">
      <style>{`
        @keyframes es-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .es-marquee-track {
          animation: es-marquee 30s linear infinite;
        }
        .group:hover .es-marquee-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .es-marquee-track { animation: none; }
        }
      `}</style>

      <div className="es-marquee-track flex w-max py-2 font-serif text-sm">
        {/* two identical groups so the loop is seamless */}
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="flex min-w-[100vw] shrink-0 items-center justify-around gap-10 px-5"
          >
            {items.map((item, i) => (
              <span key={i} className="flex items-center gap-10 whitespace-nowrap">
                {item}
                <span aria-hidden="true" className="text-xs text-white/70">
                  ✦
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}