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
        // Adjust this line based on actual response
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
    <div>
      <Navbar />
      <div className="max-w-xl mx-auto py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Bookmarks</h2>
        <ul className="space-y-3">
          {bookmarks.map(bm =>
            <li key={bm.id} className="bg-white p-4 rounded shadow">
              <Link to={`/blogs/${bm.id}`} className="text-blue-600 font-semibold hover:underline">
                {bm.title}
              </Link>
              <span className="text-xs text-gray-500 ml-2">by {bm.user?.email}</span>
            </li>
          )}
        </ul>
        {!bookmarks.length && <div className="text-gray-500 text-center py-4">No bookmarks yet.</div>}
      </div>
    </div>
  );
}