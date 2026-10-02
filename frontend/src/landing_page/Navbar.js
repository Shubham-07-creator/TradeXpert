import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import MarketTicker from "./MarketTicker";
import { DASHBOARD_URL } from "../utils/storage";

function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const DASHBOARD = DASHBOARD_URL;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed-top transition-all" style={{ zIndex: 1030 }}>
      {/* 1. Live Market Ticker Marquee */}
      <MarketTicker />

      {/* 2. Main Navigation Bar */}
      <nav
        className={`navbar navbar-expand-lg transition-all ${
          scrolled ? "scrolled shadow-sm" : ""
        }`}
        style={{
          background: isDark
            ? "rgba(15, 23, 42, 0.92)"
            : scrolled
            ? "rgba(255, 255, 255, 0.95)"
            : "#ffffff",
          backdropFilter: "blur(12px)",
          borderBottom: isDark ? "1px solid #334155" : "1px solid #E2E8F0",
          padding: scrolled ? "10px 0" : "16px 0",
          transition: "all 0.3s ease",
        }}
      >
        <div className="container">
          {/* LOGO */}
          <Link
            className="navbar-brand d-flex align-items-center text-decoration-none"
            to="/"
          >
            <img
              src="/media/images/logo2.svg"
              alt="TradeXpert logo"
              style={{
                width: "42px",
                marginRight: "10px",
                transition: "transform 0.3s ease",
              }}
              className="logo-hover"
            />
            <span
              className="mb-0 fw-bold"
              style={{
                color: "var(--primary)",
                fontSize: "26px",
                letterSpacing: "-0.5px",
              }}
            >
              TradeXpert
            </span>
          </Link>

          {/* RIGHT TOOLS (Mobile Theme Toggle + Hamburger) */}
          <div className="d-flex align-items-center gap-2 d-lg-none">
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <i className="fa-solid fa-sun" style={{ color: "#FBBF24" }}></i>
              ) : (
                <i className="fa-solid fa-moon"></i>
              )}
            </button>

            <button
              className="navbar-toggler border-0 shadow-none p-1"
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>

          {/* MENU */}
          <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}>
            <ul className="navbar-nav ms-auto align-items-center gap-2 gap-lg-3">
              {/* COMMON LINKS */}
              <li className="nav-item">
                <Link className="nav-link fw-semibold" to="/about">
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-semibold" to="/product">
                  Product
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-semibold" to="/pricing">
                  Pricing
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-semibold" to="/support">
                  Support
                </Link>
              </li>

              {/* DESKTOP THEME TOGGLE */}
              <li className="nav-item d-none d-lg-block">
                <button
                  type="button"
                  className="theme-toggle-btn"
                  onClick={toggleTheme}
                  title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDark ? (
                    <i
                      className="fa-solid fa-sun"
                      style={{ color: "#FBBF24" }}
                    ></i>
                  ) : (
                    <i className="fa-solid fa-moon"></i>
                  )}
                </button>
              </li>

              {!user ? (
                <div className="d-flex flex-column flex-lg-row gap-2 ms-lg-2 mt-3 mt-lg-0">
                  <li className="nav-item">
                    <Link
                      className="btn px-3 py-1 fw-semibold rounded-pill"
                      style={{
                        border: "1px solid var(--border)",
                        color: "var(--ink)",
                        fontSize: "0.9rem",
                      }}
                      to="/login"
                    >
                      Sign In
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="btn px-3 py-1 fw-semibold rounded-pill text-white shadow-sm"
                      style={{
                        background: "var(--primary)",
                        border: "1px solid var(--primary)",
                        fontSize: "0.9rem",
                        boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                      }}
                      to="/signup"
                    >
                      Sign Up
                    </Link>
                  </li>
                </div>
              ) : (
                <div className="d-flex flex-column flex-lg-row align-items-center gap-3 ms-lg-2 mt-3 mt-lg-0">
                  <li className="nav-item">
                    <a
                      href={DASHBOARD}
                      className="btn px-4 py-2 fw-semibold rounded-pill text-white shadow-sm hover-scale"
                      style={{
                        background: "var(--primary)",
                        border: "1px solid var(--primary)",
                        fontSize: "0.92rem",
                        boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
                      }}
                    >
                      <i className="fa-solid fa-chart-line me-1"></i> Open Terminal
                    </a>
                  </li>

                  {/* USER PROFILE AVATAR & DROPDOWN */}
                  <li className="nav-item position-relative">
                    <div
                      onClick={() => setOpen(!open)}
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        background: isDark
                          ? "linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)"
                          : "linear-gradient(135deg, #EBF2FC 0%, #F8FAFD 100%)",
                        border: "2px solid var(--primary)",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "17px",
                        boxShadow: "0 4px 12px rgba(56,126,209,0.18)",
                        transition: "all 0.3s ease",
                      }}
                      className="avatar-hover"
                    >
                      {user?.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    {/* DROPDOWN */}
                    <div
                      className={`dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 mt-2 p-0 ${
                        open ? "show d-block" : "d-none"
                      }`}
                      style={{
                        minWidth: "230px",
                        animation: open
                          ? "fadeIn 0.2s ease-out forwards"
                          : "none",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        className="p-3 border-bottom"
                        style={{
                          background: isDark ? "#0F172A" : "#F8FAFD",
                        }}
                      >
                        <p className="mb-0 fw-bold" style={{ color: "var(--ink)" }}>
                          {user?.name}
                        </p>
                        <small className="text-muted">{user?.email}</small>
                      </div>
                      <Link
                        to="/profile"
                        className="dropdown-item py-2 fw-semibold d-flex align-items-center gap-2"
                        onClick={() => setOpen(false)}
                      >
                        <i className="fa-regular fa-user text-muted"></i> View Profile
                      </Link>
                      <a
                        href={DASHBOARD}
                        className="dropdown-item py-2 fw-semibold d-flex align-items-center gap-2"
                        onClick={() => setOpen(false)}
                      >
                        <i className="fa-solid fa-chart-line text-muted"></i> Trading Dashboard
                      </a>
                      <div className="dropdown-divider my-0"></div>
                      <button
                        onClick={() => {
                          setOpen(false);
                          logout();
                        }}
                        className="dropdown-item py-2 fw-semibold text-danger d-flex align-items-center gap-2"
                      >
                        <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign Out
                      </button>
                    </div>
                  </li>
                </div>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
