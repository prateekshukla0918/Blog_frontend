import React, { useEffect, useState, useContext } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function BookmarksPage() {
  const { user } = useContext(AuthContext);
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    if (user) {
      API.get("/bookmarks")
        .then(res => {
          console.log("Bookmarks API response:", res.data);
          if (Array.isArray(res.data.bookmarks)) {
            setBookmarks(res.data.bookmarks.map(bm => bm.blog));
          } else if (Array.isArray(res.data)) {
            setBookmarks(res.data.map(bm => bm.blog || bm));
          } else {
            setBookmarks([]);
          }
        })
        .catch(err => {
          console.error("Error fetching bookmarks:", err);
          setBookmarks([]);
        });
    }
  }, [user]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Your Bookmarked Blogs</h1>
        <p className="text-lg opacity-90">All your saved blogs in one place ✨</p>
      </div>

      {/* Bookmarks Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {bookmarks.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookmarks.map(bm => (
              <div
                key={bm.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-48 bg-gradient-to-r from-blue-200 to-purple-200 flex items-center justify-center text-gray-500 text-4xl font-bold">
                  {bm.title?.charAt(0).toUpperCase() || "B"}
                </div>
                <div className="p-5 flex flex-col h-full">
                  <Link
                    to={`/blogs/${bm.id}`}
                    className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition"
                  >
                    {bm.title}
                  </Link>
                  <p className="text-gray-600 text-sm mt-2 flex-grow">
                    {bm.description?.length > 100
                      ? bm.description.substring(0, 100) + "..."
                      : bm.description || "No description available."}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-500">
                      by {bm.user?.email || "Anonymous"}
                    </span>
                    <Link
                      to={`/blogs/${bm.id}`}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Read →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-lg">You haven’t bookmarked any blogs yet.</p>
            <Link
              to="/"
              className="mt-6 inline-block bg-blue-600 text-white px-5 py-2 rounded-md shadow hover:bg-blue-700 transition"
            >
              Browse Blogs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
