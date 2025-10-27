import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check localStorage for login user
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token && userId) setUser({ token, userId });
  }, []);

  const login = (data) => {
    // Accept various shapes returned by the API (e.g. { token, userId } or { token, id })
    const token = data?.token || data?.accessToken || data?.access_token || null;
    const userId = data?.userId || data?.id || data?.user?.id || null;
    if (!token || !userId) return;
    localStorage.setItem("token", token);
    localStorage.setItem("userId", String(userId));
    setUser({ token, userId: String(userId) });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}