import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeader } from "../utils/auth";

const AdminPanel = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/users`, { headers: getAuthHeader() }),
        axios.get(`${API}/admin/stats`, { headers: getAuthHeader() }),
      ]);

      setUsers(usersRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data ❌");
    }
  };

  if (error) {
    return (
      <div className="fade-up">
        <div className="section-header">
          <h2 className="page-title">Admin Management</h2>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <h4 className="empty-state-title">Access Restricted</h4>
          <p className="empty-state-text">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="page-title">Admin Console 🛡️</h2>
          <p className="page-subtitle">
            System overview, registered trader accounts, and platform liquidity.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="stats-card-grid">
          <div className="stat-card">
            <div className="stat-card-label">Registered Traders</div>
            <div className="stat-card-value" style={{ color: "var(--color-primary)" }}>
              {stats.totalUsers}
            </div>
            <div className="stat-card-sub">Active community members</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-label">Total Orders Executed</div>
            <div className="stat-card-value">
              {stats.totalOrders}
            </div>
            <div className="stat-card-sub">Transactions logged</div>
          </div>

          <div className="stat-card">
            <div className="stat-card-label">Total Platform Capital</div>
            <div className="stat-card-value" style={{ color: "var(--color-profit)" }}>
              ₹{stats.totalWallet.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <div className="stat-card-sub">Cumulative virtual wallets</div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="order-table">
            <thead>
              <tr>
                <th>Trader</th>
                <th>Email</th>
                <th>Wallet Balance</th>
                <th>Invested Amount</th>
                <th>Holdings Value</th>
                <th>Positions Count</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div className="user-avatar-circle" style={{ width: "28px", height: "28px", fontSize: "0.75rem" }}>
                        {u.name ? u.name.substring(0, 2).toUpperCase() : "U"}
                      </div>
                      <span style={{ fontWeight: "700", color: "var(--color-text-strong)" }}>
                        {u.name}
                      </span>
                    </div>
                  </td>

                  <td style={{ color: "var(--color-text-muted)" }}>{u.email}</td>

                  <td style={{ fontWeight: "700", color: "var(--color-primary)" }}>
                    ₹{u.wallet.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </td>

                  <td>₹{u.investment.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                  <td style={{ fontWeight: "600" }}>₹{u.holdingsValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>

                  <td>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "var(--radius-pill)",
                        background: "var(--color-bg-subtle)",
                        fontWeight: "700",
                        fontSize: "0.8rem",
                      }}
                    >
                      {u.holdingsCount} stocks
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;