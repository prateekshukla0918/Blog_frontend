import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm">
      <Link to="/" className="text-xl font-bold text-gray-800">BlogVerse</Link>
      <div className="flex items-center gap-3">
        <Link to="/bookmarks" className="text-sm text-gray-600 hover:text-blue-600">Bookmarks</Link>
        {user ? (
          <>
            <button onClick={onLogout} className="text-sm text-gray-500 hover:text-gray-800">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-800">Login</Link>
            <Link to="/signup" className="text-sm text-gray-500 hover:text-gray-800">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}
