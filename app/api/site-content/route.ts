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

    const { topBar, marquee, heroSlides, contact, policy } = body;

    const update: Record<string, unknown> = {};

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

    console.log("UPDATE OBJECT:", update);
    console.log("POLICY:", JSON.stringify(policy));

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