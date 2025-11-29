"use client";
export const dynamic = "force-dynamic";

import PostForm from "@/components/ui/admin/PostForm";
import { apiRequest } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreatePostPage() {
  const router = useRouter();

  async function handleCreate(data) {
    // data is JSON
    try {
      const res = await apiRequest("/api/posts", "POST", data);
      toast.success("Post created");
      router.push("/admin/posts");
    } catch (err) {
      toast.error(err.message || "Create failed");
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold text-rose-600 mb-4">Create Post</h2>
      <PostForm onSubmit={handleCreate} />
    </div>
  );
}
