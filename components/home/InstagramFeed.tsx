import Image from "next/image";
// import { Instagram, ExternalLink } from "lucide-react";

interface InstagramPost {
  imageUrl: string;
  postUrl: string;
  alt?: string;
}

interface InstagramFeedProps {
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

export default function InstagramFeed({
  handle, name, bio, avatar, postCount, followers, following, posts = [],
}: InstagramFeedProps) {
  if (!handle || posts.length === 0) return null;

  const clean = handle.replace(/^@/, "");
  const profileUrl = `https://www.instagram.com/${clean}`;

  console.log("InstagramFeed props:", { handle, name, bio, avatar, postCount, followers, following, posts });
  const stats = [
    { value: postCount, label: "posts" },
    { value: followers, label: "followers" },
    { value: following, label: "following" },
  ].filter((s) => s.value);
  console.log("InstagramFeed stats:", stats);

  return (
    <section className="bg-ivory px-6 py-14">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* profile card */}
        <div className="flex flex-col items-center gap-6 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:p-8">
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
              <h2 className="text-xl font-semibold text-charcoal">{clean}</h2>
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full px-5 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                style={{ background: IG_GRADIENT }}
              >
                Follow
              </a>
            </div>

            {stats.length > 0 && (
              <div className="mt-3 flex justify-center gap-5 text-sm 
               text-charcoal/70 sm:justify-start">
                {stats.map((s) => (
                  <span key={s.label}>
                    <strong className="text-charcoal">{s.value}</strong> {s.label}
                  </span>
                ))}
              </div>
            )}

            {name && <p className="mt-3 text-sm font-semibold text-charcoal">{name}</p>}
            {bio && <p className="mt-1 max-w-md whitespace-pre-line text-sm text-charcoal/70">{bio}</p>}
          </div>
        </div>

        {/* 6 posts, 3 x 2 */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {posts.slice(0, 6).map((post, i) => (
            <a
              key={i}
              href={post.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={post.alt || `Instagram post ${i + 1}`}
              className="group relative block aspect-square overflow-hidden rounded-xl bg-charcoal"
            >
              <Image
                src={post.imageUrl}
                alt={post.alt || `Instagram post ${i + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 33vw, 240px"
              />
            </a>
          ))}
        </div>

        {/* follow card */}
        <div className="flex flex-col items-center rounded-3xl bg-white p-8 text-center shadow-sm">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
            style={{ background: IG_GRADIENT }}
          >
            {/* <Instagram size={24} /> */}
          </span>
          <h3 className="mt-4 text-xl font-semibold text-charcoal">Follow us on Instagram @{clean}</h3>
          <p className="mt-2 max-w-sm text-sm text-charcoal/60">
            Follow @{clean} for new arrivals, styling ideas and customer favourites.
          </p>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full px-7 py-3 text-xs font-bold uppercase tracking-wider text-white hover:opacity-90"
            style={{ background: IG_GRADIENT }}
          >
            Follow @{clean} on Instagram
            {/* <ExternalLink size={14} /> */}
          </a>
        </div>
      </div>
    </section>
  );
}