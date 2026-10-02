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
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);

      const res = await axios.post(`${API}/login`, {
        email,
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
        // Code generation failed — fallback: redirect without code
        window.location.href = DASHBOARD;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Sign in failed ❌");
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
          <img
            src="/media/images/logo2.svg"
            alt="TradeXpert"
            style={{ width: "48px", transition: "transform 0.3s ease" }}
            className="mb-2 logo-hover"
          />
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
          <span>or continue with email</span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin}>
          {/* Email Address */}
          <div className="field mb-3">
            <label className="fw-semibold small mb-1" style={{ color: "var(--ink-secondary)" }}>
              Email Address
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
              />
            </div>
          </div>

          {/* Password */}
          <div className="field mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="fw-semibold small mb-0" style={{ color: "var(--ink-secondary)" }}>
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-decoration-none fw-semibold"
                style={{ color: "var(--primary)", fontSize: "13px" }}
              >
                Forgot Password?
              </Link>
            </div>
            <div className="auth-input-group">
              <span className="auth-input-icon">
                <i className="fas fa-lock"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="auth-input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          {/* Shimmer Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-auth-shimmer mt-2"
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
          New to TradeXpert?{" "}
          <span
            className="fw-bold"
            style={{ color: "var(--primary)", cursor: "pointer", transition: "color 0.2s ease" }}
            onClick={() => navigate("/signup")}
          >
            Create free account &rarr;
          </span>
        </p>
      </div>
    </AuthShell>
  );
}

export default Login;