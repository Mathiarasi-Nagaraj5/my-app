"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { IHeroSlide, IInstagramPost } from "@/app/models/SiteContent";
import HomeSectionEditor from "./HomeSectionEditor";
import { withHomeDefaults, type HomeConfig } from "@/app/lib/homeDefaults";
import CategoryTable, { AdminCategory } from "./CategoryTable";
import { useModal } from "../ui/ModalProvider";

interface SiteContentValues {
  topBar: string[];
  marquee: string[];
  heroSlides: IHeroSlide[];
  instagramHandle: string;
  instagramPosts: IInstagramPost[];
  policy: string;
  home: HomeConfig;
}

const EMPTY_SLIDE: IHeroSlide = {
  imageOnly: false,
  eyebrow: "",
  headline: "",
  sub: "",
  ctaLabel: "",
  ctaHref: "/shop",
  image: "",
  accentColor: "#C9A96E",
  panelColor: "#F5F5F5",
};

const EMPTY_POST: IInstagramPost = { imageUrl: "", postUrl: "", alt: "" };

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const heading = "mb-1 bg-black p-3 text-xl font-medium text-ivory";
const input = "h-9 w-full rounded border border-charcoal/25 px-3 text-sm";

export default function SiteContentEditor() {
  const [values, setValues] = useState<SiteContentValues>({
    topBar: [],
    marquee: [],
    heroSlides: [],
    instagramHandle: "",
    instagramPosts: [],
    policy: "",
    home: withHomeDefaults(undefined),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const normalize = (d: any): SiteContentValues => ({
    topBar: d.topBar ?? [],
    marquee: d.marquee ?? [],
    heroSlides: d.heroSlides ?? [],
    instagramHandle: d.instagramHandle ?? "",
    instagramPosts: d.instagramPosts ?? [],
    policy: d.policy ?? "",
    home: withHomeDefaults(d.home),
  });

  useEffect(() => {
    fetch("/api/site-content")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setValues(normalize(data.data));
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
        body: JSON.stringify({
          topBar: values.topBar,
          marquee: values.marquee,
          heroSlides: values.heroSlides,
          instagramHandle: values.instagramHandle,
          instagramPosts: values.instagramPosts,
          policy: values.policy,
          home: values.home,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message ?? "failed to save");
        return;
      }

      setValues(normalize(data.data));
      setSaved(true);
    } catch (err) {
      console.error("Save error:", err);
      setError("Failed to save site content");
    } finally {
      setSaving(false);
    }
  };

  // shared image upload
  const uploadImage = async (file: File, done: (url: string) => void) => {
    if (!IMAGE_TYPES.includes(file.type)) {
      setError("Only PNG, JPG or WebP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message ?? "Image upload failed.");
        return;
      }
      done(data.url);
    } catch {
      setError("Image upload failed.");
    }
  };

  // ── topBar / marquee ──
  const updateListItem = (key: "topBar" | "marquee", idx: number, value: string) =>
    setValues((v) => ({ ...v, [key]: v[key].map((item, i) => (i === idx ? value : item)) }));
  const addListItem = (key: "topBar" | "marquee") =>
    setValues((v) => ({ ...v, [key]: [...v[key], ""] }));
  const removeListItem = (key: "topBar" | "marquee", idx: number) =>
    setValues((v) => ({ ...v, [key]: v[key].filter((_, i) => i !== idx) }));

  // ── hero slides ──
  const updateSlide = (idx: number, field: keyof IHeroSlide, value: string | boolean) =>
    setValues((v) => ({
      ...v,
      heroSlides: v.heroSlides.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    }));
  const addSlide = () => {
    if (values.heroSlides.length >= 5) return;
    setValues((v) => ({ ...v, heroSlides: [...v.heroSlides, { ...EMPTY_SLIDE }] }));
  };
  const removeSlide = (idx: number) =>
    setValues((v) => ({ ...v, heroSlides: v.heroSlides.filter((_, i) => i !== idx) }));
  const moveSlide = (from: number, to: number) => {
    if (to < 0 || to >= values.heroSlides.length) return;
    setValues((v) => {
      const slides = [...v.heroSlides];
      const [item] = slides.splice(from, 1);
      slides.splice(to, 0, item);
      return { ...v, heroSlides: slides };
    });
  };

  // ── instagram posts ──
  const updatePost = (idx: number, field: keyof IInstagramPost, value: string) =>
    setValues((v) => ({
      ...v,
      instagramPosts: v.instagramPosts.map((p, i) => (i === idx ? { ...p, [field]: value } : p)),
    }));
  const addPost = () => {
    if (values.instagramPosts.length >= 6) return;
    setValues((v) => ({ ...v, instagramPosts: [...v.instagramPosts, { ...EMPTY_POST }] }));
  };
  const removePost = (idx: number) =>
    setValues((v) => ({ ...v, instagramPosts: v.instagramPosts.filter((_, i) => i !== idx) }));

  // ── categories ──
  const { confirm } = useModal();
  const [categories, setCategories] = useState<AdminCategory[]>([]);

  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async (name: string) => {
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await fetchCategories();
  };

  const handleUpdate = async (id: string, name: string) => {
    await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await fetchCategories();
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Delete category",
      message: "Delete this category? This can't be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    await fetchCategories();
  };

  if (loading) return <p className="text-sm text-charcoal/55">loading site content...</p>;

  const renderListEditor = (key: "topBar" | "marquee", placeholder: string) => (
    <div className="mt-3 flex flex-col gap-2">
      {values[key].map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            value={item}
            onChange={(e) => updateListItem(key, idx, e.target.value)}
            placeholder={placeholder}
            className={`${input} flex-1`}
          />
          <button type="button" onClick={() => removeListItem(key, idx)} className="text-charcoal/40 hover:text-red-600">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => addListItem(key)}
        className="flex w-fit items-center gap-1 text-xs text-charcoal/60 hover:text-charcoal"
      >
        <Plus size={14} /> add line
      </button>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
    
      {/* Category / tabs / why / testimonials */}
      <section>
        <h1 className={heading}>Homepage Sections</h1>
        <div className="mt-3">
            {/* Top bar + marquee */}
      <section>
        <h1 className="text-lg font-semibold text-charcoal">Top Bar &amp; Marquee</h1>
        <p className="mt-2 text-sm font-medium text-charcoal">Top Offer Bar</p>
        <p className="text-xs text-charcoal/50">The thin black strip above the navbar.</p>
        {renderListEditor("topBar", "e.g. Free Delivery on Online Payments")}

        <p className="mt-6 text-sm font-medium text-charcoal">Scrolling Marquee</p>
        <p className="text-xs text-charcoal/50">The pink scrolling strip below the hero.</p>
        {renderListEditor("marquee", "e.g. ✨ Free Shipping Above ₹999")}
      </section>

      {/* Hero slides */}
      <section>
        <div className="flex items-center justify-between ">
          <h1 className="text-lg font-semibold text-charcoal">Hero Slides ({values.heroSlides.length}/5)</h1>
          {values.heroSlides.length < 5 && (
            <button
              type="button"
              onClick={addSlide}
              className="flex items-center gap-1 rounded border border-ivory px-3 py-1.5 text-xs text-ivory hover:bg-ivory hover:text-charcoal"
            >
              <Plus size={14} /> add slide
            </button>
          )}
        </div>
        <p className="mb-3 mt-2 text-xs text-charcoal/50">
          Each slide can be image only, or an image with text and a button.
        </p>

        <div className="flex flex-col gap-4">
          {values.heroSlides.map((slide, idx) => (
            <div key={idx} className="rounded border border-charcoal/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-charcoal/60">Slide {idx + 1}</span>
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
                <label className="flex items-center gap-2 text-xs text-charcoal/70 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={!!slide.imageOnly}
                    onChange={(e) => updateSlide(idx, "imageOnly", e.target.checked)}
                  />
                  Image only (no text or button)
                </label>

                {!slide.imageOnly && (
                  <>
                    <div>
                      <label className="mb-1 block text-xs text-charcoal/60">Eyebrow (small label)</label>
                      <input value={slide.eyebrow} onChange={(e) => updateSlide(idx, "eyebrow", e.target.value)} placeholder="This Season" className={input} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-charcoal/60">Button label</label>
                      <input value={slide.ctaLabel} onChange={(e) => updateSlide(idx, "ctaLabel", e.target.value)} placeholder="Shop Hoodies" className={input} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs text-charcoal/60">
                        Headline <span className="text-charcoal/40">(new line = line break)</span>
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
                      <input value={slide.sub} onChange={(e) => updateSlide(idx, "sub", e.target.value)} placeholder="Fleece-lined hoodies that feel like a second skin." className={input} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-charcoal/60">Accent color</label>
                      <div className="flex items-center gap-2">
                        <input type="color" value={slide.accentColor} onChange={(e) => updateSlide(idx, "accentColor", e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-charcoal/25 p-0.5" />
                        <span className="text-xs text-charcoal/50">{slide.accentColor}</span>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="mb-1 block text-xs text-charcoal/60">
                    {slide.imageOnly ? "Link (optional, makes the banner clickable)" : "Button link"}
                  </label>
                  <input value={slide.ctaHref} onChange={(e) => updateSlide(idx, "ctaHref", e.target.value)} placeholder="/shop?category=hoodies" className={input} />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs text-charcoal/60">Hero image</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file, (url) => updateSlide(idx, "image", url));
                      e.target.value = "";
                    }}
                    className="block w-full rounded border border-charcoal/25 px-3 py-2 text-sm"
                  />
                  <p className="mt-1 text-xs text-charcoal/40">
                    PNG, JPG or WebP · max 5 MB ·{" "}
                    {slide.imageOnly ? "wide image about 1920×800, subject in the centre" : "transparent PNG of the model works best"}
                  </p>
                  {slide.image && (
                    <img src={slide.image} alt="Hero preview" className="mt-3 h-32 w-52 rounded border border-charcoal/15 object-cover" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

          <HomeSectionEditor
            home={values.home}
            onChange={(home) => setValues((v) => ({ ...v, home }))}
            onError={setError}
          />
        </div>
      </section>

      {/* Instagram */}
      <section>
        <div className="flex items-center justify-between bg-black p-3">
          <h1 className="text-xl font-medium text-ivory">Instagram ({values.instagramPosts.length}/6)</h1>
          {values.instagramPosts.length < 6 && (
            <button
              type="button"
              onClick={addPost}
              className="flex items-center gap-1 rounded border border-ivory px-3 py-1.5 text-xs text-ivory hover:bg-ivory hover:text-charcoal"
            >
              <Plus size={14} /> add post
            </button>
          )}
        </div>
        <p className="mb-3 mt-2 text-xs text-charcoal/50">
          Shown at the bottom of the homepage. It stays hidden until a handle and at least one post (image + link) are saved.
        </p>

        <div className="mb-4">
          <label className="mb-1 block text-xs text-charcoal/60">Instagram handle (without @)</label>
          <input
            value={values.instagramHandle}
            onChange={(e) => setValues((v) => ({ ...v, instagramHandle: e.target.value }))}
            placeholder="elitesoul"
            className={`${input} max-w-xs`}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {values.instagramPosts.map((post, idx) => (
            <div key={idx} className="rounded border border-charcoal/20 p-4">
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="font-medium text-charcoal/60">Post {idx + 1}</span>
                <button type="button" onClick={() => removePost(idx)} className="text-red-500 hover:text-red-700">
                  remove
                </button>
              </div>

              {post.imageUrl && (
                <img src={post.imageUrl} alt="Preview" className="mb-3 h-32 w-32 rounded border border-charcoal/15 object-cover" />
              )}

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadImage(file, (url) => updatePost(idx, "imageUrl", url));
                  e.target.value = "";
                }}
                className="mb-3 block w-full rounded border border-charcoal/25 px-3 py-2 text-sm"
              />

              <label className="mb-1 block text-xs text-charcoal/60">Post link</label>
              <input
                value={post.postUrl}
                onChange={(e) => updatePost(idx, "postUrl", e.target.value)}
                placeholder="https://www.instagram.com/p/XXXX/"
                className={`${input} mb-3`}
              />

              <label className="mb-1 block text-xs text-charcoal/60">Description (accessibility)</label>
              <input
                value={post.alt ?? ""}
                onChange={(e) => updatePost(idx, "alt", e.target.value)}
                placeholder="Customer in black hoodie"
                className={input}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h1 className={heading}>Categories</h1>
        <p className="mb-3 text-sm text-gray-500">View and manage all product categories available in the store.</p>
        <CategoryTable
          categories={categories}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </section>

      {/* Policy */}
      <section>
        <h1 className={heading}>Policy</h1>
        <p className="mb-3 mt-2 text-xs text-charcoal/50">
          Supports Markdown: use <code># Heading</code>, <code>## Subheading</code>, blank lines for
          paragraphs, and lines starting with <code>-</code> for bullet lists. Shown at /policy.
        </p>
        <textarea
          value={values.policy}
          onChange={(e) => setValues((v) => ({ ...v, policy: e.target.value }))}
          rows={16}
          placeholder={"## Shipping & Delivery\n\n- Free delivery on orders of ₹999 or more\n\n## Returns & Refunds\n\n..."}
          className="w-full rounded border border-charcoal/25 px-3 py-2 font-mono text-sm"
        />
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