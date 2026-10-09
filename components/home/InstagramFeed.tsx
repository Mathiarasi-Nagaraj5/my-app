import Image from "next/image";

interface InstagramPost {
  imageUrl: string;
  postUrl: string;
  alt?: string;
}

interface InstagramFeedProps {
  title?: string;
  handle?: string;
  name?: string;
  bio?: string;
  avatar?: string;
  postCount?: string;
  followers?: string;
  following?: string;
  posts?: InstagramPost[];
}

const IG_GRADIENT =
  "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)";

function InstagramIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function InstagramFeed({
  title = "Follow Us on Instagram",
  handle,
  name,
  bio,
  avatar,
  postCount,
  followers,
  following,
  posts = [],
}: InstagramFeedProps) {
  if (!handle || posts.length === 0) return null;

  const clean = handle.replace(/^@/, "");
  const profileUrl = `https://www.instagram.com/${clean}`;

  const stats = [
    { value: postCount, label: "posts" },
    { value: followers, label: "followers" },
    { value: following, label: "following" },
  ].filter((s) => s.value);

  return (
    <section className="bg-ivory px-6 py-16">
      <div className="mx-auto max-w-3xl">
        {/* Heading + divider (matches the other sections) */}
        <div className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-medium text-charcoal">{title}</h2>
          <div className="mt-4 flex items-center justify-center gap-3" aria-hidden="true">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-pink md:w-28" />
            <span className="text-sm leading-none text-pink">✦</span>
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-pink md:w-28" />
          </div>
        </div>

        {/* Profile card */}
        <div className="flex flex-col items-center gap-6 rounded-3xl border border-charcoal/10 bg-white p-6 shadow-md shadow-pink/10 sm:flex-row sm:p-8">
          <div className="shrink-0 rounded-full p-[3px]" style={{ background: IG_GRADIENT }}>
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-charcoal/10 sm:h-28 sm:w-28">
              {avatar ? (
                <Image src={avatar} alt={name || clean} fill className="object-cover" sizes="112px" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-3xl font-semibold uppercase text-charcoal/50">
                  {clean.charAt(0)}
                </span>
              )}
            </div>
          </div>

          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <h3 className="text-xl font-semibold text-charcoal">{clean}</h3>
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-pink px-5 py-1.5 text-xs font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(236,72,153,0.45)]"
              >
                Follow
              </a>
            </div>

            {stats.length > 0 && (
              <div className="mt-3 flex justify-center gap-5 text-sm text-charcoal/70 sm:justify-start">
                {stats.map((s) => (
                  <span key={s.label}>
                    <strong className="text-charcoal">{s.value}</strong> {s.label}
                  </span>
                ))}
              </div>
            )}

            {name && <p className="mt-3 text-sm font-semibold text-charcoal">{name}</p>}
            {bio && (
              <p className="mt-1 max-w-md whitespace-pre-line text-sm text-charcoal/70">{bio}</p>
            )}
          </div>
        </div>

        {/* Posts, 3 x 2 */}
        <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
          {posts.slice(0, 6).map((post, i) => (
            <a
              key={i}
              href={post.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={post.alt || `Instagram post ${i + 1}`}
              className="group relative block aspect-square overflow-hidden rounded-xl bg-charcoal shadow-md shadow-pink/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(236,72,153,0.35)]"
            >
              <Image
                src={post.imageUrl}
                alt={post.alt || `Instagram post ${i + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 33vw, 240px"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-pink/40 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                <InstagramIcon className="h-7 w-7" />
              </span>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(236,72,153,0.4)]"
            style={{ background: IG_GRADIENT }}
          >
            <InstagramIcon className="h-4 w-4" />
            Follow @{clean}
          </a>
          <p className="mt-3 text-sm text-charcoal/60">
            New arrivals, styling ideas and customer favourites.
          </p>
        </div>
      </div>
    </section>
  );
}