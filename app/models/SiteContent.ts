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
}

export interface ISiteContent extends Document {
  topBar: string[];
  marquee: string[];
  heroSlides: IHeroSlide[];
  updatedAt: Date;
}

const HeroSlideSchema = new Schema<IHeroSlide>(
  {
    eyebrow: { type: String, required: true },
    headline: { type: String, required: true },
    sub: { type: String, required: true },
    ctaLabel: { type: String, required: true },
    ctaHref: { type: String, required: true },
    image: { type: String, required: true },
    accentColor: { type: String, default: "#C9A96E" },
    panelColor: { type: String, default: "#F5F5F5" },
  },
  { _id: false }
);

const SiteContentSchema = new Schema<ISiteContent>(
  {
    topBar: { type: [String], default: ["Free delivery above ₹999", "Cash on delivery available", "Easy 7-day returns"] },
    marquee: { type: [String], default: ["✨ Free Shipping Above ₹999", "💖 Premium Quality", "🚚 Fast Delivery", "🎁 New Collection Available"] },
    heroSlides: { type: [HeroSlideSchema], default: [] },
  },
  { timestamps: true }
);

const SiteContent: Model<ISiteContent> =
  mongoose.models.SiteContent || mongoose.model<ISiteContent>("SiteContent", SiteContentSchema);

export default SiteContent;