import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeader, getCurrentUser } from "../utils/auth";

const Leaderboard = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";
  const [board, setBoard] = useState([]);
  const user = getCurrentUser();

  useEffect(() => {
    fetchBoard();
    const interval = setInterval(fetchBoard, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchBoard = async () => {
    try {
      const res = await axios.get(`${API}/leaderboard`, {
        headers: getAuthHeader(),
      });
      setBoard(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 0) return <span style={{ fontSize: "1.2rem" }}>🥇</span>;
    if (rank === 1) return <span style={{ fontSize: "1.2rem" }}>🥈</span>;
    if (rank === 2) return <span style={{ fontSize: "1.2rem" }}>🥉</span>;
    return (
      <span
        style={{
          fontWeight: "700",
          fontSize: "0.85rem",
          color: "var(--color-text-muted)",
        }}
      >
        #{rank + 1}
      </span>
    );
  };

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="page-title">Trader Leaderboard 🏆</h2>
          <p className="page-subtitle">
            Top portfolios ranked by live portfolio value across TradeXpert traders.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "var(--color-profit)",
              display: "inline-block",
              boxShadow: "var(--shadow-glow-profit)",
            }}
          ></span>
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", fontWeight: "600" }}>
            Live Updates (Every 5s)
          </span>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="table-card">
        {board.length > 0 ? (
          <div className="table-responsive">
            <table className="order-table">
              <thead>
                <tr>
                  <th style={{ width: "90px" }}>Rank</th>
                  <th>Trader</th>
                  <th>Portfolio Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {board.map((entry, i) => {
                  const isCurrent = user?.name === entry.name;
                  return (
                    <tr
                      key={i}
                      style={{
                        backgroundColor: isCurrent ? "var(--color-profit-soft)" : "transparent",
                      }}
                    >
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {getRankBadge(i)}
                        </div>
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="user-avatar-circle" style={{ width: "32px", height: "32px", fontSize: "0.8rem" }}>
                            {entry.name ? entry.name.substring(0, 2).toUpperCase() : "TR"}
                          </div>
                          <div>
                            <span style={{ fontWeight: "700", color: "var(--color-text-strong)" }}>
                              {entry.name}
                            </span>
                            {isCurrent && (
                              <span
                                style={{
                                  marginLeft: "8px",
                                  fontSize: "0.72rem",
                                  fontWeight: "700",
                                  padding: "2px 8px",
                                  borderRadius: "var(--radius-pill)",
                                  background: "var(--color-profit)",
                                  color: "#fff",
                                }}
                              >
                                YOU
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontWeight: "800", fontSize: "1rem", color: "var(--color-text-strong)" }}>
                          ₹{entry.portfolioValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      <td>
                        <span
                          style={{
                            fontSize: "0.78rem",
                            fontWeight: "600",
                            color: "var(--color-profit)",
                            background: "var(--color-profit-soft)",
                            padding: "3px 10px",
                            borderRadius: "var(--radius-pill)",
                          }}
                        >
                          ● Active Trader
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🏆</div>
            <h4 className="empty-state-title">Leaderboard Empty</h4>
            <p className="empty-state-text">
              Rankings will populate as traders execute orders and build their portfolios.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;