import React from "react";
import { Link } from "react-router-dom";
import "../auth.css";

// Shared layout for Login + Signup: MAANG-grade branded side panel on desktop,
// and glowing glassmorphism form card on every screen size.
function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      {/* --- Left Aside Panel with Interactive Telemetry --- */}
      <aside className="auth-aside">
        {/* Animated Background Mesh Orbs */}
        <div className="auth-aside-orb auth-aside-orb-1"></div>
        <div className="auth-aside-orb auth-aside-orb-2"></div>

        <div className="auth-aside-inner">
          <div className="auth-eyebrow-pill">
            <span className="live-dot me-1"></span>
            <span>PRO TRADING TERMINAL</span>
          </div>

          <h1 className="auth-aside-title">
            Trade with precision.<br />Grow with confidence.
          </h1>

          <p className="auth-aside-subtitle">
            Experience ultra-low latency execution, real-time WebSocket market feeds, and practice risk-free with a ₹1,00,000 virtual wallet.
          </p>

          {/* Interactive Simulated Telemetry Cards */}
          <div className="auth-telemetry-card">
            <div className="auth-telemetry-badge" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34D399" }}>
              <i className="fa-solid fa-arrow-trend-up"></i>
            </div>
            <div>
              <div className="auth-telemetry-title d-flex align-items-center gap-2">
                <span>NIFTY 50</span>
                <span className="text-success small fw-bold">24,850.20 (+0.45%)</span>
              </div>
              <div className="auth-telemetry-desc">Live streaming multi-exchange order books</div>
            </div>
          </div>

          <div className="auth-telemetry-card">
            <div className="auth-telemetry-badge" style={{ background: "rgba(59, 130, 246, 0.2)", color: "#60A5FA" }}>
              <i className="fa-solid fa-wallet"></i>
            </div>
            <div>
              <div className="auth-telemetry-title">₹1,00,000 Virtual Capital</div>
              <div className="auth-telemetry-desc">Instant paper trading wallet with zero real risk</div>
            </div>
          </div>

          <div className="auth-telemetry-card">
            <div className="auth-telemetry-badge" style={{ background: "rgba(245, 158, 11, 0.2)", color: "#FBBF24" }}>
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <div className="auth-telemetry-title">Server-Side Risk Engine</div>
              <div className="auth-telemetry-desc">GTT Stop-Loss orders &amp; automated RMS safeguards</div>
            </div>
          </div>
        </div>

        {/* Aside Verified Footer Strip */}
        <div className="auth-aside-footer">
          <div className="auth-aside-footer-item">
            <i className="fa-solid fa-circle-check text-success"></i>
            <span>SEBI &amp; NSE Registered</span>
          </div>
          <div className="auth-aside-footer-item">
            <i className="fa-solid fa-lock text-info"></i>
            <span>256-Bit SSL Encrypted</span>
          </div>
          <div className="auth-aside-footer-item">
            <i className="fa-solid fa-bolt text-warning"></i>
            <span>&lt;15ms Latency</span>
          </div>
        </div>
      </aside>

      {/* --- Right Main Form Container --- */}
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