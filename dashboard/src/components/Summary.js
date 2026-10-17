import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
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
import toast from "react-hot-toast";
import { getAuthHeader, getCurrentUser } from "../utils/auth";
import {
  getLiveMap,
  getNifty,
  getSensex,
  getMarketInfo,
  subscribeToLiveMarket,
  subscribeToNifty,
  subscribeToSensex,
  subscribeToMarketInfo,
} from "../utils/liveMarket";
import BenchmarkChart from "./BenchmarkChart";
import SectorAllocation from "./SectorAllocation";
import GeneralContext from "./GeneralContext";
import FundModal from "./FundModal";
import "./Summary.css";

const formatINR = (val) => {
  return Number(val || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const Summary = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  const [loading, setLoading] = useState(true);
  const [holdings, setHoldings] = useState([]);
  const [wallet, setWallet] = useState(0);
  const [liveMap, setLiveMap] = useState(() => getLiveMap());
  const [marketInfo, setMarketInfo] = useState(() => getMarketInfo());
  const [nifty, setNifty] = useState(() => getNifty());
  const [sensex, setSensex] = useState(() => getSensex());
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
      toast.error("Failed to load account overview");
    } finally {
      setLoading(false);
    }
  }, [API]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // O(1) shared live map from liveMarket.js
    const unsubMarket = subscribeToLiveMarket((_stocks, map) => {
      if (map) setLiveMap(map);
    });
    const unsubNifty = subscribeToNifty((data) => {
      if (data) setNifty(data);
    });
    const unsubSensex = subscribeToSensex((data) => {
      if (data) setSensex(data);
    });
    const unsubInfo = subscribeToMarketInfo((data) => {
      if (data) setMarketInfo(data);
    });

    return () => {
      unsubMarket();
      unsubNifty();
      unsubSensex();
      unsubInfo();
    };
  }, []);

  // Optimized O(H) Single-Pass Financial Aggregation
  const {
    investment,
    currentValue,
    unrealizedPnL,
    unrealizedPnLPercent,
    isProfit,
    totalPortfolio,
    cashRatio,
    stocksRatio,
  } = useMemo(() => {
    let inv = 0;
    let val = 0;
    for (let i = 0; i < holdings.length; i++) {
      const h = holdings[i];
      inv += h.avg * h.qty;
      const live = liveMap[h.name];
      const price = live ? live.price : h.price;
      val += price * h.qty;
    }

    const pnl = val - inv;
    const pnlPct = inv ? ((pnl / inv) * 100).toFixed(2) : "0.00";
    const port = wallet + val;
    const cRatio = port > 0 ? Math.min(100, Math.max(0, Math.round((wallet / port) * 100))) : 100;

    return {
      investment: inv,
      currentValue: val,
      unrealizedPnL: pnl,
      unrealizedPnLPercent: pnlPct,
      isProfit: pnl >= 0,
      totalPortfolio: port,
      cashRatio: cRatio,
      stocksRatio: 100 - cRatio,
    };
  }, [holdings, liveMap, wallet]);

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

      {/* 1.1 Market Trend & Pulse Bar */}
      <div className="summary-market-pulse">
        <div className="pulse-left">
          <span className={`pulse-status-badge ${marketInfo.isMarketOpen ? "live" : "sim"}`}>
            <span className="pulse-dot"></span>
            {marketInfo.isMarketOpen ? "NSE Live Market Open" : "24/7 Simulator Active"}
          </span>
          <span className="pulse-desc">
            {marketInfo.marketStatus || "Real-time Quant Order Matching Engine"}
          </span>
        </div>
        <div className="pulse-indices">
          <div className="pulse-index-item">
            <span className="pulse-index-label">NIFTY 50</span>
            <span className="pulse-index-price">₹{Number(nifty?.price || 22421.95).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            <span className={`pulse-index-badge ${nifty?.isDown ? "down" : "up"}`}>
              {nifty?.percent || "+0.00%"}
            </span>
          </div>
          <div className="pulse-index-item">
            <span className="pulse-index-label">SENSEX</span>
            <span className="pulse-index-price">₹{Number(sensex?.price || 71909.7).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            <span className={`pulse-index-badge ${sensex?.isDown ? "down" : "up"}`}>
              {sensex?.percent || "+0.00%"}
            </span>
          </div>
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

        {loading ? (
          <div style={{ padding: "28px 20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="skeleton-shimmer" style={{ height: "36px", borderRadius: "6px" }}></div>
              <div className="skeleton-shimmer" style={{ height: "36px", borderRadius: "6px" }}></div>
            </div>
          </div>
        ) : holdings.length > 0 ? (
          <>
            <div className="mobile-table-hint">
              <span>⟵ Swipe table horizontally • Swipe page vertically to scroll ⟶</span>
            </div>
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
          </>
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

      {/* 4.1 SEBI Compliance & Risk Disclosure Alert */}
      <div className="sebi-risk-card">
        <div className="sebi-risk-header">
          <span className="sebi-badge">SEBI Risk Disclosure</span>
          <span className="sebi-subtitle">Investments &amp; Derivatives Regulatory Advisory</span>
        </div>
        <p className="sebi-risk-text">
          <b>Risk Warning on Trading:</b> 9 out of 10 individual traders in equity Futures and Options Segment incurred net losses, with average loss close to ₹50,000. 
          TradeXpert provides an institutional paper trading environment with <b>₹1,00,000 risk-free virtual funds</b> to help you learn and test strategies safely before deploying real capital.
        </p>
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