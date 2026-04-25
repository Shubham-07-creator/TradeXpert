// ==========================================
// dashboard/src/Menu.js
// FULL UPDATED COPY-PASTE READY
// redirect safe + logout safe
// ==========================================

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Menu = () => {
  const location = useLocation();

  const FRONTEND =
    process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";

  const [selectedMenu, setSelectedMenu] = useState(0);

  const handleMenuClick = (index) => {
    setSelectedMenu(index);
  };

  const handleLogout = () => {
    // clear auth data
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // notify listeners
    window.dispatchEvent(new Event("userChanged"));

    // redirect to frontend
    window.location.href = FRONTEND + "?logout=true";
  };

  const menuClass = "menu";
  const activeMenuClass = "menu selected";

  const isActive = (path, index) => {
    if (location.pathname === path) {
      return activeMenuClass;
    }

    return selectedMenu === index ? activeMenuClass : menuClass;
  };

  return (
    <div className="menu-container">
      <img src="logo.png" alt="logo" style={{ width: "50px" }} />

      <div className="menus">
        <ul>
          {/* HOME */}
          <li>
            <a
              href={FRONTEND}
              style={{
                background: "linear-gradient(135deg,#387ed1,#2f6bc2)",
                color: "#fff",
                padding: "6px 16px",
                borderRadius: "6px",
                fontWeight: "500",
                textDecoration: "none",
                display: "inline-block",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              Home
            </a>
          </li>

          {/* DASHBOARD */}
          <li>
            <Link to="/" onClick={() => handleMenuClick(0)}>
              <p className={isActive("/", 0)}>Dashboard</p>
            </Link>
          </li>

          {/* ORDERS */}
          <li>
            <Link to="/orders" onClick={() => handleMenuClick(1)}>
              <p className={isActive("/orders", 1)}>Orders</p>
            </Link>
          </li>

          {/* HOLDINGS */}
          <li>
            <Link to="/holdings" onClick={() => handleMenuClick(2)}>
              <p className={isActive("/holdings", 2)}>Holdings</p>
            </Link>
          </li>

          {/* POSITIONS */}
          <li>
            <Link to="/positions" onClick={() => handleMenuClick(3)}>
              <p className={isActive("/positions", 3)}>Positions</p>
            </Link>
          </li>

          {/* FUNDS */}
          <li>
            <Link to="/funds" onClick={() => handleMenuClick(4)}>
              <p className={isActive("/funds", 4)}>Funds</p>
            </Link>
          </li>

          {/* LOGOUT */}
          <li>
            <button
              onClick={handleLogout}
              style={{
                background: "#387ed1",
                color: "#fff",
                border: "none",
                padding: "6px 14px",
                borderRadius: "6px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </li>
        </ul>

        <hr />
      </div>
    </div>
  );
};

export default Menu;
 