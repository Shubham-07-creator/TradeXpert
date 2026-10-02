import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getStoredUser } from "../utils/storage";

const AuthContext = createContext();

// Synchronously check and strip ?logout=true on load
const checkAndClearIfLogoutRequested = () => {
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("logout") === "true" || params.has("logout")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Clean query parameter from URL without a jarring reload
      params.delete("logout");
      const cleanSearch = params.toString() ? `?${params.toString()}` : "";
      const cleanUrl = window.location.pathname + cleanSearch + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl || "/");
      return true;
    }
  } catch (e) {
    console.error("Logout param check error:", e);
  }
  return false;
};

export const AuthProvider = ({ children }) => {
  // Check synchronously before state initialization
  const isLoggingOut = checkAndClearIfLogoutRequested();

  const [user, setUser] = useState(() => (isLoggingOut ? null : getStoredUser()));
  const [token, setToken] = useState(() => (isLoggingOut ? null : localStorage.getItem("token")));

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    window.dispatchEvent(new Event("userChanged"));
  }, []);

  useEffect(() => {
    if (isLoggingOut) {
      window.dispatchEvent(new Event("userChanged"));
    }

    const handleStorageChange = () => {
      setUser(getStoredUser());
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userChanged", handleStorageChange);
    };
  }, [isLoggingOut]);

  const login = (newToken, newUser) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    window.dispatchEvent(new Event("userChanged"));
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    window.dispatchEvent(new Event("userChanged"));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!token && !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
