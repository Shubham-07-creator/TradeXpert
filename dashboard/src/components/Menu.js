import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { isAdmin, getCurrentUser } from "../utils/auth";
import toast from "react-hot-toast";

const Menu = () => {
  const location = useLocation();
  const user = getCurrentUser();

  const FRONTEND =
    process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";

  // Dark / Light Mode Sync
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    toast.success(`Switched to ${nextTheme === "dark" ? "Dark" : "Light"} Mode`, {
      icon: nextTheme === "dark" ? "🌙" : "☀️",
      duration: 1800,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("userChanged"));
    toast.success("Logged out successfully");
    setTimeout(() => {
      window.location.href = FRONTEND + "?logout=true";
    }, 600);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <nav className="menu-container">
      {/* Brand logo & name */}
      <div className="menu-brand-group">
        <Link to="/" className="d-flex align-items-center gap-2" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img src="/logo2.svg" alt="TradeXpert" className="menu-logo" />
          <span className="menu-brand-title">TradeXpert</span>
        </Link>
      </div>

      {/* Navigation links */}
      <div className="menus">
        <ul>
          <li>
            <Link
              to="/"
              className={`menu-link ${location.pathname === "/" ? "selected" : ""}`}
            >
              Dashboard
            </Link>
          </li>

          <li>
            <Link
              to="/orders"
              className={`menu-link ${location.pathname === "/orders" ? "selected" : ""}`}
            >
              Orders
            </Link>
          </li>

          <li>
            <Link
              to="/holdings"
              className={`menu-link ${location.pathname === "/holdings" ? "selected" : ""}`}
            >
              Holdings
            </Link>
          </li>

          <li>
            <Link
              to="/positions"
              className={`menu-link ${location.pathname === "/positions" ? "selected" : ""}`}
            >
              Positions
            </Link>
          </li>

          <li>
            <Link
              to="/funds"
              className={`menu-link ${location.pathname === "/funds" ? "selected" : ""}`}
            >
              Funds
            </Link>
          </li>

          <li>
            <Link
              to="/leaderboard"
              className={`menu-link ${location.pathname === "/leaderboard" ? "selected" : ""}`}
            >
              Leaderboard
            </Link>
          </li>

          {isAdmin() && (
            <li>
              <Link
                to="/admin"
                className={`menu-link ${location.pathname === "/admin" ? "selected" : ""}`}
              >
                Admin
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* Action buttons: Theme Toggle, User Chip, Home, Logout */}
      <div className="menu-actions">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="theme-toggle-btn"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* User Avatar Chip */}
        <div className="user-badge" title={user?.email || "User Profile"}>
          <div className="user-avatar-circle">
            {getInitials(user?.name)}
          </div>
          <span className="user-badge-name">{user?.name || "Trader"}</span>
        </div>

        {/* Home Link back to Landing page */}
        <a
          href={FRONTEND}
          className="btn-home"
          title="Go to TradeXpert Landing Page"
        >
          🌐 Home
        </a>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn-logout"
          title="Sign out of TradeXpert"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Menu;