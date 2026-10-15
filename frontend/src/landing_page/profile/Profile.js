import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL, getStoredUser, goToDashboard } from "../../utils/storage";
import { INDIAN_STATES } from "../../utils/indiaStates";
import "./profile.css";

const FIELDS = [
  { name: "phone", label: "Phone Number", icon: "fa-solid fa-phone" },
  { name: "dob", label: "Date of Birth", icon: "fa-regular fa-calendar" },
  { name: "city", label: "City", icon: "fa-solid fa-city" },
  { name: "state", label: "State", icon: "fa-solid fa-map-location-dot", isSelect: true },
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
          <p>Please sign in to your account to view and manage your profile details.</p>
          <div className="d-flex justify-content-center gap-3 mt-3">
            <Link to="/" className="btn-custom-outline" style={{ textDecoration: "none" }}>
              <i className="fa-solid fa-house me-1"></i> Back to Home
            </Link>
            <Link to="/login" className="btn-custom-primary" style={{ textDecoration: "none" }}>
              Sign In Now
            </Link>
          </div>
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

  const validateProfile = () => {
    // 1. Phone validation
    if (user.phone) {
      const cleanPhone = user.phone.toString().replace(/[\s+-]/g, "");
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        toast.error("Please enter a valid 10-digit Indian mobile number ❌");
        return false;
      }
    }

    // 2. City validation
    if (user.city) {
      const cleanCity = user.city.toString().trim();
      if (!/^[a-zA-Z\s.'-]{2,50}$/.test(cleanCity)) {
        toast.error("City must contain only letters and spaces (no numbers or symbols) ❌");
        return false;
      }
    }

    // 3. State validation
    if (user.state) {
      const cleanState = user.state.toString().trim();
      if (!INDIAN_STATES.includes(cleanState)) {
        toast.error("Please select a valid State from the list ❌");
        return false;
      }
    }

    // 4. Address validation
    if (user.address) {
      const cleanAddr = user.address.toString().trim();
      if (cleanAddr.length < 10) {
        toast.error("Address must be at least 10 characters long ❌");
        return false;
      }
      if (!/[a-zA-Z]/.test(cleanAddr)) {
        toast.error("Address must contain valid street, building or locality details ❌");
        return false;
      }
    }

    // 5. DOB validation
    if (user.dob) {
      const birth = new Date(user.dob);
      const today = new Date();
      const age = (today - birth) / (365.25 * 24 * 60 * 60 * 1000);
      if (isNaN(age) || age < 18) {
        toast.error("Account holder must be at least 18 years old ❌");
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateProfile()) return;

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
                <Link
                  to="/"
                  className="btn-custom-outline"
                  title="Return to TradeXpert Home"
                >
                  <i className="fa-solid fa-house"></i> Home
                </Link>

                <button
                  type="button"
                  className="btn-custom-outline"
                  onClick={() => goToDashboard()}
                  title="Open Pro Trading Terminal"
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

            {/* User Details */}
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
                      f.isSelect ? (
                        <select
                          id={`p-${f.name}`}
                          name={f.name}
                          value={user[f.name] || ""}
                          onChange={handleChange}
                        >
                          <option value="">-- Select State --</option>
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={`p-${f.name}`}
                          name={f.name}
                          type={f.name === "dob" ? "date" : "text"}
                          value={user[f.name] || ""}
                          placeholder={`Enter your ${f.label.toLowerCase()}`}
                          onChange={handleChange}
                        />
                      )
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