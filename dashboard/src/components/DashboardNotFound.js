import React from "react";
import { Link } from "react-router-dom";

const DashboardNotFound = () => {
  const FRONTEND =
    process.env.REACT_APP_FRONTEND_URL || "https://tradexpert-vq6s.onrender.com";

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-center p-4 fade-up"
      style={{
        minHeight: "65vh",
        background: "var(--color-bg-card)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        margin: "12px 0",
      }}
    >
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "rgba(56, 126, 209, 0.1)",
          color: "var(--color-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
          fontWeight: "800",
          marginBottom: "16px",
        }}
      >
        404
      </div>

      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: "800",
          color: "var(--color-text-strong)",
          marginBottom: "8px",
        }}
      >
        Terminal Section Not Found
      </h2>

      <p
        style={{
          fontSize: "0.92rem",
          color: "var(--color-text-muted)",
          maxWidth: "420px",
          lineHeight: "1.6",
          marginBottom: "24px",
        }}
      >
        The terminal route or tool you attempted to access doesn't exist. Select a valid tab or return to the main Dashboard Summary.
      </p>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          to="/"
          style={{
            background: "var(--color-primary)",
            color: "#ffffff",
            padding: "8px 20px",
            borderRadius: "var(--radius-md)",
            fontWeight: "700",
            fontSize: "0.85rem",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          Dashboard Summary
        </Link>

        <a
          href={FRONTEND}
          style={{
            background: "var(--color-bg-subtle)",
            color: "var(--color-text-strong)",
            border: "1px solid var(--color-border)",
            padding: "8px 18px",
            borderRadius: "var(--radius-md)",
            fontWeight: "600",
            fontSize: "0.85rem",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
          Landing Website
        </a>
      </div>
    </div>
  );
};

export default DashboardNotFound;
