"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import { createSlug } from "@/utils/createSlug";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

/*
  Improved PostForm UI:
  - responsive two-column layout on desktop
  - cover image preview + upload
  - searchable chip multi-select for categories & tags
  - meta sidebar for SEO fields
  - clear validation & helper texts
*/

function Chip({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-sm border border-rose-100">
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 text-rose-600 text-xs"
          aria-label={`Remove ${children}`}
        >
          ×
        </button>
      )}
    </span>
  );
}

function MultiSelect({ label, options = [], value = [], onChange, placeholder = "Select..." }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const filtered = options.filter((o) =>
    (o.name || o).toString().toLowerCase().includes(q.toLowerCase())
  );

  function toggle(id) {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  }

  return (
    <div className="relative" ref={ref}>
      <Label className="block text-sm font-medium text-rose-700 mb-1">{label}</Label>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full min-h-[44px] text-left px-3 py-2 bg-white border border-rose-100 rounded-md flex items-center gap-2 flex-wrap"
        aria-expanded={open}
      >
        {value.length === 0 ? (
          <span className="text-sm text-gray-400">{placeholder}</span>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {value.map((id) => {
              const opt = options.find((o) => o._id === id || o.slug === id || o.name === id);
              return <Chip key={id}>{opt ? opt.name : id}</Chip>;
            })}
          </div>
        )}
        <span className="ml-auto text-xs text-rose-500">{value.length}</span>
      </button>

      {open && (
        <div className="absolute z-40 left-0 right-0 mt-2 bg-white border border-rose-100 rounded-md shadow-md max-h-56 overflow-auto p-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            className="w-full px-3 py-2 mb-2 border rounded text-sm"
          />
          <div className="space-y-1">
            {filtered.map((opt) => {
              const id = opt._id || opt.slug || opt.name;
              const checked = value.includes(id);
              return (
                <label key={id} className="flex items-center gap-2 px-2 py-2 rounded hover:bg-rose-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(id)}
                    className="w-4 h-4 accent-rose-600"
                  />
                  <div className="text-sm">
                    <div className="font-medium text-rose-700">{opt.name}</div>
                    {opt.slug && <div className="text-xs text-gray-400">{opt.slug}</div>}
                  </div>
                </label>
              );
            })}
            {filtered.length === 0 && <div className="text-sm text-gray-400 px-2 py-2">No results</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PostForm({ initialData = {}, onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initialData.title || "");
  const [slug, setSlug] = useState(initialData.slug || "");
  const [excerpt, setExcerpt] = useState(initialData.excerpt || "");
  const [content, setContent] = useState(initialData.content || "");
  const [coverImage, setCoverImage] = useState(initialData.coverImage || "");
  const [categories, setCategories] = useState((initialData.categories || []).map(c => c._id || c));
  const [tags, setTags] = useState((initialData.tags || []).map(t => t._id || t));
  const [isFeatured, setIsFeatured] = useState(!!initialData.isFeatured);
  const [isTrending, setIsTrending] = useState(!!initialData.isTrending);
  const [published, setPublished] = useState(initialData.published ?? true);
  const [metaTitle, setMetaTitle] = useState(initialData.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialData.metaDescription || "");
  const [metaKeywords, setMetaKeywords] = useState((initialData.metaKeywords || []).join(", "));
  const [allCategories, setAllCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const editorRef = useRef(null);

  const joditConfig = {
    readonly: false,
    height: 360,
    toolbarAdaptive: false,
    enableDragAndDropFileToEditor: true,
    uploader: { insertImageAsBase64URI: false },
    buttons: [
      "bold","italic","underline","strikethrough","eraser",
      "ul","ol","outdent","indent",
      "align","font","fontsize","brush",
      "paragraph","image","link","source"
    ],
      allowClasses: true,             // ✅ Allow class attributes
      allowedAttributes: ["class"], 
  };

  useEffect(() => {
    let mounted = true;
    async function loadLists() {
      try {
        const cats = await apiRequest("/api/categories");
        const tgs = await apiRequest("/api/tags");
        if (!mounted) return;
        setAllCategories(cats.data || cats || []);
        setAllTags(tgs.data || tgs || []);
      } catch (err) {
        toast.error("Failed to load categories/tags");
      }
    }
    loadLists();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    if (!initialData.slug) setSlug(createSlug(title));
  }, [title]);

  async function handleUploadImage(file) {
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await apiRequest("/api/upload", "POST", fd);
      // normalize
      return res.data?.url || res.url || res.secure_url || res.data || res.url;
    } catch (err) {
      toast.error("Image upload failed");
      throw err;
    }
  }

  async function handleCoverFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Only images allowed");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image > 5MB not allowed");
    try {
      const url = await handleUploadImage(file);
      setCoverImage(url);
      toast.success("Cover uploaded");
    } catch {
      // handled
    }
  }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    if (!title.trim()) return toast.error("Title is required");
    if (!content || content.trim().length < 20) return toast.error("Content is too short");
    if (!categories.length) return toast.error("Choose at least one category");

    const payload = {
      title: title.trim(),
      slug: slug || createSlug(title),
      content,
      excerpt: excerpt || content.replace(/<[^>]+>/g, "").slice(0, 160),
      coverImage,
      categories,
      tags,
      isFeatured,
      isTrending,
      published,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt || content.replace(/<[^>]+>/g, "").slice(0, 160),
      metaKeywords: metaKeywords ? metaKeywords.split(",").map(k => k.trim()).filter(Boolean) : [],
    };

    try {
      setLoading(true);
      await onSubmit(payload);
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setLoading(false);
    }
  }

  // layout: responsive two-column (content left, meta right on desktop)
  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <Label className="text-sm font-medium text-rose-700">Title</Label>
            <Input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Write an attention grabbing title..."
              className="mt-2"
            />
            <div className="text-xs text-gray-400 mt-1">SEO-friendly titles perform better</div>
          </div>

          <div>
            <Label className="text-sm font-medium text-rose-700">Slug (editable)</Label>
            <Input
              name="slug"
              value={slug}
              onChange={(e) => setSlug(createSlug(e.target.value))}
              className="mt-2"
            />
            <div className="text-xs text-gray-400 mt-1">URL friendly - letters, numbers and hyphens only</div>
          </div>

          <div>
            <Label className="text-sm font-medium text-rose-700">Cover Image</Label>
            <div className="mt-2 flex items-center gap-3">
              {coverImage ? (
                <>
                  <img src={coverImage} alt="cover" className="w-36 h-24 object-cover rounded-md border" />
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" onClick={() => setCoverImage("")}>Remove</Button>
                    <label className="text-sm text-gray-500">
                      <input type="file" accept="image/*" onChange={handleCoverFile} className="sr-only" />
                      <span className="text-rose-600 underline cursor-pointer">Replace cover</span>
                    </label>
                  </div>
                </>
              ) : (
                <label className="w-full flex items-center justify-center border border-dashed border-rose-200 rounded-md p-6 bg-rose-50 text-center cursor-pointer">
                  <div>
                    <div className="text-rose-600 font-medium">Upload cover image</div>
                    <div className="text-xs text-gray-500 mt-1">PNG/JPG, max 5MB</div>
                    <input type="file" accept="image/*" onChange={handleCoverFile} className="sr-only" />
                  </div>
                </label>
              )}
            </div>
          </div>

          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MultiSelect label="Categories" options={allCategories} value={categories} onChange={setCategories} placeholder="Choose categories" />
              <MultiSelect label="Tags" options={allTags} value={tags} onChange={setTags} placeholder="Choose tags" />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-rose-700">Content</Label>
            <div className="mt-2 border rounded-md">
              {typeof window !== "undefined" ? (
                <JoditEditor
                  ref={editorRef}
                  value={content}
                  config={joditConfig}
                  onBlur={(newContent) => setContent(newContent)}
                />
              ) : (
                <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} />
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1">Tip: write clear headings and short paragraphs for readability.</div>
          </div>

          <div>
            <Label className="text-sm font-medium text-rose-700">Excerpt</Label>
            <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className="mt-2" />
            <div className="text-xs text-gray-400 mt-1">Short summary used for meta description and cards (max ~160 chars)</div>
            <div className="text-xs text-gray-400 mt-1">Characters: { (excerpt || "").length }</div>
          </div>
        </div>

        {/* Meta column */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-rose-50 rounded-md p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium text-rose-700">Visibility</div>
                <div className="text-xs text-gray-500">Publish or keep as draft</div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-700">Published</div>
                  <div className="text-xs text-gray-400">Visible to everyone</div>
                </div>
                <input type="checkbox" checked={published} onChange={(e)=>setPublished(e.target.checked)} className="w-5 h-5 accent-rose-600" />
              </label>

              <label className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-700">Featured</div>
                  <div className="text-xs text-gray-400">Show in homepage slider</div>
                </div>
                <input type="checkbox" checked={isFeatured} onChange={(e)=>setIsFeatured(e.target.checked)} className="w-5 h-5 accent-rose-600" />
              </label>

              <label className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-700">Trending</div>
                  <div className="text-xs text-gray-400">Highlight in trending section</div>
                </div>
                <input type="checkbox" checked={isTrending} onChange={(e)=>setIsTrending(e.target.checked)} className="w-5 h-5 accent-rose-600" />
              </label>
            </div>
          </div>

          <div className="bg-white border border-rose-50 rounded-md p-4 shadow-sm">
            <div className="text-sm font-medium text-rose-700 mb-2">SEO</div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm">Meta Title</Label>
                <Input value={metaTitle} onChange={(e)=>setMetaTitle(e.target.value)} className="mt-2" />
              </div>

              <div>
                <Label className="text-sm">Meta Description</Label>
                <Textarea value={metaDescription} onChange={(e)=>setMetaDescription(e.target.value)} rows={3} className="mt-2" />
                <div className="text-xs text-gray-400 mt-1">Best: 120–160 characters. Current: { (metaDescription || "").length }</div>
              </div>

              <div>
                <Label className="text-sm">Meta Keywords</Label>
                <Input value={metaKeywords} onChange={(e)=>setMetaKeywords(e.target.value)} placeholder="comma separated" className="mt-2" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700" disabled={loading}>
              {loading ? "Saving..." : "Save Post"}
            </Button>
          </div>
        </aside>
      </div>
    </form>
  );
}
