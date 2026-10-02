import React, { useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthShell from "../AuthShell";
import GoogleAuthButton from "../login/GoogleAuthButton";
import "../../auth.css";

import { API_URL } from "../../utils/storage";

function Signup() {
  const navigate = useNavigate();

  const API = API_URL;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    city: "",
    state: "",
    address: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Live password strength calculation
  const passwordStrength = useMemo(() => {
    const pw = form.password;
    if (!pw) return { score: 0, label: "", color: "" };

    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    switch (score) {
      case 1:
        return { score: 1, label: "Weak (needs 8+ chars & numbers)", color: "#EF4444" };
      case 2:
        return { score: 2, label: "Fair (add mixed case & symbols)", color: "#F59E0B" };
      case 3:
        return { score: 3, label: "Good (almost optimal)", color: "#3B82F6" };
      case 4:
        return { score: 4, label: "Strong & Secure 🛡️", color: "#10B981" };
      default:
        return { score: 0, label: "", color: "" };
    }
  }, [form.password]);

  const handleSignup = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);

      await axios.post(`${API}/signup`, form);

      toast.success("Account created successfully 🚀 Welcome aboard!");

      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="auth-form-container" style={{ width: "100%", maxWidth: "540px" }}>
        {/* Dual-Tab Mode Switcher */}
        <div className="auth-tab-switcher">
          <button
            type="button"
            className="auth-tab-btn"
            onClick={() => navigate("/login")}
          >
            <i className="fa-solid fa-arrow-right-to-bracket"></i> Sign In
          </button>
          <button type="button" className="auth-tab-btn active">
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
            Open Free Account
          </h2>
          <p className="text-muted small mb-0">
            Start paper trading with ₹1,00,000 virtual balance in &lt;5 mins
          </p>
        </div>

        {/* Google One-Click Sign Up */}
        <div className="d-flex justify-content-center mb-2">
          <GoogleAuthButton isSignup={true} />
        </div>

        <div className="auth-divider">
          <span>or register with email</span>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSignup}>
          <div className="form-grid">
            {/* Full Name */}
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label className="fw-semibold small mb-1" style={{ color: "var(--ink-secondary)" }}>
                Full Name
              </label>
              <div className="auth-input-group">
                <span className="auth-input-icon">
                  <i className="fas fa-user"></i>
                </span>
                <input
                  name="name"
                  type="text"
                  placeholder="Shubham Kumar"
                  value={form.name}
                  onChange={handleChange}
                  className="auth-input-field"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label className="fw-semibold small mb-1" style={{ color: "var(--ink-secondary)" }}>
                Email Address
              </label>
              <div className="auth-input-group">
                <span className="auth-input-icon">
                  <i className="fas fa-envelope"></i>
                </span>
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="auth-input-field"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="field">
              <label className="fw-semibold small mb-1" style={{ color: "var(--ink-secondary)" }}>
                Phone Number
              </label>
              <div className="auth-input-group">
                <span className="auth-input-icon">
                  <i className="fas fa-phone"></i>
                </span>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  className="auth-input-field"
                  required
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="field">
              <label className="fw-semibold small mb-1" style={{ color: "var(--ink-secondary)" }}>
                Date of Birth
              </label>
              <div className="auth-input-group">
                <span className="auth-input-icon">
                  <i className="fas fa-calendar"></i>
                </span>
                <input
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                  className="auth-input-field"
                  required
                />
              </div>
            </div>

            {/* City */}
            <div className="field">
              <label className="fw-semibold small mb-1" style={{ color: "var(--ink-secondary)" }}>
                City
              </label>
              <div className="auth-input-group">
                <span className="auth-input-icon">
                  <i className="fas fa-city"></i>
                </span>
                <input
                  name="city"
                  type="text"
                  placeholder="Mumbai"
                  value={form.city}
                  onChange={handleChange}
                  className="auth-input-field"
                  required
                />
              </div>
            </div>

            {/* State */}
            <div className="field">
              <label className="fw-semibold small mb-1" style={{ color: "var(--ink-secondary)" }}>
                State
              </label>
              <div className="auth-input-group">
                <span className="auth-input-icon">
                  <i className="fas fa-map-location-dot"></i>
                </span>
                <input
                  name="state"
                  type="text"
                  placeholder="Maharashtra"
                  value={form.state}
                  onChange={handleChange}
                  className="auth-input-field"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label className="fw-semibold small mb-1" style={{ color: "var(--ink-secondary)" }}>
                Residential Address
              </label>
              <div className="auth-input-group">
                <span className="auth-input-icon">
                  <i className="fas fa-home"></i>
                </span>
                <input
                  name="address"
                  type="text"
                  placeholder="Flat / Building / Street address"
                  value={form.address}
                  onChange={handleChange}
                  className="auth-input-field"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label className="fw-semibold small mb-1" style={{ color: "var(--ink-secondary)" }}>
                Security Password
              </label>
              <div className="auth-input-group">
                <span className="auth-input-icon">
                  <i className="fas fa-shield-alt"></i>
                </span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={handleChange}
                  className="auth-input-field"
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

              {/* Dynamic Password Strength Meter */}
              {form.password && (
                <div className="mt-2 fade-in">
                  <div className="pw-strength-bar-wrapper">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className="pw-strength-segment"
                        style={{
                          backgroundColor:
                            passwordStrength.score >= step
                              ? passwordStrength.color
                              : "var(--border)",
                        }}
                      ></div>
                    ))}
                  </div>
                  <div
                    className="pw-strength-text"
                    style={{ color: passwordStrength.color }}
                  >
                    <span>Strength: {passwordStrength.label}</span>
                    <span className="text-muted fw-normal" style={{ fontSize: "0.75rem" }}>
                      Min 8 chars, 1 number &amp; 1 symbol
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shimmer Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-auth-shimmer mt-4"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Free Trading Account</span>
                <i className="fa-solid fa-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-4 text-muted small mb-0">
          Already have an account?{" "}
          <span
            className="fw-bold"
            style={{ color: "var(--primary)", cursor: "pointer", transition: "color 0.2s ease" }}
            onClick={() => navigate("/login")}
          >
            Sign in &rarr;
          </span>
        </p>
      </div>
    </AuthShell>
  );
}

export default Signup;
