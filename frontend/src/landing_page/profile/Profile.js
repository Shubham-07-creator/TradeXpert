import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL, getStoredUser, goToDashboard } from "../../utils/storage";
import "./profile.css";

const FIELDS = [
  { name: "phone", label: "Phone Number", icon: "fa-solid fa-phone" },
  { name: "dob", label: "Date of Birth", icon: "fa-regular fa-calendar" },
  { name: "city", label: "City", icon: "fa-solid fa-city" },
  { name: "state", label: "State", icon: "fa-solid fa-map-location-dot" },
  {
    name: "address",
    label: "Permanent Address",
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
          <h2>Access Your Profile</h2>
          <p>Please log in to your account to view and manage your profile details.</p>
          <Link to="/login" className="btn-custom-primary" style={{ display: "inline-block", textDecoration: "none" }}>
            Log In Now
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

      toast.success("Profile updated successfully 🚀");
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const initial = user.name?.trim()?.charAt(0).toUpperCase() || "U";
  const walletAmount = typeof user.wallet === "number" ? user.wallet : 100000;
  const pnlAmount = typeof user.realizedPnL === "number" ? user.realizedPnL : 0;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card">
          {/* Cover Banner */}
          <div className="profile-cover"></div>

          {/* Profile Header */}
          <div className="profile-head">
            {/* Top row: Avatar on left, Action buttons on right */}
            <div className="profile-avatar-row">
              <div className="profile-avatar">
                {initial}
              </div>

              <div className="profile-head-actions">
                <button
                  type="button"
                  className="btn-custom-outline"
                  onClick={() => goToDashboard()}
                >
                  <i className="fa-solid fa-chart-line"></i> Dashboard
                </button>

                {!editMode && (
                  <button
                    type="button"
                    className="btn-custom-primary"
                    onClick={() => setEditMode(true)}
                  >
                    <i className="fa-regular fa-pen-to-square"></i> Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* User Details (100% on the card surface, zero banner overlap!) */}
            <div className="profile-id">
              <h1>{user.name}</h1>
              <div className="profile-email-badge">
                <p className="profile-email">
                  <i className="fa-regular fa-envelope"></i>
                  {user.email}
                </p>
                <span className="profile-badge">
                  <span className="profile-badge-dot"></span>
                  Active Demat
                </span>
                {user.role === "admin" && (
                  <span className="profile-badge admin">
                    <i className="fa-solid fa-shield-halved"></i> Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="profile-stats-bar">
            <div className="profile-stat-box">
              <span className="profile-stat-label">Virtual Margin</span>
              <span className="profile-stat-value highlight">
                ₹{walletAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="profile-stat-box">
              <span className="profile-stat-label">Realized P&L</span>
              <span
                className="profile-stat-value"
                style={{ color: pnlAmount >= 0 ? "#00A67E" : "#E5484D" }}
              >
                {pnlAmount >= 0 ? "+" : ""}₹{pnlAmount.toFixed(2)}
              </span>
            </div>
            <div className="profile-stat-box">
              <span className="profile-stat-label">Account Tier</span>
              <span className="profile-stat-value">
                {user.role === "admin" ? "Administrator" : "Standard Trader"}
              </span>
            </div>
          </div>

          {/* Details Section */}
          <div className="profile-body">
            <div className="profile-section-title">
              <i className="fa-solid fa-id-card"></i>
              Personal Information
            </div>

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
                        placeholder={`Enter your ${f.label.toLowerCase()}`}
                        onChange={handleChange}
                      />
                    ) : (
                      <p>{user[f.name] || "Not provided"}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Edit Mode Save / Cancel Buttons */}
            {editMode && (
              <div className="profile-actions">
                <button
                  type="button"
                  className="btn-custom-secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn-custom-primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading && <span className="btn-spinner"></span>}
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;