import React, { useState } from "react";
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

  const handleSignup = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);

      await axios.post(`${API}/signup`, form);

      toast.success("Account created successfully 🚀");

      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="auth-form-container fade-up" style={{ width: "100%", maxWidth: "550px" }}>
        <div className="text-center mb-4">
          <img src="/media/images/logo2.svg" alt="TradeXpert" style={{ width: "50px" }} className="mb-2" />
          <h2 className="fw-bold" style={{ color: "var(--primary-darker)" }}>
            Create Account
          </h2>
          <p className="text-muted">Join millions of traders on TradeXpert</p>
        </div>

        {/* Google One-Click Sign Up */}
        <GoogleAuthButton isSignup={true} />

        <form onSubmit={handleSignup}>
          <div className="form-grid">
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label className="fw-semibold text-muted mb-1" style={{ fontSize: "14px" }}>Full Name</label>
              <input name="name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange} className="form-control shadow-none" required />
            </div>

            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label className="fw-semibold text-muted mb-1" style={{ fontSize: "14px" }}>Email Address</label>
              <input name="email" type="email" placeholder="john@example.com" value={form.email} onChange={handleChange} className="form-control shadow-none" required />
            </div>

            <div className="field">
              <label className="fw-semibold text-muted mb-1" style={{ fontSize: "14px" }}>Phone</label>
              <input name="phone" type="tel" placeholder="+91 9876543210" value={form.phone} onChange={handleChange} className="form-control shadow-none" required />
            </div>
            <div className="field">
              <label className="fw-semibold text-muted mb-1" style={{ fontSize: "14px" }}>Date of Birth</label>
              <input name="dob" type="date" value={form.dob} onChange={handleChange} className="form-control shadow-none" required />
            </div>

            <div className="field">
              <label className="fw-semibold text-muted mb-1" style={{ fontSize: "14px" }}>City</label>
              <input name="city" type="text" placeholder="Mumbai" value={form.city} onChange={handleChange} className="form-control shadow-none" required />
            </div>
            <div className="field">
              <label className="fw-semibold text-muted mb-1" style={{ fontSize: "14px" }}>State</label>
              <input name="state" type="text" placeholder="Maharashtra" value={form.state} onChange={handleChange} className="form-control shadow-none" required />
            </div>

            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label className="fw-semibold text-muted mb-1" style={{ fontSize: "14px" }}>Address</label>
              <input name="address" type="text" placeholder="123 Street Name" value={form.address} onChange={handleChange} className="form-control shadow-none" required />
            </div>

            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label className="fw-semibold text-muted mb-1" style={{ fontSize: "14px" }}>Password</label>
              <div className="input-group">
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Create a strong password" 
                  value={form.password} 
                  onChange={handleChange} 
                  className="form-control border-end-0 shadow-none" 
                  required 
                />
                <span className="input-group-text" onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-muted`}></i>
                </span>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn btn-primary w-100 py-2 fw-bold hover-scale mt-4"
            style={{ background: "linear-gradient(135deg, #387ED1 0%, #00D09C 100%)", border: "none", borderRadius: "8px" }}
          >
            {loading ? <><i className="fas fa-spinner fa-spin me-2"></i> Creating Account...</> : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-4 text-muted">
          Already have an account? <span className="fw-bold hover-color" style={{ color: "var(--primary)", cursor: "pointer" }} onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </AuthShell>
  );
}

export default Signup;
