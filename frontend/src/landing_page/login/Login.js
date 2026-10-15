import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import AuthShell from "../AuthShell";
import GoogleAuthButton from "./GoogleAuthButton";
import "../../auth.css";

import { API_URL, DASHBOARD_URL } from "../../utils/storage";

function Login() {
  const navigate = useNavigate();

  const API = API_URL;
  const DASHBOARD = DASHBOARD_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email || !email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address";
    }

    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    return errs;
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    setTouched({ email: true, password: true });
    const errs = validate();
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      toast.error(errs.email || errs.password || "Please check your inputs ⚠️");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API}/login`, {
        email: email.trim(),
        password,
      });

      const token = res.data.token;
      const userStr = JSON.stringify(res.data.user);

      localStorage.setItem("token", token);
      localStorage.setItem("user", userStr);

      window.dispatchEvent(new Event("userChanged"));

      toast.success("Welcome back 🚀");

      // Try to get a one-time code for secure redirect
      try {
        const codeRes = await axios.post(
          `${API}/auth/code`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );

        window.location.href = `${DASHBOARD}?code=${encodeURIComponent(
          codeRes.data.code,
        )}`;
      } catch (codeErr) {
        window.location.href = DASHBOARD;
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || "Sign in failed ❌";
      toast.error(serverMsg);
      setErrors((prev) => ({
        ...prev,
        server: serverMsg,
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="auth-form-container">
        {/* Dual-Tab Mode Switcher */}
        <div className="auth-tab-switcher">
          <button type="button" className="auth-tab-btn active">
            <i className="fa-solid fa-arrow-right-to-bracket"></i> Sign In
          </button>
          <button
            type="button"
            className="auth-tab-btn"
            onClick={() => navigate("/signup")}
          >
            <i className="fa-solid fa-user-plus"></i> Create Account
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-4">
          <Link to="/" title="Back to TradeXpert Home">
            <img
              src="/media/images/logo2.svg"
              alt="TradeXpert"
              style={{ width: "48px", transition: "transform 0.3s ease" }}
              className="mb-2 logo-hover"
            />
          </Link>
          <h2 className="fw-bold mb-1" style={{ color: "var(--ink)", letterSpacing: "-0.03em" }}>
            Welcome Back
          </h2>
          <p className="text-muted small mb-0">
            Sign in to access your pro trading terminal and portfolio
          </p>
        </div>

        {/* Google One-Click Sign In */}
        <div className="d-flex justify-content-center mb-2">
          <GoogleAuthButton isSignup={false} />
        </div>

        <div className="auth-divider">
          <span>or sign in with credentials</span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} noValidate>
          {errors.server && (
            <div
              className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3"
              role="alert"
            >
              <i className="fa-solid fa-circle-exclamation flex-shrink-0"></i>
              <span>{errors.server}</span>
            </div>
          )}

          {/* Email Address */}
          <div className="field mb-3">
            <label className="fw-semibold small mb-1" style={{ color: "var(--ink-secondary)" }}>
              Email Address <span className="text-danger">*</span>
            </label>
            <div
              className={`auth-input-group ${
                touched.email && errors.email ? "has-error" : ""
              }`}
            >
              <span className="auth-input-icon">
                <i className="fas fa-envelope"></i>
              </span>
              <input
                type="email"
                placeholder="name@example.com"
                className="auth-input-field"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                required
              />
            </div>
            {touched.email && errors.email && (
              <div className="auth-field-error">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Password */}
          <div className="field mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="fw-semibold small mb-0" style={{ color: "var(--ink-secondary)" }}>
                Password <span className="text-danger">*</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-decoration-none fw-semibold"
                style={{ color: "var(--primary)", fontSize: "13px" }}
              >
                Forgot Password?
              </Link>
            </div>
            <div
              className={`auth-input-group ${
                touched.password && errors.password ? "has-error" : ""
              }`}
            >
              <span className="auth-input-icon">
                <i className="fas fa-lock"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="auth-input-field"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                required
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
            {touched.password && errors.password && (
              <div className="auth-field-error">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-auth-shimmer"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Terminal</span>
                <i className="fa-solid fa-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-4 text-muted small mb-0">
          Don't have an account?{" "}
          <span
            className="fw-bold"
            style={{ color: "var(--primary)", cursor: "pointer", transition: "color 0.2s ease" }}
            onClick={() => navigate("/signup")}
          >
            Create one free &rarr;
          </span>
        </p>

        <div className="text-center mt-3">
          <Link
            to="/"
            className="text-decoration-none small text-muted hover-primary"
            style={{ fontSize: "0.82rem" }}
          >
            <i className="fa-solid fa-arrow-left me-1"></i> Back to Homepage
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

export default Login;