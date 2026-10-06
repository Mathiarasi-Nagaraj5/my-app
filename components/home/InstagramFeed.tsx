import Image from "next/image";
// import  Instagram  from "lucide-react";

interface InstagramPost {
  imageUrl: string;
  postUrl: string;
  alt?: string;
}

interface InstagramFeedProps {
  handle?: string;
  posts?: InstagramPost[];
}

export default function InstagramFeed({ handle, posts = [] }: InstagramFeedProps) {
  // don't render an empty section
  console.log(handle,posts,'handle and posts')
  if (!handle || posts.length === 0) return null;

  const cleanHandle = handle.replace(/^@/, "");
  const profileUrl = `https://www.instagram.com/${cleanHandle}`;

  return (
    <section className="bg-ivory py-14">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="font-serif text-2xl text-charcoal md:text-3xl">Styled by you</h2>
          <p className="mt-2 text-sm text-charcoal/60">
            Real customers, real fits. Tag @{cleanHandle} to be featured.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          {posts.slice(0, 6).map((post, i) => (
            <a
              key={i}
              href={post.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={post.alt || `Instagram post ${i + 1}`}
              className="group relative block aspect-square overflow-hidden rounded bg-charcoal"
            >
              <Image
                src={post.imageUrl}
                alt={post.alt || `Instagram post ${i + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-charcoal/0 transition-colors duration-300 group-hover:bg-charcoal/40">
                {/* <Instagram
                  size={26}
                  className="text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                /> */}
              </span>
            </a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-pink px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            {/* {/* <Instagram size={16} /> */}
            Follow @{cleanHandle}
          </a>
        </div>
      </div>
    </section>
  );
}