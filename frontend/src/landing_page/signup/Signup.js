import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../../auth.css";

function Signup() {
  const navigate = useNavigate();

  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async () => {
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
    <div className="auth-container">
      <div className="auth-box" style={{ maxWidth: "440px" }}>
        <div className="auth-logo">
          <img src="/media/images/logo2.svg" alt="TradeXpert logo" />
          <span>TradeXpert</span>
        </div>

        <h2 className="auth-title">Create Account</h2>

        {Object.keys(form).map((field) => (
          <input
            key={field}
            name={field}
            type={
              field === "password"
                ? "password"
                : field === "dob"
                  ? "date"
                  : "text"
            }
            placeholder={field.toUpperCase()}
            value={form[field]}
            onChange={handleChange}
          />
        ))}

        <button onClick={handleSignup} disabled={loading}>
          {loading ? "Creating..." : "Signup"}
        </button>

        <p className="auth-footer-text">
          Already have an account? <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default Signup;