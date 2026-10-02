import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { getAuthHeader, getCurrentUser } from "../utils/auth";
import { getSnapshot, subscribeToLiveMarket } from "../utils/liveMarket";
import BenchmarkChart from "./BenchmarkChart";
import SectorAllocation from "./SectorAllocation";

const buildLiveMap = (snapshot) => {
  const map = {};
  snapshot.forEach((s) => {
    map[s.name] = s;
  });
  return map;
};

const Summary = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  const [holdings, setHoldings] = useState([]);
  const [wallet, setWallet] = useState(0);
  const [liveMap, setLiveMap] = useState(() => buildLiveMap(getSnapshot()));

  const user = getCurrentUser();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToLiveMarket((snapshot) => {
      setLiveMap(buildLiveMap(snapshot));
    });
    return unsubscribe;
  }, []);

  const fetchData = async () => {
    try {
      const [holdingsRes, profileRes] = await Promise.all([
        axios.get(`${API}/allHoldings`, { headers: getAuthHeader() }),
        axios.get(`${API}/profile`, { headers: getAuthHeader() }),
      ]);

      setHoldings(holdingsRes.data || []);
      setWallet(profileRes.data.wallet || 0);
    } catch (err) {
      console.log(err);
    }
  };

  const investment = holdings.reduce((sum, h) => sum + h.avg * h.qty, 0);
  const currentValue = holdings.reduce((sum, h) => {
    const live = liveMap[h.name];
    const price = live ? live.price : h.price;
    return sum + price * h.qty;
  }, 0);
  const pnl = currentValue - investment;
  const pnlPercent = investment ? ((pnl / investment) * 100).toFixed(2) : "0.00";
  const isProfit = pnl >= 0;

  return (
    <div className="fade-up">
      {/* Welcome Banner */}
      <div className="section-header">
        <div>
          <h2 className="page-title">
            Welcome back, {user?.name || "Trader"} 👋
          </h2>
          <p className="page-subtitle">
            Here is your live portfolio snapshot and equity allocation.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            to="/funds"
            style={{
              background: "var(--gradient-primary)",
              color: "#fff",
              padding: "9px 18px",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
              fontWeight: "600",
              boxShadow: "var(--shadow-glow-primary)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            💳 Add Funds
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="stats-card-grid">
        {/* Total Portfolio */}
        <div className="stat-card">
          <div className="stat-card-label">Total Portfolio</div>
          <div className="stat-card-value">
            ₹{(wallet + currentValue).toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="stat-card-sub">
            <span>Cash + Holdings</span>
          </div>
        </div>

        {/* Available Margin */}
        <div className="stat-card">
          <div className="stat-card-label">Available Margin</div>
          <div className="stat-card-value" style={{ color: "var(--color-primary)" }}>
            ₹{wallet.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </div>
          <div className="stat-card-sub">
            <span>Virtual Cash Balance</span>
          </div>
        </div>

        {/* Invested Value */}
        <div className="stat-card">
          <div className="stat-card-label">Holdings Invested</div>
          <div className="stat-card-value">
            ₹{investment.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </div>
          <div className="stat-card-sub">
            <span>{holdings.length} Active Positions</span>
          </div>
        </div>

        {/* Overall P&L */}
        <div className="stat-card">
          <div className="stat-card-label">Overall Unrealized P&L</div>
          <div
            className="stat-card-value"
            style={{
              color: isProfit ? "var(--color-profit)" : "var(--color-loss)",
            }}
          >
            {isProfit ? "+" : ""}₹{pnl.toFixed(2)}
          </div>
          <div className="stat-card-sub">
            <span
              className={`pnl-pill ${isProfit ? "profit" : "loss"}`}
              style={{ fontSize: "0.75rem", padding: "2px 8px" }}
            >
              {isProfit ? "+" : ""}{pnlPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-card-header">
            <h4 className="chart-card-title">Portfolio Performance vs NIFTY 50</h4>
          </div>
          <BenchmarkChart portfolioValue={wallet + currentValue} />
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h4 className="chart-card-title">Sector Allocation</h4>
          </div>
          <SectorAllocation />
        </div>
      </div>
    </div>
  );
};

export default Summary;