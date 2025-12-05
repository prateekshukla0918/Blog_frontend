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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [newBlog, setNewBlog] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);

  const fetchBlogs = () => {
    API.get("/blogs", {
      params: {
        search,
        author: authorFilter,
        sort: sortOrder,
        page,
        limit: 6,
      },
    })
      .then((res) => {
        setBlogs(res.data.blogs || []);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch((err) => {
        console.error("fetchBlogs error:", err);
        setBlogs([]);
        setTotalPages(1);
      });
  };

  // Fetch when filters / sort / page change
  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, authorFilter, sortOrder, page]);

  // Reset to page 1 when search/filter/sort changes
  useEffect(() => {
    setPage(1);
  }, [search, authorFilter, sortOrder]);

  // Author options from the blogs in the current page
  const authorOptions = [
    ...new Set(blogs.map((b) => b.user?.email || "Anonymous")),
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await API.post("/blogs", newBlog);
      setShowCreate(false);
      setNewBlog({ title: "", description: "" });
      setPage(1); // go back to first page to see new blog
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
      // after delete, refetch. Optionally adjust page if needed
      fetchBlogs();
    } catch (err) {
      console.error("Delete blog error:", err);
      alert("Failed to delete blog.");
    }
  };

  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to BlogVerse
          </h1>
          <p className="text-lg opacity-90 mb-8">
            Discover, create, and share amazing stories from people around the
            world.
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

      {/* Controls Bar */}
      <div className="sticky top-0 z-30 flex justify-center px-4 py-0 bg-transparent">
        <div className="flex flex-wrap justify-between items-center gap-4 rounded-xl shadow-xl bg-white w-full max-w-4xl px-6 py-5 -mt-10">
          {/* Search bar */}
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <input
              type="text"
              placeholder="Search blogs…"
              className="w-full border-2 border-blue-100 rounded-lg px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-300 transition duration-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="inline-block text-lg text-blue-400 ml-2">🔍</span>
          </div>

          {/* Author filter */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-600">Author:</span>
            <select
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="border-2 border-purple-200 rounded-lg px-3 py-2 bg-purple-50 text-purple-700 focus:ring-2 focus:ring-purple-300 transition"
            >
              <option value="all">All</option>
              {authorOptions.map((email) => (
                <option key={email} value={email}>
                  {email === "Anonymous" ? "Anonymous" : email}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-600">Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border-2 border-blue-200 rounded-lg px-3 py-2 bg-blue-50 text-blue-700 focus:ring-2 focus:ring-blue-300 transition"
            >
              <option value="newest">Newest First </option>
              <option value="oldest">Oldest First </option>
            </select>
          </div>
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.length > 0 ? (
          blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border-t-4 border-blue-400"
            >
              <div className="h-48 bg-gradient-to-r from-blue-200 to-purple-200 flex items-center justify-center text-gray-500 text-4xl font-extrabold tracking-wide">
                {blog.title.charAt(0).toUpperCase()}
              </div>
              <div className="p-5 flex flex-col h-full">
                <Link
                  to={`/blogs/${blog.id}`}
                  className="text-2xl font-bold text-gray-800 hover:text-blue-600 transition"
                >
                  {blog.title}
                </Link>
                <p className="text-gray-600 text-base mt-2 flex-grow">
                  {blog.description.length > 100
                    ? blog.description.substring(0, 100) + "..."
                    : blog.description}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-500">
                    by{" "}
                    <span className="font-semibold">
                      {blog.user?.email || "Anonymous"}
                    </span>
                    {blog.createdAt && (
                      <>
                        {" "}
                        |{" "}
                        <span className="italic">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </span>
                  {user && blog.user?.id === Number(user.userId) && (
                    <button
                      className="text-red-600 text-sm bg-red-100 px-2 py-1 rounded hover:bg-red-200 hover:text-red-800 transition"
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

      {/* Pagination controls */}
      <div className="max-w-6xl mx-auto px-4 pb-12 flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={page <= 1}
          className={`px-4 py-2 rounded-md border ${
            page <= 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-gray-100 text-gray-700"
          }`}
        >
          ← Previous
        </button>
        <span className="text-sm text-gray-600">
          Page <span className="font-semibold">{page}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </span>
        <button
          onClick={handleNext}
          disabled={page >= totalPages}
          className={`px-4 py-2 rounded-md border ${
            page >= totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-gray-100 text-gray-700"
          }`}
        >
          Next →
        </button>
      </div>

      {/* Create Blog Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
          <form
            onSubmit={handleCreate}
            className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg space-y-4"
          >
            <h3 className="text-2xl font-bold text-gray-800">
              Create New Blog
            </h3>
            <input
              name="title"
              placeholder="Title"
              className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-400"
              value={newBlog.title}
              onChange={(e) =>
                setNewBlog({ ...newBlog, title: e.target.value })
              }
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              className="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-blue-400"
              rows="5"
              value={newBlog.description}
              onChange={(e) =>
                setNewBlog({ ...newBlog, description: e.target.value })
              }
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
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
