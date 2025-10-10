import React, { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";

export default function BlogListPage() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newBlog, setNewBlog] = useState({ title: "", description: "" });
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = () => {
    API.get("/blogs")
      .then(res => setBlogs(res.data))
      .catch(() => setBlogs([]));
  };

  // Filter blogs by search
  const filteredBlogs = blogs.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.description.toLowerCase().includes(search.toLowerCase())
  );

  // Handle create blog
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

  // Handle delete blog
  const handleDelete = async (blogId) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      await API.delete(`/blogs/${blogId}`);
      fetchBlogs();
    } catch (err) {
      alert("Failed to delete blog.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Blogs</h2>
          {user && (
            <button
              onClick={() => setShowCreate(true)}
              className="bg-blue-600 text-white px-4 py-1 rounded shadow hover:bg-blue-700"
            >
              + Create
            </button>
          )}
        </div>
        <input
          type="text"
          placeholder="Search blogs..."
          className="border px-3 py-2 rounded w-full mb-4"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <ul className="space-y-3">
          {filteredBlogs.map(blog =>
            <li key={blog.id} className="bg-white rounded-lg p-4 shadow flex flex-col">
              <div className="flex justify-between items-center">
                <Link to={`/blogs/${blog.id}`} className="text-lg font-semibold text-gray-700 hover:text-blue-600">{blog.title}</Link>
                {user && blog.user?.id === Number(user.userId) && (
                  <button
                    className="px-2 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700"
                    onClick={() => handleDelete(blog.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
              <span className="text-xs text-gray-500">by {blog.user?.email}</span>
              <p className="text-sm text-gray-600 mt-1">{blog.description}</p>
            </li>
          )}
        </ul>
        {/* Blog Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <form
              onSubmit={handleCreate}
              className="bg-white p-6 rounded-lg shadow w-full max-w-md space-y-4"
            >
              <h3 className="text-xl font-bold">Create Blog</h3>
              <input
                name="title"
                placeholder="Title"
                className="w-full border px-3 py-2 rounded"
                value={newBlog.title}
                onChange={e => setNewBlog({ ...newBlog, title: e.target.value })}
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                className="w-full border px-3 py-2 rounded"
                value={newBlog.description}
                onChange={e => setNewBlog({ ...newBlog, description: e.target.value })}
                required
              />
              <div className="flex gap-2">
                <button type="button" onClick={()=>setShowCreate(false)} className="px-3 py-1 rounded bg-gray-100">Cancel</button>
                <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Create</button>
              </div>
              {error && <div className="text-red-500">{error}</div>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
