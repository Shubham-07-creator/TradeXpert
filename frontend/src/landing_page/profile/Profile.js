import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL, getStoredUser, goToDashboard } from "../../utils/storage";
import "./profile.css";

const FIELDS = [
  { name: "phone", label: "Phone", icon: "fa-solid fa-phone" },
  { name: "dob", label: "Date of birth", icon: "fa-solid fa-cake-candles" },
  { name: "city", label: "City", icon: "fa-solid fa-city" },
  { name: "state", label: "State", icon: "fa-solid fa-map" },
  {
    name: "address",
    label: "Address",
    icon: "fa-solid fa-location-dot",
    full: true,
  },
];

function Profile() {
  const [user, setUser] = useState(getStoredUser());
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = () => setUser(getStoredUser());

    window.addEventListener("storage", loadUser);
    window.addEventListener("userChanged", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("userChanged", loadUser);
    };
  }, []);

  if (!user) {
    return (
      <div className="profile-page">
        <div className="empty-card">
          <div className="empty-icon">
            <i className="fa-regular fa-user"></i>
          </div>
          <h2>Access your profile</h2>
          <p>Please login to view and edit your profile.</p>
          <Link to="/login" className="btn btn-primary btn-lg">
            Login now
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    setUser(getStoredUser());
    setEditMode(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // the token must be sent — /updateProfile is a protected route
      const res = await axios.put(
        `${API_URL}/updateProfile`,
        {
          phone: user.phone,
          dob: user.dob,
          city: user.city,
          state: user.state,
          address: user.address,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      const updated = { ...user, ...res.data.user };

      localStorage.setItem("user", JSON.stringify(updated));
      window.dispatchEvent(new Event("userChanged"));
      setUser(updated);

      toast.success("Profile updated 🚀");
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-cover"></div>

        <div className="profile-head">
          <div className="profile-avatar">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="profile-id">
            <h1>{user.name}</h1>
            <p>{user.email}</p>
          </div>

          <button
            type="button"
            className="btn btn-outline-primary profile-dash"
            onClick={() => goToDashboard()}
          >
            <i className="fa-solid fa-chart-line"></i> Dashboard
          </button>
        </div>

        <div className="profile-body">
          <div className="info-grid">
            {FIELDS.map((f) => (
              <div
                className={`info-item ${f.full ? "full" : ""} ${
                  editMode ? "editing" : ""
                }`}
                key={f.name}
              >
                <span className="info-icon">
                  <i className={f.icon}></i>
                </span>

                <div className="info-text">
                  <label htmlFor={`p-${f.name}`}>{f.label}</label>

                  {editMode ? (
                    <input
                      id={`p-${f.name}`}
                      name={f.name}
                      type={f.name === "dob" ? "date" : "text"}
                      value={user[f.name] || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{user[f.name] || "—"}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="profile-actions">
            {editMode ? (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading && <span className="btn-spinner"></span>}
                  {loading ? "Saving..." : "Save changes"}
                </button>

                <button
                  type="button"
                  className="btn btn-light"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setEditMode(true)}
              >
                <i className="fa-regular fa-pen-to-square"></i> Edit profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;