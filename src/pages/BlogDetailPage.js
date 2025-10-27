import React, { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";

export default function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    API.get(`/blogs/${id}`)
      .then(res => setBlog(res.data))
      .catch(() => setBlog(null));

    if (user) {
      API.get("/bookmarks")
        .then(res => {
          const bm = res.data.find(b => b.blogId === Number(id));
          if (bm) {
            setIsBookmarked(true);
            setBookmarkId(bm.id);
          } else {
            setIsBookmarked(false);
            setBookmarkId(null);
          }
        })
        .catch(() => {
          setIsBookmarked(false);
          setBookmarkId(null);
        });
    }
  }, [id, user]);

  const handleComment = async (e) => {
  e.preventDefault();
  setMessage("");
  try {
    await API.post("/comments", { blogId: blog.id, content: comment });
    setComment("");
    setMessage("Comment posted!");
    setTimeout(() => setMessage(""), 3000);
    const res = await API.get(`/blogs/${id}`);
    setBlog(res.data);
  } catch {
    setMessage("Failed to comment");
    setTimeout(() => setMessage(""), 3000);
  }
};

const handleLike = async () => {
  setMessage("");
  try {
    const alreadyLiked = blog.likes?.some(like => like.userId === Number(user?.userId));

    if (alreadyLiked) {
      // If user already liked → unlike
      await API.delete(`/likes/${blog.id}`);
      setMessage("Like removed!");
    } else {
      // Otherwise → like
      await API.post("/likes", { blogId: blog.id });
      setMessage("Liked!");
    }

    setTimeout(() => setMessage(""), 3000);

    // Refresh blog data
    const res = await API.get(`/blogs/${id}`);
    setBlog(res.data);
  } catch {
    setMessage("Action failed");
    setTimeout(() => setMessage(""), 3000);
  }
};


const handleToggleBookmark = async () => {
  if (!user) return;
  setMessage("");
  try {
    if (isBookmarked && bookmarkId) {
      await API.delete(`/bookmarks/${bookmarkId}`);
      setIsBookmarked(false);
      setBookmarkId(null);
      setMessage("Bookmark removed!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      const res = await API.post("/bookmarks", { blogId: blog.id });
      setIsBookmarked(true);
      setBookmarkId(res.data.id);
      setMessage("Bookmarked!");
      setTimeout(() => setMessage(""), 3000);
    }
  } catch {
    setMessage("Bookmark action failed");
    setTimeout(() => setMessage(""), 3000);
  }
};

const handleUpdate = async (e) => {
  e.preventDefault();
  setMessage("");
  try {
    await API.put(`/blogs/${blog.id}`, editForm);
    const res = await API.get(`/blogs/${id}`);
    setBlog(res.data);
    setIsEditing(false);
    setMessage("Blog updated!");
    setTimeout(() => setMessage(""), 3000);
  } catch {
    setMessage("Failed to update blog.");
    setTimeout(() => setMessage(""), 3000);
  }
};


  const isOwner = () => {
    if (!user || !blog) return false;
    const uid = String(user.userId || user.id || user?.user?.id || "");
    const ownerId = String(blog.user?.id ?? blog.userId ?? "");
    return Number(uid) === Number(ownerId);
  };

  const handleDeleteBlog = async () => {
    if (!isOwner()) return;
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await API.delete(`/blogs/${blog.id}`);
      navigate("/");
    } catch {
      setMessage("Failed to delete blog.");
    }
  };

  const handleStartEdit = () => {
    setEditForm({ title: blog.title || "", description: blog.description || "" });
    setIsEditing(true);
  };

  if (!blog)
    return (
      <div>
        <Navbar />
        <div className="max-w-3xl mx-auto py-12 text-center text-red-600 font-semibold">
          Blog not found.
        </div>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">{blog.title}</h1>
        <p className="text-lg opacity-90 mb-3">{blog.user?.email || "Anonymous Author"}</p>
        <div className="flex justify-center gap-3 flex-wrap">
          <button
            className="px-4 py-2 bg-white text-blue-600 rounded-md shadow hover:bg-gray-100 transition"
            onClick={handleLike}
          >
            ❤️ Like ({blog.likes?.length || 0})
          </button>

          {user && (
            <button
              onClick={handleToggleBookmark}
              className={`px-4 py-2 rounded-md shadow transition ${
                isBookmarked
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-white text-blue-600 hover:bg-gray-100"
              }`}
            >
              {isBookmarked ? "Remove Bookmark" : "📑 Bookmark"}
            </button>
          )}

          {user && isOwner() && (
            <>
              <button
                onClick={handleStartEdit}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
              >
                ✏️ Edit
              </button>
              <button
                onClick={handleDeleteBlog}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                🗑 Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Blog Content */}
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-[-40px] relative z-10">
        {message && (
          <div className="text-green-600 text-sm mb-4 text-center font-medium">
            {message}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-3">
            <input
              value={editForm.title}
              onChange={e => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-400"
              required
            />
            <textarea
              value={editForm.description}
              onChange={e => setEditForm({ ...editForm, description: e.target.value })}
              rows="6"
              className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-400"
              required
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="text-gray-700 leading-relaxed mb-8 whitespace-pre-line">
              {blog.description}
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              💬 Comments ({blog.comments?.length || 0})
            </h3>

            <div className="space-y-3">
              {blog.comments?.length ? (
                blog.comments.map(c => (
                  <div
                    key={c.id}
                    className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm"
                  >
                    <p className="text-gray-800">{c.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-sm italic">No comments yet.</div>
              )}
            </div>

            {user && (
              <form onSubmit={handleComment} className="mt-6 flex gap-2">
                <input
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Write your comment..."
                  required
                  className="flex-1 border px-4 py-2 rounded focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-5 rounded-md hover:bg-blue-700 transition"
                >
                  Post
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
