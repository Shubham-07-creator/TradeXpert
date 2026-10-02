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
            आपका लाइव वित्तीय डैशबोर्ड • All your investments, cash &amp; returns at a glance.
          </p>
        </div>

        <div className="summary-actions-group">
          {/* Quick Beginner FAQ Toggle */}
          <button
            type="button"
            className="btn-summary-guide"
            onClick={() => setShowGuide(!showGuide)}
            title="डैशबोर्ड को आसानी से समझें"
          >
            <HelpOutline style={{ fontSize: "1rem" }} />
            {showGuide ? "गाइड बंद करें" : "💡 डैशबोर्ड कैसे समझें?"}
          </button>

          {/* Add Funds Button */}
          <button
            type="button"
            className="btn-summary-addfunds"
            onClick={() => setFundModalOpen(true)}
          >
            <Payments style={{ fontSize: "1.05rem" }} />
            + Add Funds (पैसे जोड़ें)
          </button>
        </div>
      </div>

      {/* 2. Interactive Beginner's Guide Drawer */}
      {showGuide && (
        <div className="summary-guide-drawer">
          <div className="summary-guide-header">
            <h4 className="summary-guide-title">
              <CheckCircleOutline style={{ color: "var(--color-primary)" }} />
              TradeXpert Quick Guide — आपके खाते के 3 मुख्य सवाल:
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
                💰 1. कितना पैसा है मेरे पास?
              </div>
              <p className="summary-guide-item-desc">
                <b>कुल संपत्ति (Net Worth)</b> = आपके वॉलेट का कैश + खरीदे हुए शेयरों की आज की कीमत।<br />
                <b>उपलब्ध कैश (Available Cash)</b> = वह पैसा जिससे आप तुरंत नए शेयर खरीद सकते हैं या निकाल सकते हैं।
              </p>
            </div>

            <div className="summary-guide-item">
              <div className="summary-guide-item-title">
                📈 2. कितना फायदा या नुकसान हुआ?
              </div>
              <p className="summary-guide-item-desc">
                <b>चल रहा फायदा/घाटा (Unrealized P&amp;L)</b>: आपके खरीदे हुए शेयरों पर अभी चल रहा लाभ/हानि।<br />
                <b>🟢 हरा रंग</b> = आपको फायदा (Profit) हुआ है।<br />
                <b>🔴 लाल रंग</b> = आपको घाटा (Loss) हुआ है।
              </p>
            </div>

            <div className="summary-guide-item">
              <div className="summary-guide-item-title">
                📦 3. अभी कितने शेयर खरीदे हुए हैं?
              </div>
              <p className="summary-guide-item-desc">
                <b>Active Holdings</b> = वे कंपनियाँ जिनके शेयर आपके पास मौजूद हैं।<br />
                <b>Pending Orders</b> = वे लिमिट ऑर्डर जो आपके तय भाव पर आने का इंतज़ार कर रहे हैं।
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
              कुल कुल संपत्ति • Total Net Worth
            </span>
            <div className="summary-hero-value">
              ₹{totalPortfolio.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <p className="summary-hero-subtext">
              वॉलेट कैश (₹{wallet.toLocaleString("en-IN", { maximumFractionDigits: 2 })}) +
              शेयरों की वर्तमान वैल्यू (₹{currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })})
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
                ? "🟢 कुल मिलाकर आपका पोर्टफोलियो मुनाफे में है!"
                : "🔴 आपके शेयर खरीद मूल्य से कम पर ट्रेड कर रहे हैं।"}
            </div>
          </div>
        </div>

        {/* Asset Allocation Bar (Cash vs Stocks) */}
        <div className="summary-asset-bar-section">
          <div className="summary-asset-bar-labels">
            <span>पैसा कहाँ लगा है? (Asset Breakdown)</span>
            <span>
              कैश: {cashRatio}% • शेयर: {stocksRatio}%
            </span>
          </div>

          <div className="summary-asset-bar-track">
            <div
              className="summary-asset-segment-cash"
              style={{ width: `${cashRatio}%` }}
              title={`फ्री कैश: ₹${wallet.toLocaleString("en-IN")} (${cashRatio}%)`}
            />
            <div
              className="summary-asset-segment-stocks"
              style={{ width: `${stocksRatio}%` }}
              title={`शेयरों में निवेश: ₹${currentValue.toLocaleString("en-IN")} (${stocksRatio}%)`}
            />
          </div>

          <div className="summary-asset-legend">
            <div className="summary-asset-legend-item">
              <span
                className="summary-asset-dot"
                style={{ background: "#387ED1" }}
              />
              <span>
                <b>उपलब्ध कैश (Liquid Cash):</b> ₹
                {wallet.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ({cashRatio}%)
              </span>
            </div>
            <div className="summary-asset-legend-item">
              <span
                className="summary-asset-dot"
                style={{ background: "#10B981" }}
              />
              <span>
                <b>शेयरों में निवेश (Equity Value):</b> ₹
                {currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })} ({stocksRatio}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. The 3 User Clarity Cards (Direct Answers to User's Questions) */}
      <div className="summary-clarity-grid">
        {/* Question 1: कितना पैसा है? */}
        <div className="summary-clarity-card">
          <div className="summary-clarity-card-header">
            <h3 className="summary-clarity-question">
              💰 1. कितना पैसा है मेरे पास?
            </h3>
            <span className="summary-clarity-badge">कैपिटल स्थिति</span>
          </div>

          <div className="summary-clarity-main-stat" style={{ color: "var(--color-primary)" }}>
            ₹{wallet.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </div>
          <p className="summary-clarity-explanation">
            यह आपका <b>फ्री ट्रेडिंग बैलेंस</b> है। इससे आप तुरंत नए शेयर खरीद सकते हैं या अपने बैंक में निकाल सकते हैं।
          </p>

          <div className="summary-clarity-breakdown">
            <div className="summary-breakdown-row">
              <span className="summary-breakdown-label">वॉलेट में फ्री कैश:</span>
              <span className="summary-breakdown-value">
                ₹{wallet.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="summary-breakdown-row">
              <span className="summary-breakdown-label">शेयरों की आज की कीमत:</span>
              <span className="summary-breakdown-value">
                ₹{currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="summary-breakdown-row" style={{ borderTop: "1px dashed var(--color-border)", paddingTop: "6px", marginTop: "2px" }}>
              <span className="summary-breakdown-label" style={{ fontWeight: "700", color: "var(--color-text-strong)" }}>
                कुल खाता संपत्ति:
              </span>
              <span className="summary-breakdown-value" style={{ fontWeight: "800", color: "var(--color-primary)" }}>
                ₹{totalPortfolio.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Question 2: कितना फायदा या नुकसान हुआ? */}
        <div className="summary-clarity-card">
          <div className="summary-clarity-card-header">
            <h3 className="summary-clarity-question">
              📈 2. कितना फायदा / नुकसान हुआ?
            </h3>
            <span
              className="summary-clarity-badge"
              style={{
                color: isProfit ? "var(--color-profit)" : "var(--color-loss)",
                borderColor: isProfit ? "var(--color-profit)" : "var(--color-loss)",
              }}
            >
              {isProfit ? "🟢 PROFIT" : "🔴 LOSS"}
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
              ? `आपने शेयर ₹${investment.toLocaleString("en-IN", { maximumFractionDigits: 2 })} में खरीदे थे, जिनकी आज वैल्यू बढ़कर ₹${currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })} हो गई है।`
              : `शेयरों की खरीद लागत ₹${investment.toLocaleString("en-IN", { maximumFractionDigits: 2 })} थी, जो अभी ₹${currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })} पर चल रही है।`}
          </p>

          <div className="summary-clarity-breakdown">
            <div className="summary-breakdown-row">
              <span className="summary-breakdown-label">चल रहा मुनाफा/घाटा (Unrealized):</span>
              <span
                className="summary-breakdown-value"
                style={{ color: isProfit ? "var(--color-profit)" : "var(--color-loss)" }}
              >
                {isProfit ? "+" : ""}₹{unrealizedPnL.toFixed(2)} ({isProfit ? "+" : ""}{unrealizedPnLPercent}%)
              </span>
            </div>
            <div className="summary-breakdown-row">
              <span className="summary-breakdown-label">बेचकर बुक किया गया लाभ (Realized):</span>
              <span
                className="summary-breakdown-value"
                style={{ color: realizedPnL >= 0 ? "var(--color-profit)" : "var(--color-loss)" }}
              >
                {realizedPnL >= 0 ? "+" : ""}₹{realizedPnL.toFixed(2)}
              </span>
            </div>
            <div className="summary-breakdown-row" style={{ borderTop: "1px dashed var(--color-border)", paddingTop: "6px", marginTop: "2px" }}>
              <span className="summary-breakdown-label" style={{ fontWeight: "700", color: "var(--color-text-strong)" }}>
                नेट लाइफटाइम रिटर्न:
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

        {/* Question 3: अभी कितने ऑर्डर / शेयर खरीदे हुए हैं? */}
        <div className="summary-clarity-card">
          <div className="summary-clarity-card-header">
            <h3 className="summary-clarity-question">
              📦 3. अभी कितने शेयर खरीदे हैं?
            </h3>
            <span className="summary-clarity-badge">
              {holdings.length} कंपनियाँ
            </span>
          </div>

          <div className="summary-clarity-main-stat">
            {totalSharesCount} <span style={{ fontSize: "1.1rem", fontWeight: "600", color: "var(--color-text-muted)" }}>शेयर्स</span>
          </div>
          <p className="summary-clarity-explanation">
            आपके पोर्टफोलियो में कुल <b>{holdings.length} विभिन्न कंपनियों</b> के <b>{totalSharesCount} शेयर्स</b> खरीदे हुए रखे हैं।
          </p>

          <div className="summary-clarity-breakdown">
            <div className="summary-breakdown-row">
              <span className="summary-breakdown-label">डिलीवरी होल्डिंग्स (कंपनियाँ):</span>
              <span className="summary-breakdown-value">{holdings.length} स्टॉक्स</span>
            </div>
            <div className="summary-breakdown-row">
              <span className="summary-breakdown-label">पेंडिंग लिमिट ऑर्डर्स (Pending):</span>
              <span className="summary-breakdown-value" style={{ color: openOrders.length > 0 ? "var(--color-primary)" : "var(--color-text-muted)" }}>
                {openOrders.length} ऑर्डर्स
              </span>
            </div>
            <div className="summary-breakdown-row" style={{ borderTop: "1px dashed var(--color-border)", paddingTop: "6px", marginTop: "2px" }}>
              <span className="summary-breakdown-label" style={{ fontWeight: "700", color: "var(--color-text-strong)" }}>
                सफल निष्पादित ऑर्डर्स (Executed):
              </span>
              <span className="summary-breakdown-value" style={{ fontWeight: "800", color: "var(--color-profit)" }}>
                {executedOrders.length} ट्रेड्स
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Direct Active Holdings Table (खरीदे हुए शेयर - सीधे यहीं देखें) */}
      <div className="summary-holdings-card">
        <div className="summary-holdings-header">
          <div>
            <h3 className="summary-holdings-title">
              <Inventory2 style={{ color: "var(--color-primary)", fontSize: "1.3rem" }} />
              आपके खरीदे हुए शेयर (Your Active Holdings)
            </h3>
            <p className="summary-holdings-subtitle">
              यहाँ आपके सभी खरीदे हुए शेयर्स, खरीद भाव, लाइव कीमत और मुनाफा/घाटा लाइव दिखता है।
            </p>
          </div>

          <Link to="/holdings" className="summary-view-all-link">
            पूरी होल्डिंग्स लिस्ट देखें (View All)
            <ArrowForward style={{ fontSize: "1rem" }} />
          </Link>
        </div>

        {holdings.length > 0 ? (
          <div className="table-responsive">
            <table className="order-table">
              <thead>
                <tr>
                  <th>कंपनी (Stock)</th>
                  <th>मात्रा (Qty)</th>
                  <th>खरीद भाव (Avg Price)</th>
                  <th>लाइव भाव (Live LTP)</th>
                  <th>आज कुल कीमत (Current Value)</th>
                  <th>कुल मुनाफा / घाटा (P&amp;L)</th>
                  <th style={{ textAlign: "right" }}>चार्ट देखें</th>
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
                      <td style={{ fontWeight: "700" }}>{stock.qty} शेयर</td>
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
              आपने अभी तक कोई शेयर नहीं खरीदा है (No Holdings)
            </h4>
            <p style={{ margin: "0 0 16px 0", color: "var(--color-text-muted)", fontSize: "0.85rem", maxWidth: "450px", marginLeft: "auto", marginRight: "auto" }}>
              ट्रेडिंग शुरू करने के लिए बाईं ओर वॉचलिस्ट में से किसी भी कंपनी (जैसे Reliance, TCS, HDFC) पर क्लिक करें और <b>BUY</b> बटन दबाएं!
            </p>
            <button
              type="button"
              className="btn-summary-addfunds"
              onClick={() => setFundModalOpen(true)}
            >
              + वॉलेट में पैसे जोड़ें (Add Virtual Cash)
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
                📈 पोर्टफोलियो परफॉर्मेंस बनाम NIFTY 50
              </h4>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                आपका पोर्टफोलियो निफ्टी 50 इंडेक्स की तुलना में कैसा प्रदर्शन कर रहा है।
              </p>
            </div>
          </div>
          <BenchmarkChart portfolioValue={totalPortfolio} />
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h4 className="chart-card-title">
                🥧 सेक्टर विविधीकरण (Sector Allocation)
              </h4>
              <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                आपके पैसे अलग-अलग इंडस्ट्रीज (Banking, IT, Auto, etc.) में कैसे बंटे हुए हैं।
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