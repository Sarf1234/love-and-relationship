// "use client";
// export const dynamic = "force-dynamic";
// export const ssr = false;
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { apiRequest } from "@/lib/api";
// import { toast } from "sonner";


// export default function PostsList() {
//   const [posts, setPosts] = useState([]);

//   useEffect(() => {
//     let mounted = true;
//     async function load() {
//       try {
//         const res = await apiRequest("/api/posts?page=1&limit=50");
//         const data = res.data || res.posts || res;
//         if (!mounted) return;
//         setPosts(data);
//       } catch (err) {
//         toast.error("Failed to load posts");
//       }
//     }
//     load();
//     return () => (mounted = false);
//   }, []);

//   async function handleDelete(id) {
//     if (!confirm("Delete this post?")) return;
//     try {
//       await apiRequest(`/api/posts/${id}`, "DELETE");
//       setPosts((p) => p.filter(x => x._id !== id));
//       toast.success("Deleted");
//     } catch (err) {
//       toast.error(err.message || "Delete failed");
//     }
//   }

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <div className="flex items-center justify-between mb-4">
//         <h1 className="text-2xl font-semibold text-rose-600">Posts</h1>
//         <Link href="/admin/posts/create">
//           <Button>Create Post</Button>
//         </Link>
//       </div>

//       <div className="space-y-3">
//         {posts.length === 0 && <div className="text-gray-500">No posts yet</div>}

//         {posts.map(post => (
//           <div key={post._id} className="flex items-center justify-between p-3 border rounded">
//             <div>
//               <div className="font-medium">{post.title}</div>
//               <div className="text-sm text-gray-500">{post.excerpt || post.metaDescription || ""}</div>
//             </div>

//             <div className="flex gap-2">
//               <Link href={`/admin/posts/${post._id}/edit`}>
//                 <Button variant="outline">Edit</Button>
//               </Link>

//               <Button variant="destructive" onClick={() => handleDelete(post._id)}>Delete</Button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


import React from 'react'

const page = () => {
  return (
    <div>
      new pages
    </div>
  )
}

export default page
