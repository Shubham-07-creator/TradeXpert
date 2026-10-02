import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getAuthHeader, getCurrentUser } from "../utils/auth";

const RANK_COLORS = [
  { bg: "rgba(234, 179, 8, 0.12)", text: "#CA8A04", border: "rgba(234, 179, 8, 0.3)" }, // Gold
  { bg: "rgba(148, 163, 184, 0.12)", text: "#64748B", border: "rgba(148, 163, 184, 0.3)" }, // Silver
  { bg: "rgba(217, 119, 6, 0.12)", text: "#B45309", border: "rgba(217, 119, 6, 0.3)" }, // Bronze
];

const Leaderboard = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";
  const [board, setBoard] = useState([]);
  const user = getCurrentUser();

  const fetchBoard = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/leaderboard`, {
        headers: getAuthHeader(),
      });
      setBoard(res.data || []);
    } catch (err) {
      console.log(err);
    }
  }, [API]);

  useEffect(() => {
    fetchBoard();
    const interval = setInterval(fetchBoard, 5000);
    return () => clearInterval(interval);
  }, [fetchBoard]);

  const getRankBadge = (rank) => {
    const isTop3 = rank < 3;

    if (isTop3) {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "28px",
            height: "28px",
            borderRadius: "6px",
            fontSize: "0.78rem",
            fontWeight: "800",
            backgroundColor: RANK_COLORS[rank].bg,
            color: RANK_COLORS[rank].text,
            border: `1px solid ${RANK_COLORS[rank].border}`,
          }}
        >
          {String(rank + 1).padStart(2, "0")}
        </span>
      );
    }

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "28px",
          height: "28px",
          fontWeight: "600",
          fontSize: "0.8rem",
          color: "var(--color-text-muted)",
        }}
      >
        {String(rank + 1).padStart(2, "0")}
      </span>
    );
  };

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="page-title">Trader Leaderboard</h2>
          <p className="page-subtitle">
            Top portfolios ranked by live portfolio value across all registered accounts
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
            <div className="empty-state-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
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