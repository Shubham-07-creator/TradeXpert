import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import AuthShell from "../AuthShell";
import { API_URL } from "../../utils/storage";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address ❌");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/forgot-password`, { email });

      toast.success(res.data.message || "Reset link generated! ✅");
      setSubmitted(true);
      if (res.data.resetUrl) {
        setResetUrl(res.data.resetUrl);
      }
    } catch (err) {
      console.error("Forgot password request failed:", err);
      toast.error(
        err.response?.data?.message || "Failed to request password reset ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="auth-form-container fade-up">
        <div className="text-center mb-4">
          <img
            src="/media/images/logo2.svg"
            alt="TradeXpert"
            style={{ width: "50px" }}
            className="mb-2"
          />
          <h2 className="fw-bold" style={{ color: "var(--primary-darker)" }}>
            Forgot Password?
          </h2>
          <p className="text-muted" style={{ fontSize: "14px" }}>
            Don't worry! Enter your email and we will send you a reset link.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className="field mb-4">
              <label
                className="fw-semibold small mb-1"
                style={{ color: "var(--ink-secondary)" }}
              >
                Registered Email Address
              </label>
              <div className="auth-input-group">
                <span className="auth-input-icon">
                  <i className="fas fa-envelope"></i>
                </span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="auth-input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-auth-shimmer mt-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Sending reset link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center p-3 rounded-3" style={{ background: "rgba(56, 126, 209, 0.08)", border: "1px solid var(--border)" }}>
            <i className="fa-solid fa-circle-check text-success fs-1 mb-3"></i>
            <h5 className="fw-bold mb-2">Check Your Email</h5>
            <p className="text-muted small mb-3">
              We have processed your request for <b>{email}</b>.
            </p>

            {resetUrl && (
              <div
                className="mt-3 p-3 rounded-3 text-start"
                style={{
                  background: "var(--card-bg, #ffffff)",
                  border: "1px solid var(--border, #E2E8F0)",
                }}
              >
                <small className="fw-bold text-primary d-block mb-1">
                  <i className="fa-solid fa-link me-1"></i> Quick Test Reset Link:
                </small>
                <a
                  href={resetUrl}
                  className="text-break small text-decoration-none fw-medium"
                >
                  {resetUrl}
                </a>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-4">
          <Link
            to="/login"
            className="text-decoration-none fw-semibold small d-inline-flex align-items-center gap-1"
            style={{ color: "var(--primary)" }}
          >
            <i className="fa-solid fa-arrow-left-long"></i> Back to Login
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

export default ForgotPassword;
