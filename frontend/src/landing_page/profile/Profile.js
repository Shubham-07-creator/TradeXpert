import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./profile.css";

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
      <div className="profile-page">
        <div className="profile-empty-card">
          <h2>Access Your Profile</h2>
          <p>Please sign in to view your profile.</p>
          <button
            className="profile-btn primary"
            onClick={() => (window.location.href = "/login")}
          >
            Login Now
          </button>
        </div>
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

      // Bug fix: this request was missing the auth token entirely, so
      // it always failed against the protected /updateProfile route.
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${API}/updateProfile`,
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
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3>{user.name}</h3>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>

        <hr className="profile-divider" />

        <div className="profile-fields">
          {["phone", "dob", "city", "state", "address"].map((field) => (
            <div className="profile-field" key={field}>
              <label>{field.toUpperCase()}</label>

              {editMode ? (
                <input
                  name={field}
                  value={user[field] || ""}
                  onChange={handleChange}
                />
              ) : (
                <p>{user[field] || "—"}</p>
              )}
            </div>
          ))}
        </div>

        <div className="profile-actions">
          {editMode ? (
            <>
              <button
                className="profile-btn primary"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>

              <button
                className="profile-btn secondary"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className="profile-btn primary"
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