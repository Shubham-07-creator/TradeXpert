import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { getAuthHeader, API } from "../utils/auth";
import AdminWalletModal from "./AdminWalletModal";
import ConfirmModal from "./ConfirmModal";
import "./AdminPanel.css";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  // Active tab: "users" | "market" | "broadcast" | "liquidity"
  const [activeTab, setActiveTab] = useState("users");

  // Filters for user management
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal states
  const [walletModalUser, setWalletModalUser] = useState(null);
  const [walletActionLoading, setWalletActionLoading] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    icon: "⚠️",
    confirmText: "Confirm",
    isDanger: false,
    onConfirm: () => {},
  });

  // Market Controls state
  const [shockPercent, setShockPercent] = useState(2.5);
  const [marketActionLoading, setMarketActionLoading] = useState(false);

  // Broadcast state
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastLevel, setBroadcastLevel] = useState("warning");
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/users`, { headers: getAuthHeader() }),
        axios.get(`${API}/admin/stats`, { headers: getAuthHeader() }),
      ]);

      setUsers(usersRes.data || []);
      setStats(statsRes.data || null);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin console data ❌");
    } finally {
      setLoading(false);
    }
  };

  // 1. Wallet Adjustment Handler
  const handleWalletSubmit = async ({ userId, amount, type, reason }) => {
    try {
      setWalletActionLoading(true);
      const res = await axios.post(
        `${API}/admin/users/${userId}/wallet`,
        { amount, type, reason },
        { headers: getAuthHeader() }
      );
      showToast(res.data.message || "Wallet updated successfully! 💰");
      setWalletModalUser(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to adjust wallet ❌", "error");
    } finally {
      setWalletActionLoading(false);
    }
  };

  // 2. Toggle User Status (Suspend / Reactivate)
  const toggleUserStatus = (user) => {
    const willBlock = !user.isBlocked;
    setConfirmDialog({
      isOpen: true,
      title: willBlock ? `Suspend ${user.name}?` : `Reactivate ${user.name}?`,
      message: willBlock
        ? `Suspending will immediately block ${user.name} (${user.email}) from logging in and executing trades.`
        : `This will restore normal trading privileges for ${user.name}.`,
      icon: willBlock ? "🚫" : "✅",
      confirmText: willBlock ? "Suspend Trader" : "Reactivate Account",
      isDanger: willBlock,
      onConfirm: async () => {
        try {
          const res = await axios.put(
            `${API}/admin/users/${user.id}/status`,
            { isBlocked: willBlock },
            { headers: getAuthHeader() }
          );
          showToast(res.data.message || "Account status updated");
          fetchData();
        } catch (err) {
          showToast(err.response?.data?.message || "Failed to update user status ❌", "error");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // 3. Toggle Role (Promote to Admin / Demote to User)
  const toggleUserRole = (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    setConfirmDialog({
      isOpen: true,
      title: `Change role for ${user.name}?`,
      message: `Set ${user.name}'s role to ${newRole.toUpperCase()}? ${
        newRole === "admin"
          ? "This will grant complete administrative access across the platform."
          : "Administrative privileges will be revoked."
      }`,
      icon: "👑",
      confirmText: `Set to ${newRole.toUpperCase()}`,
      isDanger: newRole === "user",
      onConfirm: async () => {
        try {
          const res = await axios.put(
            `${API}/admin/users/${user.id}/role`,
            { role: newRole },
            { headers: getAuthHeader() }
          );
          showToast(res.data.message || "Role updated successfully");
          fetchData();
        } catch (err) {
          showToast(err.response?.data?.message || "Failed to update role ❌", "error");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // 4. Reset User Portfolio
  const handleResetPortfolio = (user) => {
    setConfirmDialog({
      isOpen: true,
      title: `Reset Portfolio for ${user.name}?`,
      message: `This will erase all ${user.holdingsCount} stock positions, cancel all open limit orders, and reset virtual wallet cash back to ₹1,00,000. This action is irreversible.`,
      icon: "🔄",
      confirmText: "Reset to Default ₹1,00,000",
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await axios.post(
            `${API}/admin/users/${user.id}/reset-portfolio`,
            {},
            { headers: getAuthHeader() }
          );
          showToast(res.data.message || "Portfolio reset completed! 🔄");
          fetchData();
        } catch (err) {
          showToast(err.response?.data?.message || "Failed to reset portfolio ❌", "error");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // 5. Toggle Market Circuit Breaker
  const handleToggleCircuitBreaker = async () => {
    const isCurrentlyHalted = stats?.isMarketHalted;
    try {
      setMarketActionLoading(true);
      const res = await axios.post(
        `${API}/admin/market/circuit-breaker`,
        { halted: !isCurrentlyHalted },
        { headers: getAuthHeader() }
      );
      showToast(res.data.message);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to toggle circuit breaker ❌", "error");
    } finally {
      setMarketActionLoading(false);
    }
  };

  // 6. Market Shock Simulation
  const handleMarketShock = async (direction) => {
    try {
      setMarketActionLoading(true);
      const res = await axios.post(
        `${API}/admin/market/shock`,
        { direction, percent: parseFloat(shockPercent) || 2.5 },
        { headers: getAuthHeader() }
      );
      showToast(res.data.message);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to apply market simulation ❌", "error");
    } finally {
      setMarketActionLoading(false);
    }
  };

  // 7. Send Broadcast Announcement
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      showToast("Please enter announcement message", "error");
      return;
    }
    try {
      setBroadcastLoading(true);
      const res = await axios.post(
        `${API}/admin/broadcast`,
        { message: broadcastMessage.trim(), level: broadcastLevel },
        { headers: getAuthHeader() }
      );
      showToast(res.data.message);
      setBroadcastMessage("");
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send broadcast ❌", "error");
    } finally {
      setBroadcastLoading(false);
    }
  };

  // 8. Clear Broadcast Announcement
  const handleClearBroadcast = async () => {
    try {
      setBroadcastLoading(true);
      const res = await axios.delete(`${API}/admin/broadcast`, {
        headers: getAuthHeader(),
      });
      showToast(res.data.message);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to clear broadcast ❌", "error");
    } finally {
      setBroadcastLoading(false);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRole =
        roleFilter === "ALL" || (roleFilter === "admin" ? u.role === "admin" : u.role !== "admin");

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "active" ? !u.isBlocked : Boolean(u.isBlocked));

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  if (loading && !stats) {
    return (
      <div className="fade-up">
        <div className="section-header">
          <h2 className="page-title">Admin Command Center 🛡️</h2>
          <p className="page-subtitle">Connecting to broker admin console...</p>
        </div>
        <div className="empty-state" style={{ padding: "60px 20px" }}>
          <div className="empty-state-icon" style={{ animation: "pulseCritical 1.5s infinite" }}>⏳</div>
          <h4 className="empty-state-title">Loading Admin Console</h4>
          <p className="empty-state-text">Fetching platform statistics, liquidity, and registered traders...</p>
        </div>
      </div>
    );
  }

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

  const isHalted = stats?.isMarketHalted;
  const activeAnnouncement = stats?.activeAnnouncement;

  return (
    <div className="admin-command-center fade-up">
      {/* Toast Notification */}
      {toast && (
        <div className={`admin-floating-toast ${toast.type === "error" ? "error" : "success"}`}>
          <span>{toast.type === "error" ? "⚠️" : "✅"}</span>
          <span>{toast.message}</span>
          <button className="toast-dismiss" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="admin-header-card">
        <div className="admin-header-main">
          <div className="admin-title-badge-row">
            <h2 className="admin-page-title">Admin Command Center</h2>
            <span className="admin-shield-badge">SUPERUSER 🛡️</span>
            {isHalted && (
              <span className="admin-halt-badge">🛑 CIRCUIT BREAKER ACTIVE</span>
            )}
            {activeAnnouncement && (
              <span className="admin-broadcast-active-badge">📢 BROADCAST LIVE</span>
            )}
          </div>
          <p className="admin-page-subtitle">
            Comprehensive broker governance: manage trader balances, enforce compliance, inject simulated market volatility, and broadcast real-time announcements.
          </p>
        </div>

        <button className="admin-refresh-btn" onClick={fetchData} title="Refresh Live Admin Data">
          🔄 Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs-nav">
        <button
          className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <span className="tab-icon">👥</span>
          <span>Trader Operations</span>
          <span className="tab-counter-pill">{users.length}</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === "market" ? "active" : ""}`}
          onClick={() => setActiveTab("market")}
        >
          <span className="tab-icon">⚡</span>
          <span>Market Simulator & Circuit Breaker</span>
          {isHalted && <span className="tab-pulse-dot" />}
        </button>

        <button
          className={`admin-tab-btn ${activeTab === "broadcast" ? "active" : ""}`}
          onClick={() => setActiveTab("broadcast")}
        >
          <span className="tab-icon">📢</span>
          <span>Global Broadcaster</span>
          {activeAnnouncement && <span className="tab-counter-pill pulse">1</span>}
        </button>

        <button
          className={`admin-tab-btn ${activeTab === "liquidity" ? "active" : ""}`}
          onClick={() => setActiveTab("liquidity")}
        >
          <span className="tab-icon">📊</span>
          <span>Platform Financials</span>
        </button>
      </div>

      {/* TAB 1: TRADER OPERATIONS */}
      {activeTab === "users" && (
        <div className="admin-tab-content">
          {/* Controls Bar: Search & Filter */}
          <div className="trader-controls-bar">
            <div className="trader-search-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search traders by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="trader-search-input"
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                  ✕
                </button>
              )}
            </div>

            <div className="filter-group">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="admin-select"
              >
                <option value="ALL">All Roles</option>
                <option value="user">Traders (User)</option>
                <option value="admin">Administrators</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-select"
              >
                <option value="ALL">All Status</option>
                <option value="active">Active Traders</option>
                <option value="suspended">Suspended Accounts</option>
              </select>
            </div>
          </div>

          {/* Traders Table */}
          <div className="table-card">
            <div className="table-responsive">
              <table className="order-table admin-traders-table">
                <thead>
                  <tr>
                    <th>Trader</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Virtual Cash</th>
                    <th>Invested Capital</th>
                    <th>Holdings Value</th>
                    <th style={{ textAlign: "right" }}>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "36px" }}>
                        <div className="empty-state-icon">🔍</div>
                        <div style={{ fontWeight: "700", marginTop: "8px" }}>No matching traders found</div>
                        <div style={{ color: "var(--color-text-faint)", fontSize: "0.85rem" }}>
                          Try adjusting your search query or filters.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      return (
                        <tr key={u.id} className={u.isBlocked ? "row-suspended" : ""}>
                          <td>
                            <div className="trader-profile-cell">
                              <div
                                className={`user-avatar-circle ${
                                  u.role === "admin" ? "admin-avatar" : ""
                                }`}
                                style={{ width: "32px", height: "32px", fontSize: "0.8rem" }}
                              >
                                {u.name ? u.name.substring(0, 2).toUpperCase() : "TR"}
                              </div>
                              <div>
                                <div className="trader-name-row">
                                  <span className="trader-name">{u.name}</span>
                                  {u.role === "admin" && (
                                    <span className="admin-crown-badge">ADMIN</span>
                                  )}
                                </div>
                                <span className="trader-positions-pill">
                                  {u.holdingsCount} stock positions
                                </span>
                              </div>
                            </div>
                          </td>

                          <td style={{ color: "var(--color-text-muted)" }}>{u.email}</td>

                          <td>
                            <button
                              type="button"
                              className={`role-chip ${u.role === "admin" ? "role-admin" : "role-user"}`}
                              onClick={() => toggleUserRole(u)}
                              title="Click to toggle Role"
                            >
                              {u.role === "admin" ? "👑 Admin" : "Trader"}
                            </button>
                          </td>

                          <td>
                            <button
                              type="button"
                              className={`status-chip ${u.isBlocked ? "status-blocked" : "status-active"}`}
                              onClick={() => toggleUserStatus(u)}
                              title={u.isBlocked ? "Click to Reactivate" : "Click to Suspend"}
                            >
                              {u.isBlocked ? "🚫 Suspended" : "🟢 Active"}
                            </button>
                          </td>

                          <td style={{ fontWeight: "800", color: "var(--color-primary)" }}>
                            ₹{u.wallet.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </td>

                          <td>
                            ₹{u.investment.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </td>

                          <td style={{ fontWeight: "700" }}>
                            ₹{u.holdingsValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </td>

                          <td style={{ textAlign: "right" }}>
                            <div className="admin-action-btn-row">
                              <button
                                type="button"
                                className="action-btn-chip adjust-wallet"
                                onClick={() => setWalletModalUser(u)}
                                title="Add or Deduct Virtual Capital"
                              >
                                💰 Funds
                              </button>

                              <button
                                type="button"
                                className="action-btn-chip reset-portfolio"
                                onClick={() => handleResetPortfolio(u)}
                                title="Reset Portfolio & Wipe Holdings to ₹1,00,000"
                              >
                                🔄 Reset
                              </button>

                              <button
                                type="button"
                                className={`action-btn-chip ${u.isBlocked ? "unblock-btn" : "block-btn"}`}
                                onClick={() => toggleUserStatus(u)}
                                title={u.isBlocked ? "Reactivate Trader" : "Suspend Trader"}
                              >
                                {u.isBlocked ? "🟢 Enable" : "🚫 Block"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE MARKET SIMULATOR & CIRCUIT BREAKER */}
      {activeTab === "market" && (
        <div className="admin-tab-content">
          <div className="market-controls-grid">
            {/* Circuit Breaker Card */}
            <div className="control-card circuit-breaker-card">
              <div className="control-card-header">
                <div className="control-card-icon">{isHalted ? "🛑" : "🟢"}</div>
                <div>
                  <h3 className="control-card-title">Live Market Circuit Breaker</h3>
                  <p className="control-card-desc">
                    Globally halts or resumes live price ticking across all connected traders and freezes limit execution engines.
                  </p>
                </div>
              </div>

              <div className="control-state-banner">
                <span className="state-label">Market Engine Status:</span>
                <span className={`state-status-pill ${isHalted ? "halted" : "ticking"}`}>
                  {isHalted ? "🛑 HALTED (TRADING FROZEN)" : "🟢 RUNNING (REAL-TIME TICKS)"}
                </span>
              </div>

              <div className="control-card-footer">
                <button
                  type="button"
                  className={`btn-circuit-breaker ${isHalted ? "resume" : "halt"}`}
                  onClick={handleToggleCircuitBreaker}
                  disabled={marketActionLoading}
                >
                  {marketActionLoading
                    ? "Updating Engine..."
                    : isHalted
                    ? "🟢 Lift Circuit Breaker (Resume Trading)"
                    : "🛑 Trip Circuit Breaker (Freeze All Trading)"}
                </button>
              </div>
            </div>

            {/* Macro Shock Simulator Card */}
            <div className="control-card shock-simulator-card">
              <div className="control-card-header">
                <div className="control-card-icon">⚡</div>
                <div>
                  <h3 className="control-card-title">Macro Market Volatility Injector</h3>
                  <p className="control-card-desc">
                    Simulate real-world market movements to test user portfolios, stop-loss triggers, and margin calls.
                  </p>
                </div>
              </div>

              <div className="shock-intensity-selector">
                <label className="admin-form-label">Shock Intensity: {shockPercent}%</label>
                <div className="preset-intensity-chips">
                  {[1.0, 2.5, 5.0, 10.0].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      className={`preset-chip-btn ${shockPercent === pct ? "active" : ""}`}
                      onClick={() => setShockPercent(pct)}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="shock-action-buttons">
                <button
                  type="button"
                  className="btn-shock-bull"
                  onClick={() => handleMarketShock("BULL")}
                  disabled={marketActionLoading}
                >
                  🚀 Inject Bull Surge (+{shockPercent}%)
                </button>

                <button
                  type="button"
                  className="btn-shock-bear"
                  onClick={() => handleMarketShock("BEAR")}
                  disabled={marketActionLoading}
                >
                  📉 Trigger Market Flash Drop (-{shockPercent}%)
                </button>

                <button
                  type="button"
                  className="btn-shock-reset"
                  onClick={() => handleMarketShock("RESET")}
                  disabled={marketActionLoading}
                >
                  🔄 Reset Prices to Base Seed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GLOBAL BROADCASTER */}
      {activeTab === "broadcast" && (
        <div className="admin-tab-content">
          <div className="broadcast-composer-grid">
            {/* Broadcast Form */}
            <div className="control-card">
              <div className="control-card-header">
                <div className="control-card-icon">📢</div>
                <div>
                  <h3 className="control-card-title">Send Live Global Announcement</h3>
                  <p className="control-card-desc">
                    Broadcast an alert banner across all connected web clients instantly via Socket.io.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendBroadcast} className="broadcast-form">
                <div className="admin-form-group">
                  <label className="admin-form-label">Announcement Severity Level</label>
                  <div className="severity-toggle-group">
                    <button
                      type="button"
                      className={`severity-btn info ${broadcastLevel === "info" ? "active" : ""}`}
                      onClick={() => setBroadcastLevel("info")}
                    >
                      ℹ️ Informational (Blue)
                    </button>
                    <button
                      type="button"
                      className={`severity-btn warning ${broadcastLevel === "warning" ? "active" : ""}`}
                      onClick={() => setBroadcastLevel("warning")}
                    >
                      ⚠️ Market Warning (Amber)
                    </button>
                    <button
                      type="button"
                      className={`severity-btn critical ${broadcastLevel === "critical" ? "active" : ""}`}
                      onClick={() => setBroadcastLevel("critical")}
                    >
                      🚨 Critical Alert (Red)
                    </button>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Message Content</label>
                  <textarea
                    rows="3"
                    className="admin-textarea"
                    placeholder="e.g. Scheduled platform maintenance tonight from 11:00 PM to 11:30 PM IST. Trading will be temporarily halted."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                  />
                </div>

                {/* Live Preview */}
                <div className="broadcast-live-preview-box">
                  <div className="preview-label">Live Preview (How users will see it):</div>
                  <div className={`system-broadcast-bar broadcast-${broadcastLevel}`}>
                    <div className="broadcast-content">
                      <span className="broadcast-icon">
                        {broadcastLevel === "critical" ? "🚨" : broadcastLevel === "info" ? "ℹ️" : "📢"}
                      </span>
                      <span className="broadcast-tag">SYSTEM NOTICE</span>
                      <span className="broadcast-message">
                        {broadcastMessage || "Enter a message to preview live banner..."}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="broadcast-form-actions">
                  <button
                    type="submit"
                    className="btn-broadcast-submit"
                    disabled={broadcastLoading || !broadcastMessage.trim()}
                  >
                    {broadcastLoading ? "Broadcasting..." : "📢 Push Broadcast to All Traders"}
                  </button>
                </div>
              </form>
            </div>

            {/* Current Active Announcement Card */}
            <div className="control-card active-broadcast-monitor">
              <h3 className="control-card-title">Currently Active Broadcast</h3>
              <p className="control-card-desc">
                Status of the banner currently displaying to all connected traders.
              </p>

              {activeAnnouncement ? (
                <div className="active-broadcast-status-card">
                  <div className="active-status-header">
                    <span className={`status-chip status-${activeAnnouncement.level || "warning"}`}>
                      {activeAnnouncement.level?.toUpperCase()}
                    </span>
                    <span className="active-time">
                      {activeAnnouncement.timestamp
                        ? new Date(activeAnnouncement.timestamp).toLocaleTimeString()
                        : "Active"}
                    </span>
                  </div>
                  <p className="active-message-text">{activeAnnouncement.message}</p>
                  <button
                    type="button"
                    className="btn-clear-broadcast"
                    onClick={handleClearBroadcast}
                    disabled={broadcastLoading}
                  >
                    🗑️ Clear Active Broadcast Banner
                  </button>
                </div>
              ) : (
                <div className="no-active-broadcast">
                  <div className="empty-state-icon">💤</div>
                  <div style={{ fontWeight: "700", marginTop: "6px" }}>No Broadcast Banner Active</div>
                  <div style={{ color: "var(--color-text-faint)", fontSize: "0.82rem" }}>
                    Traders are currently experiencing uninterrupted trading.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PLATFORM FINANCIALS & METRICS */}
      {activeTab === "liquidity" && stats && (
        <div className="admin-tab-content">
          <div className="stats-card-grid platform-metrics-grid">
            <div className="stat-card">
              <div className="stat-card-label">Registered Traders</div>
              <div className="stat-card-value" style={{ color: "var(--color-primary)" }}>
                {stats.totalUsers}
              </div>
              <div className="stat-card-sub">{stats.totalAdmins} Administrator accounts</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-label">Total Transactions Logged</div>
              <div className="stat-card-value">{stats.totalOrders}</div>
              <div className="stat-card-sub">Executed orders recorded</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-label">Total Liquid Cash Available</div>
              <div className="stat-card-value" style={{ color: "var(--color-primary)" }}>
                ₹{stats.totalWallet.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </div>
              <div className="stat-card-sub">Uninvested virtual balances</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-label">Total Active Portfolio Holdings</div>
              <div className="stat-card-value" style={{ color: "var(--color-profit)" }}>
                ₹{stats.totalHoldingsValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </div>
              <div className="stat-card-sub">Current market value in positions</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-label">Gross Platform Valuation</div>
              <div className="stat-card-value" style={{ color: "var(--color-profit)" }}>
                ₹{(stats.totalWallet + stats.totalHoldingsValue).toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="stat-card-sub">Liquid cash + active holdings</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-label">Simulation Engine State</div>
              <div
                className="stat-card-value"
                style={{ color: isHalted ? "var(--color-loss)" : "var(--color-profit)", fontSize: "1.4rem" }}
              >
                {isHalted ? "HALTED" : "HEALTHY"}
              </div>
              <div className="stat-card-sub">
                {isHalted ? "Circuit breaker active" : "Socket ticker broadcasting normally"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Wallet Adjustment Modal */}
      <AdminWalletModal
        isOpen={Boolean(walletModalUser)}
        user={walletModalUser}
        onClose={() => setWalletModalUser(null)}
        onSubmit={handleWalletSubmit}
        loading={walletActionLoading}
      />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        icon={confirmDialog.icon}
        confirmText={confirmDialog.confirmText}
        isDanger={confirmDialog.isDanger}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default AdminPanel;