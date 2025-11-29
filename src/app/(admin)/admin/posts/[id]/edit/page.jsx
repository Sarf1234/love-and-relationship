"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PostForm from "@/components/ui/admin/PostForm";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);

  console.clear()
  console.log(id)

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await apiRequest(`/api/posts/${id}`, "GET");
        // your GET returns { success, data }
        const data = res.data || res.post || res;
        if (!mounted) return;
        setPost(data);
      } catch (err) {
        toast.error("Failed to load post");
      }
    }
    if (id) load();
    return () => (mounted = false);
  }, [id]);

  async function handleUpdate(payload) {
    try {
      await apiRequest(`/api/posts/${id}`, "PUT", payload);
      toast.success("Post updated");
      router.push("/admin/posts");
    } catch (err) {
      toast.error(err.message || "Update failed");
    }
  }

  if (!post) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold text-rose-600 mb-4">Edit Post</h2>
      <PostForm initialData={post} onSubmit={handleUpdate} />
    </div>
  );
}
