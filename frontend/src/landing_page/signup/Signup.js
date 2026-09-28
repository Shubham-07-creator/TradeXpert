import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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
    <div
      style={{
        background: "#f6f8fb",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "420px",
          background: "#fff",
          padding: "35px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "25px",
          }}
        >
          Create Account
        </h2>

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
            className="form-control my-2"
          />
        ))}

        <button
          onClick={handleSignup}
          disabled={loading}
          style={{
            width: "100%",
            background: "#387ed1",
            color: "#fff",
            padding: "10px",
            borderRadius: "6px",
            border: "none",
            fontWeight: "600",
            marginTop: "10px",
          }}
        >
          {loading ? "Creating..." : "Signup"}
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "15px",
            color: "#777",
          }}
        >
          Already have account?{" "}
          <span
            style={{
              color: "#387ed1",
              cursor: "pointer",
            }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Signup;
