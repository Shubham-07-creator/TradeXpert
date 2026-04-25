// ==========================================
// frontend/src/Profile.js
// FULL UPDATED COPY-PASTE READY
// deploy safe + api safe
// ==========================================

import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

function Profile() {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const [editMode, setEditMode] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user"));

      setUser(updatedUser);
    };

    window.addEventListener("storage", loadUser);

    window.addEventListener("userChanged", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);

      window.removeEventListener("userChanged", loadUser);
    };
  }, []);

  if (!user) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "100px",
        }}
      >
        <h2>Access Your Profile</h2>

        <p
          style={{
            color: "#666",
          }}
        >
          Please sign in to view your profile.
        </p>

        <button
          onClick={() => (window.location.href = "/login")}
          className="btn btn-primary"
        >
          Login Now
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const res = await axios.put(`${API}/updateProfile`, {
        id: user._id,
        phone: user.phone,
        dob: user.dob,
        city: user.city,
        state: user.state,
        address: user.address,
      });

      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.dispatchEvent(new Event("userChanged"));

      setUser(res.data.user);

      toast.success("Profile updated 🚀");

      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#f5f7fa",
        padding: "40px",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              background: "#387ed1",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3>{user.name}</h3>
            <p
              style={{
                color: "#777",
              }}
            >
              {user.email}
            </p>
          </div>
        </div>

        <hr />

        <div
          style={{
            display: "grid",
            gap: "15px",
          }}
        >
          {["phone", "dob", "city", "state", "address"].map((field) => (
            <div key={field}>
              <label
                style={{
                  fontSize: "13px",
                  color: "#888",
                }}
              >
                {field.toUpperCase()}
              </label>

              {editMode ? (
                <input
                  name={field}
                  value={user[field] || ""}
                  onChange={handleChange}
                  className="form-control"
                />
              ) : (
                <p>{user[field]}</p>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "25px",
            textAlign: "center",
          }}
        >
          {editMode ? (
            <>
              <button
                className="btn btn-success me-2"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
 