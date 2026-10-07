import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import SiteContent from "@/app/models/SiteContent";
import { requireAdmin } from "@/app/lib/auth/requireAdmin";

// GET — public, used by the homepage to render current content.
export async function GET() {
  try {
    await connectDB();
    // Singleton pattern: always fetch (or create) the one document —
    // there's no concept of multiple site-content records.
    let content = await SiteContent.findOne();
    if (!content) {
      content = await SiteContent.create({});
    }
    return NextResponse.json({ success: true, data: content });
  } catch (error) {
    console.error("Fetch Site Content Error:", error);
    return NextResponse.json({ success: false, message: "failed to load site content" }, { status: 500 });
  }
}

// PUT — admin only. Replaces topBar/marquee/heroSlides wholesale, matching
// how the admin editor below sends the full arrays each save.
export async function PUT(req: Request) {
  const adminCheck = await requireAdmin();
  console.log(
  "SITE CONTENT SCHEMA PATHS:",
  Object.keys(SiteContent.schema.paths)
);

  if (!adminCheck.ok) {
    return NextResponse.json(
      {
        success: false,
        message: adminCheck.message,
      },
      { status: adminCheck.status }
    );
  }

  try {
    await connectDB();

    const body = await req.json();

const { topBar, marquee, heroSlides, contact, policy, instagramHandle, instagramPosts, home,instagramName, instagramBio, instagramAvatar,
        instagramPostCount, instagramFollowers, instagramFollowing  } = body;
console.log("PUT BODY:", body);
    const update: Record<string, unknown> = {};

    if (home && typeof home === "object") {
  const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const bool = (v: unknown) => v !== false;
  const clean: Record<string, unknown> = {};

  if (home.categories) {
    clean.categories = {
      enabled: bool(home.categories.enabled),
      title: str(home.categories.title),
      items: (Array.isArray(home.categories.items) ? home.categories.items : [])
        .filter((i: any) => i && str(i.image) && str(i.name))
        .slice(0, 6)
        .map((i: any) => ({ name: str(i.name, 60), image: str(i.image, 500), href: str(i.href, 300) || "/shop" })),
    };
  }

  if (home.products) {
    const ids = ["new", "best", "trending"];
    clean.products = {
      enabled: bool(home.products.enabled),
      tabs: (Array.isArray(home.products.tabs) ? home.products.tabs : [])
        .filter((t: any) => t && ids.includes(t.id))
        .map((t: any) => ({
          id: t.id,
          label: str(t.label, 40) || t.id,
          enabled: bool(t.enabled),
          count: Math.min(Math.max(Number(t.count) || 8, 3), 12),
        })),
    };
  }

  if (home.why) {
    clean.why = {
      enabled: bool(home.why.enabled),
      items: (Array.isArray(home.why.items) ? home.why.items : [])
        .filter((i: any) => i && str(i.title))
        .slice(0, 4)
        .map((i: any) => ({ icon: str(i.icon, 20), title: str(i.title, 40), sub: str(i.sub, 80) })),
    };
  }

  if (home.testimonials) {
    clean.testimonials = {
      enabled: bool(home.testimonials.enabled),
      title: str(home.testimonials.title),
      minRating: Math.min(Math.max(Number(home.testimonials.minRating) || 0, 0), 5),
      limit: Math.min(Math.max(Number(home.testimonials.limit) || 6, 1), 12),
    };
  }

  if (home.instagram) clean.instagram = { enabled: bool(home.instagram.enabled) };

  update.home = clean;
}
    if (Array.isArray(topBar)) {
      update.topBar = topBar.filter(
        (s) => typeof s === "string" && s.trim()
      );
    }

    if (Array.isArray(marquee)) {
      update.marquee = marquee.filter(
        (s) => typeof s === "string" && s.trim()
      );
    }

    if (Array.isArray(heroSlides)) {
      update.heroSlides = heroSlides;
    }

    if (contact && typeof contact === "object") {
      update.contact = contact;
    }

    // IMPORTANT
    if (typeof policy === "string") {
      update.policy = policy;
    }

    if (typeof instagramHandle === "string") {
  update.instagramHandle = instagramHandle.trim().replace(/^@/, "");
}

if (Array.isArray(instagramPosts)) {
  update.instagramPosts = instagramPosts
    .filter(
      (p: any) =>
        p &&
        typeof p.imageUrl === "string" &&
        p.imageUrl.trim() &&
        typeof p.postUrl === "string" &&
        /^https?:\/\//.test(p.postUrl.trim())
    )
    .slice(0, 6)
    .map((p: any) => ({
      imageUrl: p.imageUrl.trim(),
      postUrl: p.postUrl.trim(),
      alt: typeof p.alt === "string" ? p.alt.trim() : "",
    }));
}
    console.log("UPDATE OBJECT:", update);
    console.log("POLICY:", JSON.stringify(policy));

    const short = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);

const igFields = {
  instagramName: short(instagramName, 60),
  instagramBio: short(instagramBio, 200),
  instagramAvatar: short(instagramAvatar, 500),
  instagramPostCount: short(instagramPostCount, 10),
  instagramFollowers: short(instagramFollowers, 10),
  instagramFollowing: short(instagramFollowing, 10),
};
for (const [k, v] of Object.entries(igFields)) {
  if (v !== undefined) update[k] = v;
}
    let content = await SiteContent.findOne();

    if (!content) {
      content = await SiteContent.create(update);
    } else {
      // Direct MongoDB update
      content = await SiteContent.findOneAndUpdate(
        { _id: content._id },
        { $set: update },
        {
          new: true,
          runValidators: true,
        }
      );
    }

    console.log(
      "SAVED POLICY:",
      JSON.stringify(content?.policy)
    );

    return NextResponse.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("Update Site Content Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "failed to save site content",
      },
      { status: 500 }
    );
  }
}