"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";

export interface AdminCategory {
  _id: string;
  name: string;
  slug: string;
}

interface CategoryTableProps {
  categories: AdminCategory[];
  onCreate: (name: string) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function CategoryTable({ categories, onCreate, onUpdate, onDelete }: CategoryTableProps) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      await onCreate(newName.trim());
      setNewName("");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (cat: AdminCategory) => {
    setEditingId(cat._id);
    setEditName(cat.name);
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setSubmitting(true);
    try {
      await onUpdate(id, editName.trim());
      setEditingId(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-card border border-charcoal/10 bg-white">
      <div className="grid grid-cols-[1fr_1fr_80px] gap-2 border-b border-charcoal/10 px-4 py-1.5 text-lg text-pink">
        <span>Name</span>
        <span>Slug</span>
        <span>Action</span>
      </div>

      {categories.length === 0 && (
        <p className="px-4 py-3 text-sm text-charcoal/55">no categories yet. add one below.</p>
      )}

      {categories.map((cat) => (
        <div
          key={cat._id}
          className="grid grid-cols-[1fr_1fr_80px] items-center gap-2 border-b border-charcoal/10 px-4 py-1.5 text-md text-charcoal last:border-0"
        >
          {editingId === cat._id ? (
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="rounded border border-charcoal/20 px-2 py-1 text-sm"
              autoFocus
            />
          ) : (
            <span className="truncate">{cat.name}</span>
          )}
          <span className="text-charcoal/55">{cat.slug}</span>
          <div className="flex gap-3 text-charcoal/50">
            {editingId === cat._id ? (
              <>
                <button onClick={() => saveEdit(cat._id)} disabled={submitting} aria-label="Save">
                  <Pencil size={13} className="hover:text-brass" />
                </button>
                <button onClick={() => setEditingId(null)} aria-label="Cancel">
                  <X size={13} className="hover:text-red-600" />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => startEdit(cat)} aria-label="Edit category">
                  <Pencil size={13} className="hover:text-brass" />
                </button>
                <button onClick={() => onDelete(cat._id)} aria-label="Delete category">
                  <Trash2 size={13} className="hover:text-red-600" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-2 px-4 py-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="flex-1 rounded border border-charcoal/20 px-2 py-1 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={submitting || !newName.trim()}
          className="flex items-center gap-1 rounded bg-brass px-3 py-1 text-sm text-white disabled:opacity-50"
        >
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  );
}