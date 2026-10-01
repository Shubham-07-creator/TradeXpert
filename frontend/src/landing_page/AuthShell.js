import React from "react";
import { Link } from "react-router-dom";
import "../auth.css";

// Shared layout for Login + Signup: branded side panel on desktop,
// and the form card (with the logo on top) on every screen size.
function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <div className="auth-aside-inner">
          <span className="hero-pill hero-pill-light">
            Virtual trading, real market feel
          </span>

          <h2>Your journey to smarter investing starts here</h2>

          <p>
            Practice with a virtual ₹1,00,000 wallet — zero risk, all the
            learning.
          </p>

          <ul className="auth-points">
            <li>
              <i className="fa-solid fa-circle-check"></i> Live-updating
              watchlist of 50 stocks
            </li>
            <li>
              <i className="fa-solid fa-circle-check"></i> Track your
              portfolio against NIFTY 50
            </li>
            <li>
              <i className="fa-solid fa-circle-check"></i> Compete on the
              leaderboard
            </li>
          </ul>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          {title && (
            <div className="text-center mb-4">
              <Link to="/" className="auth-logo d-inline-flex align-items-center gap-2 mb-2 text-decoration-none">
                <img src="/media/images/logo2.svg" alt="TradeXpert logo" style={{ width: "38px" }} />
                <span className="fw-bold fs-4 text-primary">TradeXpert</span>
              </Link>
              <h1 className="auth-title mt-2 fw-bold fs-3">{title}</h1>
              {subtitle && <p className="auth-sub text-muted small">{subtitle}</p>}
            </div>
          )}

          {children}

          {footer && <p className="auth-footer mt-4 text-center text-muted small">{footer}</p>}
        </div>
      </main>
    </div>
  );
}

export default AuthShell;