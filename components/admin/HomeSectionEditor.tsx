"use client";

import { Plus, Trash2 } from "lucide-react";
import { WHY_ICONS, type HomeConfig } from "@/app/lib/homeDefaults";

interface Props {
  home: HomeConfig;
  onChange: (home: HomeConfig) => void;
  onError: (msg: string) => void;
}

const input = "h-9 w-full rounded border border-charcoal/25 px-3 text-sm";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-charcoal/70">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export default function HomeSectionsEditor({ home, onChange, onError }: Props) {
  const patch = <K extends keyof HomeConfig>(key: K, partial: Partial<HomeConfig[K]>) =>
    onChange({ ...home, [key]: { ...home[key], ...partial } });

  const upload = async (file: File, done: (url: string) => void) => {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return onError("Only PNG, JPG or WebP images are allowed.");
    if (file.size > 5 * 1024 * 1024) return onError("Image must be smaller than 5 MB.");
    onError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) return onError(data.message ?? "Image upload failed.");
      done(data.url);
    } catch {
      onError("Image upload failed.");
    }
  };

  const cats = home.categories.items;
  const tabs = home.products.tabs;
  const why = home.why.items;

  const moveTab = (from: number, to: number) => {
    if (to < 0 || to >= tabs.length) return;
    const next = [...tabs];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    patch("products", { tabs: next });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Categories */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium text-charcoal">Shop by Category ({cats.length}/6)</h2>
          <Toggle checked={home.categories.enabled} onChange={(v) => patch("categories", { enabled: v })} label="Show section" />
        </div>
        <p className="mb-3 text-xs text-charcoal/50">
          Leave empty to use the automatic category grid. Add tiles here to control the image, name and link yourself.
        </p>
        <input
          value={home.categories.title}
          onChange={(e) => patch("categories", { title: e.target.value })}
          placeholder="Section title"
          className={`${input} mb-3 max-w-xs`}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cats.map((c, idx) => (
            <div key={idx} className="rounded border border-charcoal/20 p-4">
              <div className="mb-2 flex justify-between text-xs">
                <span className="font-medium text-charcoal/60">Tile {idx + 1}</span>
                <button type="button" className="text-red-500" onClick={() => patch("categories", { items: cats.filter((_, i) => i !== idx) })}>
                  remove
                </button>
              </div>
              {c.image && <img src={c.image} alt="" className="mb-2 h-28 w-20 rounded border border-charcoal/15 object-cover" />}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="mb-2 block w-full text-sm"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f, (url) => patch("categories", { items: cats.map((x, i) => (i === idx ? { ...x, image: url } : x)) }));
                  e.target.value = "";
                }}
              />
              <input
                value={c.name}
                placeholder="Name (e.g. Hoodies)"
                className={`${input} mb-2`}
                onChange={(e) => patch("categories", { items: cats.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)) })}
              />
              <input
                value={c.href}
                placeholder="/shop?category=hoodies"
                className={input}
                onChange={(e) => patch("categories", { items: cats.map((x, i) => (i === idx ? { ...x, href: e.target.value } : x)) })}
              />
            </div>
          ))}
        </div>
        {cats.length < 6 && (
          <button
            type="button"
            className="mt-3 flex items-center gap-1 text-xs text-charcoal/60 hover:text-charcoal"
            onClick={() => patch("categories", { items: [...cats, { name: "", image: "", href: "/shop" }] })}
          >
            <Plus size={14} /> add tile
          </button>
        )}
      </section>

      {/* Product tabs */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium text-charcoal">Product Tabs</h2>
          <Toggle checked={home.products.enabled} onChange={(v) => patch("products", { enabled: v })} label="Show section" />
        </div>
        <div className="flex flex-col gap-2">
          {tabs.map((t, idx) => (
            <div key={t.id} className="flex flex-wrap items-center gap-3 rounded border border-charcoal/20 p-3">
              <input
                value={t.label}
                className={`${input} max-w-[200px]`}
                onChange={(e) => patch("products", { tabs: tabs.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)) })}
              />
              <span className="text-xs text-charcoal/40">
                {t.id === "new" ? "newest products" : t.id === "best" ? "bestsellers" : "most popular"}
              </span>
              <select
                value={t.count}
                className="h-9 rounded border border-charcoal/25 px-2 text-sm"
                onChange={(e) => patch("products", { tabs: tabs.map((x, i) => (i === idx ? { ...x, count: Number(e.target.value) } : x)) })}
              >
                {[4, 6, 8, 10, 12].map((n) => <option key={n} value={n}>{n} items</option>)}
              </select>
              <Toggle checked={t.enabled} onChange={(v) => patch("products", { tabs: tabs.map((x, i) => (i === idx ? { ...x, enabled: v } : x)) })} label="Show" />
              <div className="ml-auto flex gap-3 text-xs text-charcoal/50">
                <button type="button" disabled={idx === 0} onClick={() => moveTab(idx, idx - 1)} className="disabled:opacity-30">↑</button>
                <button type="button" disabled={idx === tabs.length - 1} onClick={() => moveTab(idx, idx + 1)} className="disabled:opacity-30">↓</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why choose us */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium text-charcoal">Why Choose Us ({why.length}/4)</h2>
          <Toggle checked={home.why.enabled} onChange={(v) => patch("why", { enabled: v })} label="Show section" />
        </div>
        <div className="flex flex-col gap-2">
          {why.map((w, idx) => (
            <div key={idx} className="grid grid-cols-1 items-center gap-2 rounded border border-charcoal/20 p-3 sm:grid-cols-[120px_1fr_1.5fr_auto]">
              <select
                value={w.icon}
                className="h-9 rounded border border-charcoal/25 px-2 text-sm"
                onChange={(e) => patch("why", { items: why.map((x, i) => (i === idx ? { ...x, icon: e.target.value } : x)) })}
              >
                {WHY_ICONS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <input value={w.title} placeholder="Title" className={input}
                onChange={(e) => patch("why", { items: why.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)) })} />
              <input value={w.sub} placeholder="Subtext" className={input}
                onChange={(e) => patch("why", { items: why.map((x, i) => (i === idx ? { ...x, sub: e.target.value } : x)) })} />
              <button type="button" className="text-charcoal/40 hover:text-red-600" onClick={() => patch("why", { items: why.filter((_, i) => i !== idx) })}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        {why.length < 4 && (
          <button type="button" className="mt-3 flex items-center gap-1 text-xs text-charcoal/60 hover:text-charcoal"
            onClick={() => patch("why", { items: [...why, { icon: "star", title: "", sub: "" }] })}>
            <Plus size={14} /> add item
          </button>
        )}
      </section>

      {/* Testimonials */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium text-charcoal">Testimonials</h2>
          <Toggle checked={home.testimonials.enabled} onChange={(v) => patch("testimonials", { enabled: v })} label="Show section" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label className="mb-1 block text-xs text-charcoal/60">Title</label>
            <input value={home.testimonials.title} className={`${input} max-w-md`} onChange={(e) => patch("testimonials", { title: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-charcoal/60">Only show reviews rated at least</label>
            <select value={home.testimonials.minRating} className={input} onChange={(e) => patch("testimonials", { minRating: Number(e.target.value) })}>
              {[0, 3, 4, 5].map((n) => <option key={n} value={n}>{n === 0 ? "Any rating" : `${n} stars & up`}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-charcoal/60">Max reviews shown</label>
            <select value={home.testimonials.limit} className={input} onChange={(e) => patch("testimonials", { limit: Number(e.target.value) })}>
              {[3, 4, 6, 9, 12].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section>
        <Toggle checked={home.instagram.enabled} onChange={(v) => patch("instagram", { enabled: v })} label="Show Instagram section (set up below)" />
      </section>
    </div>
  );
}