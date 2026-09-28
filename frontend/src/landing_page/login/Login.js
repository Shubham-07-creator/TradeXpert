import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../../auth.css";

function Login() {
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  const DASHBOARD =
    process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3001";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
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

      // Dashboard runs on a different port/domain (different origin), so
      // its localStorage can't see what we just saved above. Pass the
      // token/user through the URL — the dashboard picks them up and
      // saves them into its own localStorage on load.
      window.location.href = `${DASHBOARD}?token=${encodeURIComponent(
        token,
      )}&user=${encodeURIComponent(userStr)}`;
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">
          <img src="/media/images/logo2.svg" alt="TradeXpert logo" />
          <span>TradeXpert</span>
        </div>

        <h2 className="auth-title">Login to Your Account</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-footer-text">
          New here?{" "}
          <span onClick={() => navigate("/signup")}>Create account</span>
        </p>
      </div>
    </div>
  );
}

export default Login;