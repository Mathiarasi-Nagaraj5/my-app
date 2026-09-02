"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { IHeroSlide } from "@/app/models/SiteContent";

interface SiteContentValues {
  topBar: string[];
  marquee: string[];
  heroSlides: IHeroSlide[];
}

const EMPTY_SLIDE: IHeroSlide = {
  eyebrow: "",
  headline: "",
  sub: "",
  ctaLabel: "",
  ctaHref: "/shop",
  image: "",
  accentColor: "#C9A96E",
  panelColor: "#F5F5F5",
};

export default function SiteContentEditor() {
  const [values, setValues] = useState<SiteContentValues>({ topBar: [], marquee: [], heroSlides: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/site-content")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setValues(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message ?? "failed to save");
        return;
      }
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  // ── list-of-strings helpers (topBar, marquee) ──
  const updateListItem = (key: "topBar" | "marquee", idx: number, value: string) => {
    setValues((v) => ({ ...v, [key]: v[key].map((item, i) => (i === idx ? value : item)) }));
  };
  const addListItem = (key: "topBar" | "marquee") => {
    setValues((v) => ({ ...v, [key]: [...v[key], ""] }));
  };
  const removeListItem = (key: "topBar" | "marquee", idx: number) => {
    setValues((v) => ({ ...v, [key]: v[key].filter((_, i) => i !== idx) }));
  };

  // ── hero slides helpers ──
  const updateSlide = (idx: number, field: keyof IHeroSlide, value: string) => {
    setValues((v) => ({
      ...v,
      heroSlides: v.heroSlides.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    }));
  };
  const addSlide = () => {
    if (values.heroSlides.length >= 5) return;
    setValues((v) => ({ ...v, heroSlides: [...v.heroSlides, { ...EMPTY_SLIDE }] }));
  };
  const removeSlide = (idx: number) => {
    setValues((v) => ({ ...v, heroSlides: v.heroSlides.filter((_, i) => i !== idx) }));
  };
  const moveSlide = (from: number, to: number) => {
    if (to < 0 || to >= values.heroSlides.length) return;
    setValues((v) => {
      const slides = [...v.heroSlides];
      const [item] = slides.splice(from, 1);
      slides.splice(to, 0, item);
      return { ...v, heroSlides: slides };
    });
  };

  if (loading) return <p className="text-sm text-charcoal/55">loading site content...</p>;

  return (
    <div className="flex flex-col gap-8">
      {/* Top bar */}
      <section>
        <h2 className="mb-3 text-lg font-medium text-charcoal">Top Offer Bar</h2>
        <p className="mb-3 text-xs text-charcoal/50">
          The thin black strip above the navbar — shown as one line, separated by dots.
        </p>
        <div className="flex flex-col gap-2">
          {values.topBar.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={item}
                onChange={(e) => updateListItem("topBar", idx, e.target.value)}
                placeholder="e.g. Free delivery above ₹999"
                className="h-9 flex-1 rounded border border-charcoal/25 px-3 text-sm"
              />
              <button
                type="button"
                onClick={() => removeListItem("topBar", idx)}
                className="text-charcoal/40 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addListItem("topBar")}
            className="flex w-fit items-center gap-1 text-xs text-charcoal/60 hover:text-charcoal"
          >
            <Plus size={14} /> add line
          </button>
        </div>
      </section>

      {/* Marquee */}
      <section>
        <h2 className="mb-3 text-lg font-medium text-charcoal">Scrolling Marquee</h2>
        <p className="mb-3 text-xs text-charcoal/50">The pink scrolling strip below the hero.</p>
        <div className="flex flex-col gap-2">
          {values.marquee.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={item}
                onChange={(e) => updateListItem("marquee", idx, e.target.value)}
                placeholder="e.g. ✨ Free Shipping Above ₹999"
                className="h-9 flex-1 rounded border border-charcoal/25 px-3 text-sm"
              />
              <button
                type="button"
                onClick={() => removeListItem("marquee", idx)}
                className="text-charcoal/40 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addListItem("marquee")}
            className="flex w-fit items-center gap-1 text-xs text-charcoal/60 hover:text-charcoal"
          >
            <Plus size={14} /> add line
          </button>
        </div>
      </section>

      {/* Hero slides */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium text-charcoal">Hero Slides ({values.heroSlides.length}/5)</h2>
          {values.heroSlides.length < 5 && (
            <button
              type="button"
              onClick={addSlide}
              className="flex items-center gap-1 rounded border border-charcoal px-3 py-1.5 text-xs text-charcoal hover:bg-charcoal hover:text-ivory"
            >
              <Plus size={14} /> add slide
            </button>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {values.heroSlides.map((slide, idx) => (
            <div key={idx} className="rounded border border-charcoal/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-charcoal/60">
                  <GripVertical size={14} /> Slide {idx + 1}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <button type="button" onClick={() => moveSlide(idx, idx - 1)} disabled={idx === 0} className="text-charcoal/50 hover:text-charcoal disabled:opacity-30">
                    ↑ move up
                  </button>
                  <button type="button" onClick={() => moveSlide(idx, idx + 1)} disabled={idx === values.heroSlides.length - 1} className="text-charcoal/50 hover:text-charcoal disabled:opacity-30">
                    ↓ move down
                  </button>
                  <button type="button" onClick={() => removeSlide(idx)} className="text-red-500 hover:text-red-700">
                    remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-charcoal/60">Eyebrow (small label)</label>
                  <input value={slide.eyebrow} onChange={(e) => updateSlide(idx, "eyebrow", e.target.value)} placeholder="This Season" className="h-9 w-full rounded border border-charcoal/25 px-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-charcoal/60">CTA Button Label</label>
                  <input value={slide.ctaLabel} onChange={(e) => updateSlide(idx, "ctaLabel", e.target.value)} placeholder="Shop Hoodies" className="h-9 w-full rounded border border-charcoal/25 px-3 text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-charcoal/60">
                    Headline <span className="text-charcoal/40">(use a new line for a line break)</span>
                  </label>
                  <textarea
                    value={slide.headline}
                    onChange={(e) => updateSlide(idx, "headline", e.target.value)}
                    rows={2}
                    placeholder={"Wrap yourself\nin warmth."}
                    className="w-full rounded border border-charcoal/25 px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-charcoal/60">Subtext</label>
                  <input value={slide.sub} onChange={(e) => updateSlide(idx, "sub", e.target.value)} placeholder="Fleece-lined hoodies that feel like a second skin." className="h-9 w-full rounded border border-charcoal/25 px-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-charcoal/60">CTA Link</label>
                  <input value={slide.ctaHref} onChange={(e) => updateSlide(idx, "ctaHref", e.target.value)} placeholder="/shop?category=hoodies" className="h-9 w-full rounded border border-charcoal/25 px-3 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-charcoal/60">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={slide.accentColor} onChange={(e) => updateSlide(idx, "accentColor", e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-charcoal/25 p-0.5" />
                    <span className="text-xs text-charcoal/50">{slide.accentColor}</span>
                  </div>
                </div>
               <div className="sm:col-span-2">
  <label className="mb-1 block text-xs text-charcoal/60">
    Hero Image
  </label>

  <input
    type="file"
    accept="image/png"
    onChange={async (e) => {
      const file = e.target.files?.[0];

      if (!file) return;

      if (file.type !== "image/png") {
        setError("Only PNG images are allowed.");
        e.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be smaller than 5 MB.");
        e.target.value = "";
        return;
      }

      setError("");

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message ?? "Image upload failed.");
          return;
        }

        updateSlide(idx, "image", data.url);
      } catch {
        setError("Image upload failed.");
      }
    }}
    className="block w-full rounded border border-charcoal/25 px-3 py-2 text-sm"
  />

  <p className="mt-1 text-xs text-charcoal/40">
    PNG only · Maximum 5 MB
  </p>

  {slide.image && (
    <div className="mt-3">
      <img
        src={slide.image}
        alt="Hero preview"
        className="h-32 w-52 rounded border border-charcoal/15 object-cover"
      />
    </div>
  )}
</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3 border-t border-charcoal/15 pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-charcoal px-6 py-2.5 text-sm text-ivory hover:bg-charcoal/90 disabled:opacity-50"
        >
          {saving ? "saving..." : "Save changes"}
        </button>
        {saved && <span className="text-xs text-green-700">Saved successfully</span>}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  );
}