import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getStoredUser } from "../utils/storage";

function Navbar() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  const DASHBOARD =
    process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3001";

  useEffect(() => {
    const loadUser = () => {
      setUser(getStoredUser());
    };

    loadUser();

    window.addEventListener("storage", loadUser);
    window.addEventListener("userChanged", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("userChanged", loadUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    setOpen(false);

    window.dispatchEvent(new Event("userChanged"));

    // Redirect to current website after logout
    window.location.href = window.location.origin + "/?logout=true";
  };

  return (
    <nav
      className="navbar navbar-expand-lg border-bottom"
      style={{
        backgroundColor: "#fff",
      }}
    >
      <div className="container p-2">

        {/* LOGO */}
        <Link
          className="navbar-brand d-flex align-items-center text-decoration-none"
          to="/"
        >
          <img
            src="media/images/logo2.svg"
            alt="logo"
            style={{
              width: "55px",
            }}
          />

          <h1
            className="ms-3 mb-0"
            style={{
              color: "#3A77CF",
              fontSize: "42px",
            }}
          >
            <b>TradeXpert</b>
          </h1>
        </Link>

        {/* MENU */}
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto align-items-center gap-2">

            {/* LOGIN / SIGNUP OR INVEST NOW */}
            {!user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/signup">
                    Signup
                  </Link>
                </li>
              </>
            ) : (
              <li className="nav-item me-2">
                <a
                  href={DASHBOARD}
                  className="invest-now-btn"
                  style={{
                    background: "#387ed1",
                    color: "#fff",
                    padding: "8px 18px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    textDecoration: "none",
                  }}
                >
                  Invest Now
                </a>
              </li>
            )}

            {/* COMMON LINKS */}

            <li className="nav-item">
              <Link className="nav-link" to="/about">
                About
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/product">
                Product
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/pricing">
                Pricing
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/support">
                Support
              </Link>
            </li>

            {/* USER PROFILE */}
            {user && (
              <li className="nav-item position-relative ms-3">

                {/* AVATAR */}
                <div
                  onClick={() => setOpen(!open)}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "#fff",
                    border: "2px solid #387ed1",
                    color: "#387ed1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontWeight: "700",
                    boxShadow: "0 0 10px rgba(56,126,209,0.2)",
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </div>

                {/* DROPDOWN */}
                {open && (
                  <div
                    style={{
                      position: "absolute",
                      top: "55px",
                      right: "0",
                      background: "#fff",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                      minWidth: "200px",
                      overflow: "hidden",
                      zIndex: 999,
                    }}
                  >

                    {/* USER NAME */}
                    <div
                      style={{
                        padding: "12px 15px",
                        fontWeight: "600",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      {user?.name}
                    </div>

                    {/* PROFILE */}
                    <Link
                      to="/profile"
                      style={{
                        padding: "12px 15px",
                        display: "block",
                        textDecoration: "none",
                        color: "#333",
                      }}
                      onClick={() => setOpen(false)}
                    >
                      👤 Profile
                    </Link>

                    {/* LOGOUT */}
                    <div
                      onClick={handleLogout}
                      style={{
                        padding: "12px 15px",
                        cursor: "pointer",
                        color: "#e53935",
                        fontWeight: "600",
                        borderTop: "1px solid #eee",
                      }}
                    >
                      🚪 Logout
                    </div>

                  </div>
                )}

              </li>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;