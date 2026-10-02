import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { VerticalGraph } from "./VerticalGraph";
import { getAuthHeader } from "../utils/auth";
import { getSnapshot, subscribeToLiveMarket } from "../utils/liveMarket";

const buildLiveMap = (snapshot) => {
  const map = {};
  snapshot.forEach((s) => {
    map[s.name] = s;
  });
  return map;
};

const Holdings = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";
  const [allHoldings, setAllHoldings] = useState([]);
  const [liveMap, setLiveMap] = useState(() => buildLiveMap(getSnapshot()));
  const [hover, setHover] = useState(null);

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
      const res = await axios.get(`${API}/allHoldings`, {
        headers: getAuthHeader(),
      });
      setAllHoldings(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSell = async (stock) => {
    const live = liveMap[stock.name];
    const sellPrice = live ? live.price : stock.price;

    try {
      const res = await axios.post(
        `${API}/newOrder`,
        {
          name: stock.name,
          qty: stock.qty,
          price: sellPrice,
          mode: "SELL",
        },
        { headers: getAuthHeader() }
      );

      const gain = res.data.realizedPnL || 0;
      const gainText =
        gain >= 0
          ? `Sold ${stock.name} ✅ — Profit ₹${gain.toFixed(2)}`
          : `Sold ${stock.name} ✅ — Loss ₹${Math.abs(gain).toFixed(2)}`;

      toast.success(gainText, {
        style: {
          background: gain >= 0 ? "#00D09C" : "#EF4444",
          color: "#fff",
          fontWeight: "600",
        },
      });

      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Sell failed ❌");
    }
  };

  const totalInvestment = allHoldings.reduce((acc, h) => acc + h.avg * h.qty, 0);
  const totalCurrentValue = allHoldings.reduce((acc, h) => {
    const live = liveMap[h.name];
    const price = live ? live.price : h.price;
    return acc + price * h.qty;
  }, 0);
  const totalPnL = totalCurrentValue - totalInvestment;
  const totalPnLPercent = totalInvestment
    ? ((totalPnL / totalInvestment) * 100).toFixed(2)
    : "0.00";
  const isTotalProfit = totalPnL >= 0;

  return (
    <div className="fade-up">
      {/* Page Header */}
      <div className="section-header">
        <div>
          <h2 className="page-title">Portfolio Holdings ({allHoldings.length})</h2>
          <p className="page-subtitle">
            Long-term delivery positions held in your virtual account.
          </p>
        </div>
      </div>

      {/* Summary KPI Strip */}
      {allHoldings.length > 0 && (
        <div className="stats-card-grid" style={{ marginBottom: "20px" }}>
          <div className="stat-card" style={{ padding: "16px 20px" }}>
            <div className="stat-card-label">Total Investment</div>
            <div className="stat-card-value" style={{ fontSize: "1.5rem" }}>
              ₹{totalInvestment.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="stat-card" style={{ padding: "16px 20px" }}>
            <div className="stat-card-label">Current Value</div>
            <div className="stat-card-value" style={{ fontSize: "1.5rem" }}>
              ₹{totalCurrentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="stat-card" style={{ padding: "16px 20px" }}>
            <div className="stat-card-label">Overall Return</div>
            <div
              className="stat-card-value"
              style={{
                fontSize: "1.5rem",
                color: isTotalProfit ? "var(--color-profit)" : "var(--color-loss)",
              }}
            >
              {isTotalProfit ? "+" : ""}₹{totalPnL.toFixed(2)} ({isTotalProfit ? "+" : ""}{totalPnLPercent}%)
            </div>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className="table-card">
        {allHoldings.length > 0 ? (
          <div className="table-responsive">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th>Qty</th>
                  <th>Avg. Cost</th>
                  <th>LTP (Live)</th>
                  <th>Cur. Value</th>
                  <th>Unrealized P&L</th>
                  <th>Net Chg</th>
                  <th>Day Chg</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {allHoldings.map((stock, i) => {
                  const live = liveMap[stock.name];
                  const price = live ? live.price : stock.price;
                  const value = price * stock.qty;
                  const pnl = value - stock.avg * stock.qty;
                  const isProfit = pnl >= 0;
                  const netPercent = ((price - stock.avg) / stock.avg) * 100;
                  const dayLabel = live ? live.percent : stock.day || "0.00%";
                  const isDayDown = live ? live.isDown : false;

                  return (
                    <tr
                      key={i}
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(null)}
                    >
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: "700", color: "var(--color-text-strong)" }}>
                            {stock.name}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "var(--color-text-faint)" }}>
                            NSE • Delivery
                          </span>
                        </div>
                      </td>

                      <td style={{ fontWeight: "600" }}>{stock.qty}</td>
                      <td>₹{stock.avg.toFixed(2)}</td>
                      <td style={{ fontWeight: "700" }}>₹{price.toFixed(2)}</td>
                      <td style={{ fontWeight: "600" }}>₹{value.toFixed(2)}</td>

                      <td>
                        <span
                          className={`pnl-pill ${isProfit ? "profit" : "loss"}`}
                        >
                          {isProfit ? "+" : ""}₹{pnl.toFixed(2)}
                        </span>
                      </td>

                      <td style={{ fontWeight: "600", color: netPercent >= 0 ? "var(--color-profit)" : "var(--color-loss)" }}>
                        {netPercent >= 0 ? "+" : ""}{netPercent.toFixed(2)}%
                      </td>

                      <td>
                        <span
                          className={`index-percent ${isDayDown ? "down" : "up"}`}
                        >
                          {dayLabel}
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <button
                          style={{
                            background: "var(--color-loss)",
                            color: "#fff",
                            border: "none",
                            padding: "6px 14px",
                            borderRadius: "var(--radius-sm)",
                            fontWeight: "600",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            opacity: hover === i ? 1 : 0.85,
                          }}
                          onClick={() => handleSell(stock)}
                          title={`Sell all ${stock.qty} shares of ${stock.name}`}
                        >
                          Sell
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">💼</div>
            <h4 className="empty-state-title">No Holdings Yet</h4>
            <p className="empty-state-text">
              You haven't bought any delivery stocks yet. Search stocks in the
              watchlist on the left and click <b>BUY</b> to build your portfolio!
            </p>
          </div>
        )}
      </div>

      {/* Holdings Distribution Chart */}
      {allHoldings.length > 0 && (
        <div className="chart-card" style={{ marginTop: "24px" }}>
          <div className="chart-card-header">
            <h4 className="chart-card-title">Holdings Price Distribution</h4>
          </div>
          <VerticalGraph
            data={{
              labels: allHoldings.map((s) => s.name),
              datasets: [
                {
                  label: "Market Price (₹)",
                  data: allHoldings.map((s) =>
                    liveMap[s.name] ? liveMap[s.name].price : s.price
                  ),
                  backgroundColor: "rgba(56, 126, 209, 0.75)",
                  borderColor: "#387ED1",
                  borderWidth: 1.5,
                  borderRadius: 6,
                },
              ],
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Holdings;