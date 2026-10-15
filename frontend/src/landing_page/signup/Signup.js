import React, { useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthShell from "../AuthShell";
import GoogleAuthButton from "../login/GoogleAuthButton";
import "../../auth.css";

import { API_URL } from "../../utils/storage";
import { INDIAN_STATES } from "../../utils/indiaStates";

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

  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Field validation function
  const validateField = (name, value) => {
    const val = (value || "").toString().trim();
    switch (name) {
      case "name":
        if (!val) return "Full name is required";
        if (!/^[a-zA-Z\s.']{2,60}$/.test(val))
          return "Name must contain only letters and spaces (min 2 characters)";
        return "";

      case "email":
        if (!val) return "Email address is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
          return "Please enter a valid email address";
        return "";

      case "phone": {
        const clean = val.replace(/[\s+-]/g, "");
        if (!clean) return "Mobile number is required";
        if (!/^[6-9]\d{9}$/.test(clean))
          return "Enter a valid 10-digit Indian mobile number (e.g. 9876543210)";
        return "";
      }

      case "dob": {
        if (!val) return "Date of birth is required";
        const birthDate = new Date(val);
        const today = new Date();
        const age = (today - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
        if (isNaN(age) || birthDate > today) return "Invalid date of birth";
        if (age < 18) return "You must be at least 18 years old to open an account";
        return "";
      }

      case "city":
        if (!val) return "City is required";
        if (!/^[a-zA-Z\s.'-]{2,50}$/.test(val))
          return "City must contain only letters and spaces (no numbers or symbols)";
        return "";

      case "state":
        if (!val) return "Please select your state from the dropdown";
        if (!INDIAN_STATES.includes(val))
          return "Please select a valid state from the list";
        return "";

      case "address":
        if (!val) return "Residential address is required";
        if (val.length < 10)
          return "Address must be at least 10 characters long";
        if (!/[a-zA-Z]/.test(val))
          return "Address must contain valid street, building or flat details";
        return "";

      case "password":
        if (!value) return "Security password is required";
        if (value.length < 8) return "Password must be at least 8 characters long";
        if (!/[A-Z]/.test(value) || !/[a-z]/.test(value))
          return "Include both uppercase & lowercase letters";
        if (!/\d/.test(value)) return "Include at least one numerical digit (0-9)";
        if (!/[^A-Za-z0-9]/.test(value))
          return "Include at least one special character (!@#$%^&*)";
        return "";

      default:
        return "";
    }
  };

  // Derive errors object for all fields
  const errors = useMemo(() => {
    const errMap = {};
    Object.keys(form).forEach((field) => {
      errMap[field] = validateField(field, form[field]);
    });
    return errMap;
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
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

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(form).forEach((k) => {
      allTouched[k] = true;
    });
    setTouched(allTouched);

    // Check for validation errors
    const errorKeys = Object.keys(errors).filter((k) => Boolean(errors[k]));
    if (errorKeys.length > 0) {
      const firstError = errors[errorKeys[0]];
      toast.error(firstError || "Please correct the highlighted form errors ⚠️");
      const el = document.getElementsByName(errorKeys[0])[0];
      if (el) el.focus();
      return;
    }

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
      <div className="auth-form-container" style={{ width: "100%", maxWidth: "560px" }}>
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
            Open Free Demat Account
          </h2>
          <p className="text-muted small mb-0">
            Start paper trading with ₹1,00,000 virtual balance in &lt;3 mins
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
        <form onSubmit={handleSignup} noValidate>
          <div className="form-grid">
            {/* Full Name */}
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label className="fw-semibold small mb-1" style={{ color: "var(--ink-secondary)" }}>
                Full Name <span className="text-danger">*</span>
              </label>
              <div
                className={`auth-input-group ${
                  touched.name && errors.name
                    ? "has-error"
                    : touched.name && !errors.name
                    ? "has-success"
                    : ""
                }`}
              >
                <span className="auth-input-icon">
                  <i className="fas fa-user"></i>
                </span>
                <input
                  name="name"
                  type="text"
                  placeholder="e.g. Shubham Kumar"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="auth-input-field"
                  required
                />
              </div>
              {touched.name && errors.name && (
                <div className="auth-field-error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            {/* Email Address */}
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label className="fw-semibold small mb-1" style={{ color: "var(--ink-secondary)" }}>
                Email Address <span className="text-danger">*</span>
              </label>
              <div
                className={`auth-input-group ${
                  touched.email && errors.email
                    ? "has-error"
                    : touched.email && !errors.email
                    ? "has-success"
                    : ""
                }`}
              >
                <span className="auth-input-icon">
                  <i className="fas fa-envelope"></i>
                </span>
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="auth-input-field"
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

            {/* Phone */}
            <div className="field">
              <label className="fw-semibold small mb-1" style={{ color: "var(--ink-secondary)" }}>
                Mobile Number <span className="text-danger">*</span>
              </label>
              <div
                className={`auth-input-group ${
                  touched.phone && errors.phone
                    ? "has-error"
                    : touched.phone && !errors.phone
                    ? "has-success"
                    : ""
                }`}
              >
                <span className="auth-input-icon">
                  <i className="fas fa-phone"></i>
                </span>
                <input
                  name="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="auth-input-field"
                  maxLength={10}
                  required
                />
              </div>
              {touched.phone && errors.phone && (
                <div className="auth-field-error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{errors.phone}</span>
                </div>
              )}
            </div>

            {/* Date of Birth */}
            <div className="field">
              <label className="fw-semibold small mb-1" style={{ color: "var(--ink-secondary)" }}>
                Date of Birth (18+) <span className="text-danger">*</span>
              </label>
              <div
                className={`auth-input-group ${
                  touched.dob && errors.dob
                    ? "has-error"
                    : touched.dob && !errors.dob
                    ? "has-success"
                    : ""
                }`}
              >
                <span className="auth-input-icon">
                  <i className="fas fa-calendar"></i>
                </span>
                <input
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="auth-input-field"
                  required
                />
              </div>
              {touched.dob && errors.dob && (
                <div className="auth-field-error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{errors.dob}</span>
                </div>
              )}
            </div>

            {/* State (Dropdown) */}
            <div className="field">
              <label className="fw-semibold small mb-1" style={{ color: "var(--ink-secondary)" }}>
                State / UT <span className="text-danger">*</span>
              </label>
              <div
                className={`auth-input-group ${
                  touched.state && errors.state
                    ? "has-error"
                    : touched.state && !errors.state
                    ? "has-success"
                    : ""
                }`}
              >
                <span className="auth-input-icon">
                  <i className="fas fa-map-location-dot"></i>
                </span>
                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="auth-select-field"
                  required
                >
                  <option value="">-- Select State --</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
              {touched.state && errors.state && (
                <div className="auth-field-error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{errors.state}</span>
                </div>
              )}
            </div>

            {/* City (Validated Alphabetic) */}
            <div className="field">
              <label className="fw-semibold small mb-1" style={{ color: "var(--ink-secondary)" }}>
                City <span className="text-danger">*</span>
              </label>
              <div
                className={`auth-input-group ${
                  touched.city && errors.city
                    ? "has-error"
                    : touched.city && !errors.city
                    ? "has-success"
                    : ""
                }`}
              >
                <span className="auth-input-icon">
                  <i className="fas fa-city"></i>
                </span>
                <input
                  name="city"
                  type="text"
                  placeholder="e.g. Mumbai, Bengaluru"
                  value={form.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="auth-input-field"
                  required
                />
              </div>
              {touched.city && errors.city && (
                <div className="auth-field-error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{errors.city}</span>
                </div>
              )}
            </div>

            {/* Address */}
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label className="fw-semibold small mb-1" style={{ color: "var(--ink-secondary)" }}>
                Residential Address <span className="text-danger">*</span>
              </label>
              <div
                className={`auth-input-group ${
                  touched.address && errors.address
                    ? "has-error"
                    : touched.address && !errors.address
                    ? "has-success"
                    : ""
                }`}
              >
                <span className="auth-input-icon">
                  <i className="fas fa-home"></i>
                </span>
                <input
                  name="address"
                  type="text"
                  placeholder="Flat / House No., Building Name, Street / Area"
                  value={form.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="auth-input-field"
                  required
                />
              </div>
              {touched.address && errors.address && (
                <div className="auth-field-error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{errors.address}</span>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label className="fw-semibold small mb-1" style={{ color: "var(--ink-secondary)" }}>
                Security Password <span className="text-danger">*</span>
              </label>
              <div
                className={`auth-input-group ${
                  touched.password && errors.password
                    ? "has-error"
                    : touched.password && !errors.password
                    ? "has-success"
                    : ""
                }`}
              >
                <span className="auth-input-icon">
                  <i className="fas fa-shield-alt"></i>
                </span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password (min 8 chars)"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
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
              {touched.password && errors.password && (
                <div className="auth-field-error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{errors.password}</span>
                </div>
              )}

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
