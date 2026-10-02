import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
  Inventory2,
  Payments,
  ShowChart,
  ArrowForward,
  HelpOutline,
  CheckCircleOutline,
  Close,
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

const Summary = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  const [holdings, setHoldings] = useState([]);
  const [wallet, setWallet] = useState(0);
  const [realizedPnL, setRealizedPnL] = useState(0);
  const [orders, setOrders] = useState([]);
  const [liveMap, setLiveMap] = useState(() => buildLiveMap(getSnapshot()));
  const [showGuide, setShowGuide] = useState(false);
  const [fundModalOpen, setFundModalOpen] = useState(false);

  const generalContext = useContext(GeneralContext);
  const user = getCurrentUser();

  const fetchData = useCallback(async () => {
    try {
      const [holdingsRes, profileRes, ordersRes] = await Promise.all([
        axios.get(`${API}/allHoldings`, { headers: getAuthHeader() }),
        axios.get(`${API}/profile`, { headers: getAuthHeader() }),
        axios.get(`${API}/orders?page=1&limit=50`, { headers: getAuthHeader() }),
      ]);

      setHoldings(holdingsRes.data || []);
      setWallet(profileRes.data.wallet || 0);
      setRealizedPnL(profileRes.data.realizedPnL || 0);

      const ordList = Array.isArray(ordersRes.data)
        ? ordersRes.data
        : ordersRes.data.orders || [];
      setOrders(ordList);
    } catch (err) {
      console.log("Error loading summary data:", err);
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

  // Portfolio Financial Calculations
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
  const totalReturn = unrealizedPnL + realizedPnL;
  const isTotalReturnProfit = totalReturn >= 0;

  // Active Stocks & Orders metrics
  const totalSharesCount = holdings.reduce((sum, h) => sum + h.qty, 0);
  const openOrders = orders.filter(
    (o) => o.status === "OPEN" || o.status === "PENDING"
  );
  const executedOrders = orders.filter((o) => o.status === "EXECUTED");

  // Cash vs Stocks Split Ratio
  const cashRatio =
    totalPortfolio > 0
      ? Math.min(100, Math.max(0, Math.round((wallet / totalPortfolio) * 100)))
      : 100;
  const stocksRatio = 100 - cashRatio;

  return (
    <div className="summary-container fade-up">
      {/* 1. Top Welcome Bar & Quick Controls */}
      <div className="summary-top-bar">
        <div>
          <h2 className="summary-user-title">
            Welcome back, {user?.name || "Trader"} 👋
          </h2>
          <p className="summary-user-subtitle">
            Live Portfolio Overview • All your investments, cash &amp; returns at a glance.
          </p>
        </div>

        <div className="summary-actions-group">
          {/* Quick Beginner FAQ Toggle */}
          <button
            type="button"
            className="btn-summary-guide"
            onClick={() => setShowGuide(!showGuide)}
            title="Understand your dashboard numbers"
          >
            <HelpOutline style={{ fontSize: "1rem" }} />
            {showGuide ? "Close Guide" : "💡 How to Read Dashboard"}
          </button>

          {/* Add Funds Button */}
          <button
            type="button"
            className="btn-summary-addfunds"
            onClick={() => setFundModalOpen(true)}
          >
            <Payments style={{ fontSize: "1.05rem" }} />
            + Add Funds
          </button>
        </div>
      </div>

      {/* 2. Interactive Beginner's Guide Drawer */}
      {showGuide && (
        <div className="summary-guide-drawer">
          <div className="summary-guide-header">
            <h4 className="summary-guide-title">
              <CheckCircleOutline style={{ color: "var(--color-primary)" }} />
              TradeXpert Quick Guide — Understanding Your Portfolio:
            </h4>
            <button
              onClick={() => setShowGuide(false)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-muted)",
              }}
            >
              <Close style={{ fontSize: "1.1rem" }} />
            </button>
          </div>

          <div className="summary-guide-grid">
            <div className="summary-guide-item">
              <div className="summary-guide-item-title">
                💰 1. Where is my money?
              </div>
              <p className="summary-guide-item-desc">
                <b>Total Net Worth</b>: Your total account value (Free Cash in Wallet + Current Market Value of owned stocks).<br />
                <b>Available Cash</b>: Free balance ready to buy new stocks or withdraw anytime.
              </p>
            </div>

            <div className="summary-guide-item">
              <div className="summary-guide-item-title">
                📈 2. What is my Profit &amp; Loss?
              </div>
              <p className="summary-guide-item-desc">
                <b>Unrealized P&amp;L</b>: Live return on stocks you currently hold (Green = Profit, Red = Loss).<br />
                <b>Realized P&amp;L</b>: Locked profit or loss from completed sales.
              </p>
            </div>

            <div className="summary-guide-item">
              <div className="summary-guide-item-title">
                📦 3. What stocks and orders do I own?
              </div>
              <p className="summary-guide-item-desc">
                <b>Active Holdings</b>: Companies whose shares you currently hold in delivery.<br />
                <b>Pending Orders</b>: Limit orders waiting for market price to reach your set target.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Hero Net Worth Card with Segmented Asset Bar */}
      <div className="summary-hero-card">
        <div className="summary-hero-main">
          <div className="summary-hero-title-group">
            <span className="summary-hero-tag">
              <AccountBalanceWallet style={{ fontSize: "0.95rem" }} />
              Total Net Worth
            </span>
            <div className="summary-hero-value">
              ₹{totalPortfolio.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <p className="summary-hero-subtext">
              Wallet Cash (₹{wallet.toLocaleString("en-IN", { maximumFractionDigits: 2 })}) +
              Current Stock Value (₹{currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })})
            </p>
          </div>

          <div>
            <div
              className={`summary-hero-pnl-badge ${
                isProfit ? "profit" : "loss"
              }`}
            >
              {isProfit ? (
                <TrendingUp style={{ fontSize: "1.3rem" }} />
              ) : (
                <TrendingDown style={{ fontSize: "1.3rem" }} />
              )}
              <span>
                {isProfit ? "+" : ""}₹{unrealizedPnL.toFixed(2)} ({isProfit ? "+" : ""}
                {unrealizedPnLPercent}%)
              </span>
            </div>
            <div
              style={{
                fontSize: "0.78rem",
                color: "var(--color-text-muted)",
                textAlign: "right",
                marginTop: "6px",
                fontWeight: "600",
              }}
            >
              {isProfit
                ? "🟢 Your overall portfolio is currently profitable"
                : "🔴 Portfolio currently trading below purchase cost"}
            </div>
          </div>
        </div>

        {/* Asset Allocation Bar (Cash vs Stocks) */}
        <div className="summary-asset-bar-section">
          <div className="summary-asset-bar-labels">
            <span>Asset Allocation Breakdown</span>
            <span>
              Cash: {cashRatio}% • Stocks: {stocksRatio}%
            </span>
          </div>

          <div className="summary-asset-bar-track">
            <div
              className="summary-asset-segment-cash"
              style={{ width: `${cashRatio}%` }}
              title={`Liquid Cash: ₹${wallet.toLocaleString("en-IN")} (${cashRatio}%)`}
            />
            <div
              className="summary-asset-segment-stocks"
              style={{ width: `${stocksRatio}%` }}
              title={`Equity Holdings: ₹${currentValue.toLocaleString("en-IN")} (${stocksRatio}%)`}
            />
          </div>

          <div className="summary-asset-legend">
            <div className="summary-asset-legend-item">
              <span
                className="summary-asset-dot"
                style={{ background: "#387ED1" }}
              />
              <span>
                <b>Available Cash (Liquid Margin):</b> ₹
                {wallet.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ({cashRatio}%)
              </span>
            </div>
            <div className="summary-asset-legend-item">
              <span
                className="summary-asset-dot"
                style={{ background: "#10B981" }}
              />
              <span>
                <b>Stock Holdings (Market Value):</b> ₹
                {currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ({stocksRatio}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. The 3 Clarity Question Cards */}
      <div className="summary-clarity-grid">
        {/* Question 1: How much money do I have? */}
        <div className="summary-clarity-card">
          <div className="summary-clarity-card-header">
            <h3 className="summary-clarity-question">
              💰 1. Available Capital
            </h3>
            <span className="summary-clarity-badge">Cash &amp; Margin</span>
          </div>

          <div className="summary-clarity-main-stat" style={{ color: "var(--color-primary)" }}>
            ₹{wallet.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </div>
          <p className="summary-clarity-explanation">
            This is your <b>liquid trading balance</b> ready to buy new shares or withdraw to your bank account anytime.
          </p>

          <div className="summary-clarity-breakdown">
            <div className="summary-breakdown-row">
              <span className="summary-breakdown-label">Free Cash in Wallet:</span>
              <span className="summary-breakdown-value">
                ₹{wallet.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="summary-breakdown-row">
              <span className="summary-breakdown-label">Current Value in Stocks:</span>
              <span className="summary-breakdown-value">
                ₹{currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="summary-breakdown-row" style={{ borderTop: "1px dashed var(--color-border)", paddingTop: "6px", marginTop: "2px" }}>
              <span className="summary-breakdown-label" style={{ fontWeight: "700", color: "var(--color-text-strong)" }}>
                Total Account Worth:
              </span>
              <span className="summary-breakdown-value" style={{ fontWeight: "800", color: "var(--color-primary)" }}>
                ₹{totalPortfolio.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Question 2: How much profit / loss did I make? */}
        <div className="summary-clarity-card">
          <div className="summary-clarity-card-header">
            <h3 className="summary-clarity-question">
              📈 2. Returns &amp; Performance
            </h3>
            <span
              className="summary-clarity-badge"
              style={{
                color: isProfit ? "var(--color-profit)" : "var(--color-loss)",
                borderColor: isProfit ? "var(--color-profit)" : "var(--color-loss)",
              }}
            >
              {isProfit ? "PROFIT" : "LOSS"}
            </span>
          </div>

          <div
            className="summary-clarity-main-stat"
            style={{
              color: isProfit ? "var(--color-profit)" : "var(--color-loss)",
            }}
          >
            {isProfit ? "+" : ""}₹{unrealizedPnL.toFixed(2)}
          </div>
          <p className="summary-clarity-explanation">
            {isProfit
              ? `You invested ₹${investment.toLocaleString("en-IN", { maximumFractionDigits: 2 })}, and your shares are currently valued at ₹${currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}.`
              : `You invested ₹${investment.toLocaleString("en-IN", { maximumFractionDigits: 2 })}, currently trading at ₹${currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}.`}
          </p>

          <div className="summary-clarity-breakdown">
            <div className="summary-breakdown-row">
              <span className="summary-breakdown-label">Unrealized Holdings P&amp;L:</span>
              <span
                className="summary-breakdown-value"
                style={{ color: isProfit ? "var(--color-profit)" : "var(--color-loss)" }}
              >
                {isProfit ? "+" : ""}₹{unrealizedPnL.toFixed(2)} ({isProfit ? "+" : ""}{unrealizedPnLPercent}%)
              </span>
            </div>
            <div className="summary-breakdown-row">
              <span className="summary-breakdown-label">Realized Closed Trades P&amp;L:</span>
              <span
                className="summary-breakdown-value"
                style={{ color: realizedPnL >= 0 ? "var(--color-profit)" : "var(--color-loss)" }}
              >
                {realizedPnL >= 0 ? "+" : ""}₹{realizedPnL.toFixed(2)}
              </span>
            </div>
            <div className="summary-breakdown-row" style={{ borderTop: "1px dashed var(--color-border)", paddingTop: "6px", marginTop: "2px" }}>
              <span className="summary-breakdown-label" style={{ fontWeight: "700", color: "var(--color-text-strong)" }}>
                Net Lifetime Return:
              </span>
              <span
                className="summary-breakdown-value"
                style={{
                  fontWeight: "800",
                  color: isTotalReturnProfit ? "var(--color-profit)" : "var(--color-loss)",
                }}
              >
                {isTotalReturnProfit ? "+" : ""}₹{totalReturn.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Question 3: How many orders and stocks bought? */}
        <div className="summary-clarity-card">
          <div className="summary-clarity-card-header">
            <h3 className="summary-clarity-question">
              📦 3. Active Holdings &amp; Orders
            </h3>
            <span className="summary-clarity-badge">
              {holdings.length} Companies
            </span>
          </div>

          <div className="summary-clarity-main-stat">
            {totalSharesCount} <span style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--color-text-muted)" }}>Shares</span>
          </div>
          <p className="summary-clarity-explanation">
            You currently hold <b>{totalSharesCount} shares</b> across <b>{holdings.length} delivery companies</b> in your portfolio.
          </p>

          <div className="summary-clarity-breakdown">
            <div className="summary-breakdown-row">
              <span className="summary-breakdown-label">Active Delivery Stocks:</span>
              <span className="summary-breakdown-value">{holdings.length} Stocks</span>
            </div>
            <div className="summary-breakdown-row">
              <span className="summary-breakdown-label">Pending Limit Orders:</span>
              <span className="summary-breakdown-value" style={{ color: openOrders.length > 0 ? "var(--color-primary)" : "var(--color-text-muted)" }}>
                {openOrders.length} Orders
              </span>
            </div>
            <div className="summary-breakdown-row" style={{ borderTop: "1px dashed var(--color-border)", paddingTop: "6px", marginTop: "2px" }}>
              <span className="summary-breakdown-label" style={{ fontWeight: "700", color: "var(--color-text-strong)" }}>
                Executed Trades:
              </span>
              <span className="summary-breakdown-value" style={{ fontWeight: "800", color: "var(--color-profit)" }}>
                {executedOrders.length} Trades
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Direct Active Holdings Table on Summary */}
      <div className="summary-holdings-card">
        <div className="summary-holdings-header">
          <div>
            <h3 className="summary-holdings-title">
              <Inventory2 style={{ color: "var(--color-primary)", fontSize: "1.3rem" }} />
              Your Active Holdings
            </h3>
            <p className="summary-holdings-subtitle">
              Live tracking of all delivery stocks, purchase prices, LTP and real-time returns.
            </p>
          </div>

          <Link to="/holdings" className="summary-view-all-link">
            View All Holdings
            <ArrowForward style={{ fontSize: "1rem" }} />
          </Link>
        </div>

        {holdings.length > 0 ? (
          <div className="table-responsive">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th>Quantity</th>
                  <th>Avg Price</th>
                  <th>LTP (Live)</th>
                  <th>Current Value</th>
                  <th>Unrealized P&amp;L</th>
                  <th style={{ textAlign: "right" }}>Chart</th>
                </tr>
              </thead>
              <tbody>
                {holdings.slice(0, 6).map((stock, i) => {
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
                            <div style={{ fontWeight: "800", color: "var(--color-text-strong)" }}>
                              {stock.name}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
                              {live?.sector || "NSE • Equity"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: "700" }}>{stock.qty} Qty</td>
                      <td>₹{Number(stock.avg).toFixed(2)}</td>
                      <td style={{ fontWeight: "700", color: "var(--color-primary)" }}>
                        ₹{Number(livePrice).toFixed(2)}
                      </td>
                      <td style={{ fontWeight: "700" }}>
                        ₹{stockVal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span
                          className={`pnl-pill ${
                            isStockProfitable ? "profit" : "loss"
                          }`}
                        >
                          {isStockProfitable ? "+" : ""}₹{stockPnl.toFixed(2)} (
                          {isStockProfitable ? "+" : ""}
                          {stockPnlPct}%)
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => generalContext.openChartModal(stock.name)}
                          style={{
                            background: "var(--color-bg-base)",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-primary)",
                            padding: "6px 12px",
                            borderRadius: "var(--radius-sm)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontWeight: "700",
                            fontSize: "0.78rem",
                            transition: "all 0.15s ease",
                          }}
                          title={`Open ${stock.name} Interactive Chart`}
                        >
                          <ShowChart style={{ fontSize: "1rem" }} />
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
          <div className="summary-empty-holdings">
            <div style={{ fontSize: "2.4rem", marginBottom: "8px" }}>💼</div>
            <h4 style={{ margin: "0 0 6px 0", color: "var(--color-text-strong)", fontWeight: "800" }}>
              No Holdings in Portfolio Yet
            </h4>
            <p style={{ margin: "0 0 16px 0", color: "var(--color-text-muted)", fontSize: "0.85rem", maxWidth: "450px", marginLeft: "auto", marginRight: "auto" }}>
              To start investing, select any stock from the watchlist on the left (e.g., Reliance, TCS, HDFC) and click <b>BUY</b>!
            </p>
            <button
              type="button"
              className="btn-summary-addfunds"
              onClick={() => setFundModalOpen(true)}
            >
              + Deposit Virtual Cash
            </button>
          </div>
        )}
      </div>

      {/* 6. High Contrast Interactive Analytics Charts */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h4 className="chart-card-title">
                📈 Portfolio Performance vs NIFTY 50
              </h4>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                Compare your portfolio growth in real-time against benchmark index.
              </p>
            </div>
          </div>
          <BenchmarkChart portfolioValue={totalPortfolio} />
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h4 className="chart-card-title">
                🥧 Sector Diversification
              </h4>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                Asset allocation across Banking, Technology, Auto, Energy and more.
              </p>
            </div>
          </div>
          <SectorAllocation />
        </div>
      </div>

      {/* 7. Dedicated Instant Fund Modal */}
      <FundModal
        isOpen={fundModalOpen}
        initialMode="DEPOSIT"
        walletBalance={wallet}
        onClose={() => setFundModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default Summary;