import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Payments,
  AccountBalanceWallet,
  ShowChart,
  ArrowForward,
} from "@mui/icons-material";
import { getAuthHeader, getCurrentUser } from "../utils/auth";
import { getSnapshot, subscribeToLiveMarket } from "../utils/liveMarket";
import BenchmarkChart from "./BenchmarkChart";
import SectorAllocation from "./SectorAllocation";
import GeneralContext from "./GeneralContext";
import FundModal from "./FundModal";
import "./Summary.css";

const buildLiveMap = (snapshot) => {
  const map = {};
  snapshot.forEach((s) => {
    map[s.name] = s;
  });
  return map;
};

const formatINR = (val) => {
  return Number(val || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const Summary = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  const [holdings, setHoldings] = useState([]);
  const [wallet, setWallet] = useState(0);
  const [liveMap, setLiveMap] = useState(() => buildLiveMap(getSnapshot()));
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [fundModalMode, setFundModalMode] = useState("DEPOSIT");

  const generalContext = useContext(GeneralContext);
  const user = getCurrentUser();

  const fetchData = useCallback(async () => {
    try {
      const [holdingsRes, profileRes] = await Promise.all([
        axios.get(`${API}/allHoldings`, { headers: getAuthHeader() }),
        axios.get(`${API}/profile`, { headers: getAuthHeader() }),
      ]);

      setHoldings(holdingsRes.data || []);
      setWallet(profileRes.data.wallet || 0);
    } catch (err) {
      console.log("Error loading summary:", err);
    }
  }, [API]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const unsubscribe = subscribeToLiveMarket((snapshot) => {
      setLiveMap(buildLiveMap(snapshot));
    });
    return unsubscribe;
  }, []);

  // Financial Calculations
  const investment = holdings.reduce((sum, h) => sum + h.avg * h.qty, 0);
  const currentValue = holdings.reduce((sum, h) => {
    const live = liveMap[h.name];
    const price = live ? live.price : h.price;
    return sum + price * h.qty;
  }, 0);

  const unrealizedPnL = currentValue - investment;
  const unrealizedPnLPercent = investment
    ? ((unrealizedPnL / investment) * 100).toFixed(2)
    : "0.00";
  const isProfit = unrealizedPnL >= 0;

  const totalPortfolio = wallet + currentValue;
  const cashRatio =
    totalPortfolio > 0
      ? Math.min(100, Math.max(0, Math.round((wallet / totalPortfolio) * 100)))
      : 100;
  const stocksRatio = 100 - cashRatio;

  const openDeposit = () => {
    setFundModalMode("DEPOSIT");
    setFundModalOpen(true);
  };

  const openWithdraw = () => {
    setFundModalMode("WITHDRAW");
    setFundModalOpen(true);
  };

  return (
    <div className="summary-container fade-up">
      {/* 1. Header with Direct Actions */}
      <div className="summary-top-bar">
        <div>
          <h2 className="summary-user-title">
            Welcome back, {user?.name || "Trader"}
          </h2>
          <p className="summary-user-subtitle">
            Portfolio performance &amp; market snapshot
          </p>
        </div>

        <div className="summary-actions-group">
          <button
            type="button"
            className="btn-summary-outline"
            onClick={openWithdraw}
          >
            <AccountBalanceWallet style={{ fontSize: "1rem" }} />
            Withdraw
          </button>
          <button
            type="button"
            className="btn-summary-addfunds"
            onClick={openDeposit}
          >
            <Payments style={{ fontSize: "1rem" }} />
            + Add Funds
          </button>
        </div>
      </div>

      {/* 2. Sleek 4-Card Financial Strip */}
      <div className="stats-card-grid">
        {/* Card 1: Total Net Worth */}
        <div className="stat-card">
          <div className="stat-card-label">Total Net Worth</div>
          <div className="stat-card-value">₹{formatINR(totalPortfolio)}</div>
          <div className="stat-card-sub">
            <span>Cash + Holdings</span>
          </div>
        </div>

        {/* Card 2: Available Cash */}
        <div className="stat-card">
          <div className="stat-card-label">Available Margin</div>
          <div className="stat-card-value" style={{ color: "var(--color-primary)" }}>
            ₹{formatINR(wallet)}
          </div>
          <div className="stat-card-sub">
            <span>Liquid Trading Balance ({cashRatio}%)</span>
          </div>
        </div>

        {/* Card 3: Holdings Invested Value */}
        <div className="stat-card">
          <div className="stat-card-label">Holdings Current Value</div>
          <div className="stat-card-value">₹{formatINR(currentValue)}</div>
          <div className="stat-card-sub">
            <span>Invested: ₹{formatINR(investment)} ({holdings.length} Stocks)</span>
          </div>
        </div>

        {/* Card 4: Total P&L */}
        <div className="stat-card">
          <div className="stat-card-label">Overall Unrealized P&amp;L</div>
          <div
            className="stat-card-value"
            style={{
              color: isProfit ? "var(--color-profit)" : "var(--color-loss)",
            }}
          >
            {isProfit ? "+" : ""}₹{formatINR(unrealizedPnL)}
          </div>
          <div className="stat-card-sub">
            <span className={`pnl-pill ${isProfit ? "profit" : "loss"}`}>
              {isProfit ? <TrendingUp style={{ fontSize: "0.85rem" }} /> : <TrendingDown style={{ fontSize: "0.85rem" }} />}
              {isProfit ? "+" : ""}{unrealizedPnLPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. Subtle Clean Asset Allocation Bar */}
      <div className="summary-slim-asset-bar">
        <div className="summary-slim-bar-track">
          <div
            className="summary-slim-segment cash"
            style={{ width: `${cashRatio}%` }}
            title={`Available Cash: ${cashRatio}%`}
          />
          <div
            className="summary-slim-segment stocks"
            style={{ width: `${stocksRatio}%` }}
            title={`Stocks: ${stocksRatio}%`}
          />
        </div>
        <div className="summary-slim-bar-legend">
          <span className="summary-legend-chip">
            <span className="dot cash" /> Cash: {cashRatio}% (₹{formatINR(wallet)})
          </span>
          <span className="summary-legend-chip">
            <span className="dot stocks" /> Stocks: {stocksRatio}% (₹{formatINR(currentValue)})
          </span>
        </div>
      </div>

      {/* 4. Active Holdings Table */}
      <div className="table-card">
        <div className="summary-table-header">
          <h3 className="chart-card-title">
            Your Active Holdings ({holdings.length})
          </h3>
          <Link to="/holdings" className="summary-view-all-link">
            View All Holdings <ArrowForward style={{ fontSize: "0.95rem" }} />
          </Link>
        </div>

        {holdings.length > 0 ? (
          <div className="table-responsive">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th>Quantity</th>
                  <th>Avg. Price</th>
                  <th>LTP (Live)</th>
                  <th>Current Value</th>
                  <th>P&amp;L</th>
                  <th style={{ textAlign: "right" }}>Chart</th>
                </tr>
              </thead>
              <tbody>
                {holdings.slice(0, 5).map((stock, i) => {
                  const live = liveMap[stock.name];
                  const livePrice = live ? live.price : stock.price;
                  const stockCost = stock.avg * stock.qty;
                  const stockVal = livePrice * stock.qty;
                  const stockPnl = stockVal - stockCost;
                  const stockPnlPct = stockCost
                    ? ((stockPnl / stockCost) * 100).toFixed(2)
                    : "0.00";
                  const isStockProfitable = stockPnl >= 0;

                  return (
                    <tr key={stock.name || i}>
                      <td>
                        <div className="summary-stock-chip">
                          <div className="summary-stock-avatar">
                            {stock.name.slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: "700", color: "var(--color-text-strong)" }}>
                              {stock.name}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
                              {live?.sector || "NSE • EQ"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: "700" }}>{stock.qty} Qty</td>
                      <td>₹{formatINR(stock.avg)}</td>
                      <td style={{ fontWeight: "700", color: "var(--color-primary)" }}>
                        ₹{formatINR(livePrice)}
                      </td>
                      <td style={{ fontWeight: "700" }}>₹{formatINR(stockVal)}</td>
                      <td>
                        <span className={`pnl-pill ${isStockProfitable ? "profit" : "loss"}`}>
                          {isStockProfitable ? "+" : ""}₹{formatINR(stockPnl)} ({isStockProfitable ? "+" : ""}{stockPnlPct}%)
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => generalContext.openChartModal(stock.name)}
                          className="btn-table-chart"
                          title={`Open ${stock.name} Chart`}
                        >
                          <ShowChart style={{ fontSize: "0.95rem" }} />
                          Chart
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: "36px 20px" }}>
            <div className="empty-state-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <h4 className="empty-state-title">No Active Holdings</h4>
            <p className="empty-state-text">
              Select any stock from the watchlist on the left and click <b>BUY</b> to start investing.
            </p>
          </div>
        )}
      </div>

      {/* 5. Analytics Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-card-header">
            <h4 className="chart-card-title">Portfolio Performance vs NIFTY 50</h4>
          </div>
          <BenchmarkChart portfolioValue={totalPortfolio} />
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h4 className="chart-card-title">Sector Allocation</h4>
          </div>
          <SectorAllocation />
        </div>
      </div>

      {/* Modal */}
      <FundModal
        isOpen={fundModalOpen}
        initialMode={fundModalMode}
        walletBalance={wallet}
        onClose={() => setFundModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default Summary;