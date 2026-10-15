import React from "react";
import { Link } from "react-router-dom";
import { DASHBOARD_URL } from "../utils/storage";

function NotFound() {
  const DASHBOARD = DASHBOARD_URL;

  return (
    <div
      className="container py-5 my-4 d-flex flex-column align-items-center justify-content-center text-center fade-up"
      style={{ minHeight: "68vh" }}
    >
      {/* 404 Visual Glitch / Compass Orb */}
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4 shadow-sm"
        style={{
          width: "120px",
          height: "120px",
          background: "radial-gradient(circle, rgba(56, 126, 209, 0.15) 0%, rgba(56, 126, 209, 0.03) 70%)",
          border: "2px dashed rgba(56, 126, 209, 0.4)",
        }}
      >
        <span
          style={{
            fontSize: "2.8rem",
            fontWeight: "900",
            color: "var(--primary, #387ED1)",
            letterSpacing: "-1px",
          }}
        >
          404
        </span>
      </div>

      <div className="badge rounded-pill px-3 py-2 fw-bold text-uppercase mb-3" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", letterSpacing: "0.05em", fontSize: "0.78rem" }}>
        <i className="fa-solid fa-triangle-exclamation me-1"></i> Destination Not Found
      </div>

      <h1 className="display-5 fw-bold mb-3" style={{ color: "var(--ink, #0f172a)", letterSpacing: "-0.03em" }}>
        Lost in Dalal Street?
      </h1>

      <p
        className="text-muted fs-5 mb-4"
        style={{ maxWidth: "560px", lineHeight: "1.6" }}
      >
        The page you are looking for does not exist, may have been relocated, or the URL address was mistyped.
      </p>

      {/* Primary Action Buttons */}
      <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
        <Link
          to="/"
          className="btn btn-primary rounded-pill px-4 py-2 fw-bold d-inline-flex align-items-center gap-2 hover-scale shadow-sm"
          style={{ fontSize: "0.95rem" }}
        >
          <i className="fa-solid fa-house"></i>
          <span>Back to Home</span>
        </Link>

        <a
          href={DASHBOARD}
          className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 hover-scale"
          style={{ fontSize: "0.95rem" }}
        >
          <i className="fa-solid fa-chart-line"></i>
          <span>Trading Terminal</span>
        </a>

        <Link
          to="/support"
          className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 hover-scale"
          style={{ fontSize: "0.95rem" }}
        >
          <i className="fa-solid fa-headset"></i>
          <span>Support Desk</span>
        </Link>
      </div>

      {/* Quick Direct Links Card */}
      <div
        className="p-4 rounded-4 text-start shadow-sm"
        style={{
          maxWidth: "600px",
          width: "100%",
          background: "var(--card-bg, #ffffff)",
          border: "1px solid var(--border, #E2E8F0)",
        }}
      >
        <h6 className="fw-bold mb-3" style={{ color: "var(--ink, #0f172a)" }}>
          <i className="fa-solid fa-compass me-2 text-primary"></i> Popular Destinations:
        </h6>
        <div className="row g-2 small">
          <div className="col-sm-6">
            <Link to="/about" className="text-decoration-none d-flex align-items-center gap-2 p-2 rounded hover-bg" style={{ color: "var(--ink, #0f172a)" }}>
              <i className="fa-solid fa-circle-info text-primary"></i>
              <span>About TradeXpert &amp; Team</span>
            </Link>
          </div>
          <div className="col-sm-6">
            <Link to="/product" className="text-decoration-none d-flex align-items-center gap-2 p-2 rounded hover-bg" style={{ color: "var(--ink, #0f172a)" }}>
              <i className="fa-solid fa-cubes text-primary"></i>
              <span>Terminal &amp; Connect API</span>
            </Link>
          </div>
          <div className="col-sm-6">
            <Link to="/pricing" className="text-decoration-none d-flex align-items-center gap-2 p-2 rounded hover-bg" style={{ color: "var(--ink, #0f172a)" }}>
              <i className="fa-solid fa-tag text-primary"></i>
              <span>Zero Brokerage Pricing</span>
            </Link>
          </div>
          <div className="col-sm-6">
            <Link to="/signup" className="text-decoration-none d-flex align-items-center gap-2 p-2 rounded hover-bg" style={{ color: "var(--ink, #0f172a)" }}>
              <i className="fa-solid fa-user-plus text-primary"></i>
              <span>Open Free Demat Account</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
