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

  const login = ({ token, userId }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    setUser({ token, userId });
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
