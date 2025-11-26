import React, { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";

export default function BlogListPage() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showCreate, setShowCreate] = useState(false);
  const [newBlog, setNewBlog] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = () => {
    API.get("/blogs")
      .then(res => setBlogs(res.data))
      .catch(() => setBlogs([]));
  };

  // Extract unique authors for filter dropdown
  const authorOptions = [
    ...new Set(blogs.map(b => b.user?.email || "Anonymous"))
  ];

  // Filtered and Sorted blogs pipeline
  const filteredBlogs = blogs
    .filter(b =>
      (authorFilter === "all" || (b.user?.email || "Anonymous") === authorFilter) &&
      (b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.description.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      if (sortOrder === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.post("/blogs", newBlog);
      setShowCreate(false);
      setNewBlog({ title: "", description: "" });
      fetchBlogs();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        JSON.stringify(err.response?.data) ||
        err.message ||
        "Blog creation failed."
      );
      console.error("Blog create error:", err.response?.data, err);
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      await API.delete(`/blogs/${blogId}`);
      fetchBlogs();
    } catch {
      alert("Failed to delete blog.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to BlogVerse</h1>
          <p className="text-lg opacity-90 mb-8">
            Discover, create, and share amazing stories from people around the world.
          </p>
          {user && (
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-md shadow hover:bg-gray-200 transition"
            >
              + Create New Blog
            </button>
          )}
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Search blogs..."
            className="flex-1 border-none focus:ring-0 text-gray-700"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="text-gray-400 text-sm">🔍</span>
          <select
            value={authorFilter}
            onChange={e => setAuthorFilter(e.target.value)}
            className="border rounded px-2 py-1 text-gray-700"
          >
            <option value="all">All Authors</option>
            {authorOptions.map(email => (
              <option key={email} value={email}>{email}</option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="border rounded px-2 py-1 text-gray-700"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map(blog => (
            <div
              key={blog.id}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-48 bg-gradient-to-r from-blue-200 to-purple-200 flex items-center justify-center text-gray-500 text-4xl font-bold">
                {blog.title.charAt(0).toUpperCase()}
              </div>
              <div className="p-5 flex flex-col h-full">
                <Link
                  to={`/blogs/${blog.id}`}
                  className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition"
                >
                  {blog.title}
                </Link>
                <p className="text-gray-600 text-sm mt-2 flex-grow">
                  {blog.description.length > 100
                    ? blog.description.substring(0, 100) + "..."
                    : blog.description}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-500">
                    by {blog.user?.email || "Anonymous"} | {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ""}
                  </span>
                  {user && blog.user?.id === Number(user.userId) && (
                    <button
                      className="text-red-600 text-sm hover:text-red-800"
                      onClick={() => handleDelete(blog.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-12">
            No blogs found. {user ? "Create one to get started!" : ""}
          </div>
        )}
      </div>

      {/* Create Blog Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
          <form
            onSubmit={handleCreate}
            className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg space-y-4"
          >
            <h3 className="text-2xl font-bold text-gray-800">Create New Blog</h3>
            <input
              name="title"
              placeholder="Title"
              className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-400"
              value={newBlog.title}
              onChange={e => setNewBlog({ ...newBlog, title: e.target.value })}
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-400"
              rows="5"
              value={newBlog.description}
              onChange={e => setNewBlog({ ...newBlog, description: e.target.value })}
              required
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create
              </button>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </form>
        </div>
      )}
    </div>
    
  );
}
