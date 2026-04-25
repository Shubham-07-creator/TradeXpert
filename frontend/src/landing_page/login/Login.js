import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate();

  const API =
    process.env.REACT_APP_API_URL ||
    "http://localhost:3002";

  const DASHBOARD =
    process.env.REACT_APP_DASHBOARD_URL ||
    "http://localhost:3001";

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

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.dispatchEvent(new Event("userChanged"));

      toast.success("Welcome back 🚀");

      // ✅ redirect to dashboard
      window.location.href = DASHBOARD;

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#f6f8fb", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "400px", background: "#fff", padding: "35px", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
        <h2 style={{ textAlign: "center", marginBottom: "25px" }}>
          Login to Your Account
        </h2>

        <input type="email" placeholder="Email" className="form-control my-3" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" className="form-control my-3" onChange={(e) => setPassword(e.target.value)} />

        <button onClick={handleLogin} disabled={loading} style={{ width: "100%", background: "#387ed1", color: "#fff", padding: "10px", borderRadius: "6px", border: "none", fontWeight: "600" }}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ textAlign: "center", marginTop: "15px", color: "#777" }}>
          New here? <span style={{ color: "#387ed1", cursor: "pointer" }} onClick={() => navigate("/signup")}>Create account</span>
        </p>
      </div>
    </div>
  );
}

export default Login;