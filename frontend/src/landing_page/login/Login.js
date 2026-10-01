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
        // Dashboard will see no token and redirect to login again
        window.location.href = DASHBOARD;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="auth-form-container fade-up">
        <div className="text-center mb-4">
          <img src="/media/images/logo2.svg" alt="TradeXpert" style={{ width: "50px" }} className="mb-2" />
          <h2 className="fw-bold" style={{ color: "var(--primary-darker)" }}>
            Welcome Back
          </h2>
          <p className="text-muted">Log in to your TradeXpert account</p>
        </div>

        {/* Google One-Click Login */}
        <GoogleAuthButton isSignup={false} />

        <form onSubmit={handleLogin}>
          <div className="field mb-3">
            <label className="fw-semibold text-muted mb-1" style={{ fontSize: "14px" }}>Email Address</label>
            <div className="input-group">
              <span className="input-group-text border-end-0"><i className="fas fa-envelope text-muted"></i></span>
              <input 
                type="email" 
                placeholder="name@example.com" 
                className="form-control border-start-0 ps-0 shadow-none" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required
              />
            </div>
          </div>

          <div className="field mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="fw-semibold text-muted mb-0" style={{ fontSize: "14px" }}>Password</label>
              <Link 
                to="/forgot-password" 
                className="text-decoration-none fw-semibold" 
                style={{ color: "var(--primary)", fontSize: "13px" }}
              >
                Forgot Password?
              </Link>
            </div>
            <div className="input-group">
              <span className="input-group-text border-end-0"><i className="fas fa-lock text-muted"></i></span>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password" 
                className="form-control border-start-0 border-end-0 px-0 shadow-none" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required
              />
              <span className="input-group-text border-start-0" onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-muted`}></i>
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn btn-primary w-100 py-2 fw-bold hover-scale"
            style={{ background: "linear-gradient(135deg, #387ED1 0%, #00D09C 100%)", border: "none", borderRadius: "8px" }}
          >
            {loading ? <><i className="fas fa-spinner fa-spin me-2"></i> Logging in...</> : "Login"}
          </button>
        </form>

        <p className="text-center mt-4 text-muted">
          New here? <span className="fw-bold hover-color" style={{ color: "var(--primary)", cursor: "pointer" }} onClick={() => navigate("/signup")}>Create account</span>
        </p>
      </div>
    </AuthShell>
  );
}

export default Login;