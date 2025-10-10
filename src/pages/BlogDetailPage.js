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
      const res = await API.get(`/blogs/${id}`);
      setBlog(res.data);
    } catch {
      setMessage("Failed to comment");
    }
  };

  const handleLike = async () => {
    setMessage("");
    try {
      await API.post("/likes", { blogId: blog.id });
      setMessage("Liked!");
      const res = await API.get(`/blogs/${id}`);
      setBlog(res.data);
    } catch {
      setMessage("Failed to like");
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
      } else {
        const res = await API.post("/bookmarks", { blogId: blog.id });
        setIsBookmarked(true);
        setBookmarkId(res.data.id);
        setMessage("Bookmarked!");
      }
    } catch {
      setMessage("Bookmark action failed");
    }
  };

  const handleDeleteBlog = async () => {
    if (!user || blog.user?.id !== Number(user.userId)) return;
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await API.delete(`/blogs/${blog.id}`);
      navigate("/");
    } catch {
      setMessage("Failed to delete blog.");
    }
  };

  if (!blog) return (
    <div>
      <Navbar />
      <div className="max-w-xl mx-auto py-8 text-red-600">Blog not found.</div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="max-w-xl mx-auto py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">{blog.title}</h2>
        <p className="text-gray-700 mb-2">{blog.description}</p>
        <p className="text-sm text-gray-500 mb-6">Author: {blog.user?.email}</p>

        <div className="flex gap-4 mb-2">
          <button
            className="px-3 py-1 text-gray-700 rounded hover:bg-blue-50 border transition"
            onClick={handleLike}
          >
            Like ({blog.likes?.length || 0})
          </button>
          {user && (
            <button
              className={`px-3 py-1 rounded border transition ${
                isBookmarked
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              onClick={handleToggleBookmark}
            >
              {isBookmarked ? "Remove Bookmark" : "Bookmark"}
            </button>
          )}
          {user && blog.user?.id === Number(user.userId) && (
            <button
              className="px-3 py-1 rounded border bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteBlog}
            >
              Delete Blog
            </button>
          )}
        </div>

        {message && <div className="text-green-500 mb-4">{message}</div>}

        <h3 className="mt-7 mb-2 text-lg font-semibold text-gray-800">
          Comments ({blog.comments?.length || 0})
        </h3>
        <ul className="space-y-2">
          {blog.comments?.map(c => (
            <li key={c.id} className="bg-gray-50 rounded px-2 py-1 text-sm">
              {c.content}
            </li>
          ))}
        </ul>

        {user && (
          <form onSubmit={handleComment} className="mt-4 flex gap-2">
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write your comment..."
              required
              className="flex-1 border px-3 py-2 rounded"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 transition"
            >
              Post
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
