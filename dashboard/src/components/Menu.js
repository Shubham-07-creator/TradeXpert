import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { isAdmin, getCurrentUser } from "../utils/auth";
import toast from "react-hot-toast";
import ConfirmModal from "./ConfirmModal";

const Menu = () => {
  const location = useLocation();
  const user = getCurrentUser();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const FRONTEND =
    process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";

  // Dark / Light Mode Sync
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    window.dispatchEvent(new CustomEvent("themeChanged", { detail: theme }));
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    toast(`Switched to ${nextTheme === "dark" ? "Dark" : "Light"} Mode`, {
      icon: nextTheme === "dark" ? "🌙" : "☀️",
      duration: 1500,
      id: "theme-toggle",
    });
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("userChanged"));
    toast.success("Signed out successfully.", { duration: 1500 });
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
          {theme === "dark" ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
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
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </a>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="btn-logout"
          title="Sign out of TradeXpert"
        >
          Logout
        </button>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmModal
        isOpen={showLogoutModal}
        title="Sign Out of TradeXpert?"
        message="Are you sure you want to end your active trading session? Any open limit orders will remain safely in the market."
        icon="🚪"
        confirmText="Yes, Sign Out"
        cancelText="Keep Trading"
        isDanger={true}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </nav>
  );
};

export default Menu;