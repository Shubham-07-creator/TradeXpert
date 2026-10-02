import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import AuthShell from "../AuthShell";
import { API_URL } from "../../utils/storage";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const getRawToken = () => {
    const fromSearch = searchParams.get("token");
    if (fromSearch) return fromSearch.trim();

    if (window.location.search.includes("token=")) {
      const match = window.location.search.match(/[?&]token=([^&#]+)/);
      if (match && match[1]) return decodeURIComponent(match[1]).trim();
    }

    if (window.location.hash.includes("token=")) {
      const match = window.location.hash.match(/[#&]token=([^&#]+)/);
      if (match && match[1]) return decodeURIComponent(match[1]).trim();
    }

    return "";
  };

  const token = getRawToken();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Reset token is missing or invalid ❌");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long ❌");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match ❌");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/reset-password`, {
        token,
        newPassword,
      });

      toast.success(res.data.message || "Password updated successfully! ✅");
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      console.error("Reset password failed:", err);
      toast.error(
        err.response?.data?.message || "Failed to update password ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell>
        <div className="auth-form-container text-center fade-up">
          <i className="fa-solid fa-triangle-exclamation text-warning fs-1 mb-3"></i>
          <h3 className="fw-bold mb-2">Invalid Reset Link</h3>
          <p className="text-muted small mb-4">
            This password reset link is missing a valid token. Please request a new link.
          </p>
          <Link
            to="/forgot-password"
            className="btn btn-primary rounded-pill px-4 py-2"
          >
            Request New Link
          </Link>
        </div>
      </AuthShell>
    );
  }

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
            Set New Password
          </h2>
          <p className="text-muted" style={{ fontSize: "14px" }}>
            Create a strong new password for your account.
          </p>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit}>
            <div className="field mb-3">
              <label
                className="fw-semibold small mb-1"
                style={{ color: "var(--ink-secondary)" }}
              >
                New Password
              </label>
              <div className="auth-input-group">
                <span className="auth-input-icon">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  className="auth-input-field"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <i
                    className={`fas ${
                      showPassword ? "fa-eye-slash" : "fa-eye"
                    }`}
                  ></i>
                </button>
              </div>
            </div>

            <div className="field mb-4">
              <label
                className="fw-semibold small mb-1"
                style={{ color: "var(--ink-secondary)" }}
              >
                Confirm New Password
              </label>
              <div className="auth-input-group">
                <span className="auth-input-icon">
                  <i className="fas fa-shield"></i>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat new password"
                  className="auth-input-field"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
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
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Update Password</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center p-3 rounded-3" style={{ background: "rgba(0, 208, 156, 0.08)", border: "1px solid var(--accent)" }}>
            <i className="fa-solid fa-circle-check text-success fs-1 mb-3"></i>
            <h5 className="fw-bold mb-2">Password Updated!</h5>
            <p className="text-muted small mb-3">
              Your password has been changed. Redirecting to login page...
            </p>
            <Link
              to="/login"
              className="btn btn-primary rounded-pill px-4 py-2 small"
            >
              Go to Login Now
            </Link>
          </div>
        )}
      </div>
    </AuthShell>
  );
}

export default ResetPassword;
