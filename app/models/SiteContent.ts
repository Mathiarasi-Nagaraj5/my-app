import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHeroSlide {
  eyebrow: string;
  headline: string; // supports \n for line breaks, same as HeroSlider.tsx used
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  accentColor: string;
  panelColor: string;
  imageOnly?: boolean; // if true, only the image is shown, no text
}

export interface IInstagramPost {
  imageUrl: string;
  postUrl: string; // instagram post link, or a product page
  alt?: string;
}

export interface ISiteContent extends Document {
  topBar: string[];
  marquee: string[];
  heroSlides: IHeroSlide[];
  instagramHandle: string;
  instagramPosts: IInstagramPost[];
  updatedAt: Date;
  policy: string; // Markdown content for the policy page
  home: Record<string, unknown>; // for future home page content
  instagramName?: string;
instagramBio?: string;
instagramAvatar?: string;
instagramPostCount?: string;
instagramFollowers?: string;
instagramFollowing?: string;
}

const HeroSlideSchema = new Schema<IHeroSlide>(
  {
    imageOnly: { type: Boolean, default: false },
    eyebrow: { type: String, default: "" },
    headline: { type: String, default: "" },
    sub: { type: String, default: "" },
    ctaLabel: { type: String, default: "" },
    ctaHref: { type: String, default: "" },
    image: { type: String, required: true },
    accentColor: { type: String, default: "#C9A96E" },
    panelColor: { type: String, default: "#F5F5F5" },
  },
  { _id: false }
);

// inside SiteContentSchema:

const InstagramPostSchema = new Schema<IInstagramPost>(
  {
    imageUrl: { type: String, required: true },
    postUrl: { type: String, required: true },
    alt: { type: String, default: "" },
  },
  { _id: false }
);

const SiteContentSchema = new Schema<ISiteContent>(
  {
    topBar: { type: [String], default: ["Free Delivery on Online Payments", "Cash on delivery available", "Easy 7-day returns"] },
    marquee: { type: [String], default: ["✨ Free Shipping on Online Payments", "💖 Premium Quality", "🚚 Fast Delivery", "🎁 New Collection Available"] },
    heroSlides: { type: [HeroSlideSchema], default: [] },
    instagramHandle: { type: String, default: "", trim: true },
    instagramPosts: {
      type: [InstagramPostSchema],
      default: [],
      validate: {
        validator: (arr: IInstagramPost[]) => arr.length <= 6,
        message: "You can add at most 6 Instagram posts",
      },
    },
    home: { type: Schema.Types.Mixed, default: {} },
    policy: { type: String, default: "" },
 instagramName: { type: String, default: "", trim: true },
instagramBio: { type: String, default: "", trim: true },
instagramAvatar: { type: String, default: "" },
instagramPostCount: { type: String, default: "", trim: true },
instagramFollowers: { type: String, default: "", trim: true },
instagramFollowing: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

const SiteContent: Model<ISiteContent> =
  mongoose.models.SiteContent || mongoose.model<ISiteContent>("SiteContent", SiteContentSchema);

export default SiteContent;