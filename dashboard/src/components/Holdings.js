import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ShowChart, ShieldOutlined } from "@mui/icons-material";
import { VerticalGraph } from "./VerticalGraph";
import { getAuthHeader } from "../utils/auth";
import { getSnapshot, subscribeToLiveMarket } from "../utils/liveMarket";
import GeneralContext from "./GeneralContext";
import { socket } from "../utils/socket";
import { sound } from "../utils/sound";
import ConfirmModal from "./ConfirmModal";

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
  const [gttModalHolding, setGttModalHolding] = useState(null);
  const [slInput, setSlInput] = useState("");
  const [targetInput, setTargetInput] = useState("");
  const [savingGtt, setSavingGtt] = useState(false);
  const [confirmSellStock, setConfirmSellStock] = useState(null);

  const generalContext = useContext(GeneralContext);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/allHoldings`, {
        headers: getAuthHeader(),
      });
      setAllHoldings(res.data || []);
    } catch (err) {
      console.log(err);
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

  // Listen for GTT trigger events from server
  useEffect(() => {
    const handleGtt = (data) => {
      sound.playAlertChime();
      fetchData();
      const isSL = data.type === "STOP_LOSS";
      toast(
        `${isSL ? "🛑 Stop-Loss Triggered" : "🎉 Target Achieved"}: Auto-sold ${data.qty}x ${data.name} at ₹${Number(data.price).toFixed(2)}`,
        {
          style: {
            background: isSL ? "#EF4444" : "#00D09C",
            color: "#fff",
            fontWeight: "600",
          },
        }
      );
    };

    socket.on("gtt:triggered", handleGtt);
    return () => socket.off("gtt:triggered", handleGtt);
  }, [fetchData]);

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
          product: "CNC",
        },
        { headers: getAuthHeader() }
      );

      sound.playTradeChime();

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

  const openGttModal = (holding) => {
    setGttModalHolding(holding);
    const live = liveMap[holding.name];
    const currentPrice = live ? live.price : holding.price;
    setSlInput(holding.stopLoss ? String(holding.stopLoss) : (currentPrice * 0.98).toFixed(2));
    setTargetInput(holding.target ? String(holding.target) : (currentPrice * 1.05).toFixed(2));
  };

  const handleSaveGTT = async () => {
    if (!gttModalHolding) return;

    try {
      setSavingGtt(true);
      await axios.put(
        `${API}/holdings/gtt/${gttModalHolding._id}`,
        {
          stopLoss: slInput ? Number(slInput) : null,
          target: targetInput ? Number(targetInput) : null,
        },
        { headers: getAuthHeader() }
      );

      toast.success(`GTT rules updated for ${gttModalHolding.name} 🛡️`);
      setGttModalHolding(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update GTT ❌");
    } finally {
      setSavingGtt(false);
    }
  };

  const handleClearGTT = async () => {
    if (!gttModalHolding) return;

    try {
      setSavingGtt(true);
      await axios.put(
        `${API}/holdings/gtt/${gttModalHolding._id}`,
        { stopLoss: null, target: null },
        { headers: getAuthHeader() }
      );

      toast.success(`GTT rules cleared for ${gttModalHolding.name}`);
      setGttModalHolding(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to clear GTT");
    } finally {
      setSavingGtt(false);
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
            Long-term delivery positions with live GTT Stop-Loss &amp; Target triggers.
          </p>
        </div>
      </div>

      {/* Summary KPI Strip */}
      {allHoldings.length > 0 && (
        <div className="stats-card-grid" style={{ marginBottom: "20px" }}>
          <div className="stat-card" style={{ padding: "16px 20px" }}>
            <div className="stat-card-label">Total Invested</div>
            <div className="stat-card-value" style={{ fontSize: "1.5rem" }}>
              ₹{totalInvestment.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <div className="stat-card-sub">Total cost basis of all holdings</div>
          </div>
          <div className="stat-card" style={{ padding: "16px 20px" }}>
            <div className="stat-card-label">Current Value</div>
            <div className="stat-card-value" style={{ fontSize: "1.5rem" }}>
              ₹{totalCurrentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </div>
            <div className="stat-card-sub">Live liquidation value at current LTP</div>
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
            <div className="stat-card-sub">{isTotalProfit ? "🟢 Portfolio in profit" : "🔴 Portfolio in loss"}</div>
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
                  <th>Unrealized P&amp;L</th>
                  <th>Net Chg</th>
                  <th>GTT (SL / Target)</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
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

                  return (
                    <tr
                      key={stock._id || i}
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(null)}
                    >
                      <td>
                        <div
                          style={{ display: "flex", flexDirection: "column", cursor: "pointer" }}
                          onClick={() => generalContext.openChartModal(stock.name)}
                          title={`Click to view ${stock.name} interactive chart`}
                        >
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

                      {/* GTT Status & Configuration */}
                      <td>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                          }}
                          onClick={() => openGttModal(stock)}
                          title="Click to set or modify Stop-Loss & Target"
                        >
                          {stock.stopLoss || stock.target ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              {stock.stopLoss && (
                                <span
                                  style={{
                                    fontSize: "0.72rem",
                                    fontWeight: "700",
                                    color: "var(--color-loss)",
                                    background: "var(--color-loss-soft)",
                                    padding: "2px 6px",
                                    borderRadius: "var(--radius-pill)",
                                  }}
                                >
                                  SL: ₹{Number(stock.stopLoss).toFixed(2)}
                                </span>
                              )}
                              {stock.target && (
                                <span
                                  style={{
                                    fontSize: "0.72rem",
                                    fontWeight: "700",
                                    color: "var(--color-profit)",
                                    background: "var(--color-profit-soft)",
                                    padding: "2px 6px",
                                    borderRadius: "var(--radius-pill)",
                                  }}
                                >
                                  Tgt: ₹{Number(stock.target).toFixed(2)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              style={{
                                background: "var(--color-bg-subtle)",
                                border: "1px dashed var(--color-border)",
                                color: "var(--color-text-muted)",
                                padding: "4px 8px",
                                borderRadius: "var(--radius-sm)",
                                fontSize: "0.74rem",
                                fontWeight: "600",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <ShieldOutlined style={{ fontSize: "0.85rem" }} />
                              + GTT
                            </button>
                          )}
                        </div>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          {/* Chart Button */}
                          <button
                            type="button"
                            onClick={() => generalContext.openChartModal(stock.name)}
                            style={{
                              background: "var(--color-bg-base)",
                              border: "1px solid var(--color-border)",
                              color: "var(--color-primary)",
                              padding: "5px 8px",
                              borderRadius: "var(--radius-sm)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                            }}
                            title="Interactive Chart"
                          >
                            <ShowChart style={{ fontSize: "1rem" }} />
                          </button>

                          {/* Quick Sell Button */}
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
                            onClick={() => setConfirmSellStock(stock)}
                            title={`Sell all ${stock.qty} shares of ${stock.name}`}
                          >
                            Sell
                          </button>
                        </div>
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

      {/* GTT Edit Modal */}
      {gttModalHolding && (
        <div
          className="buy-modal-overlay"
          onClick={() => setGttModalHolding(null)}
        >
          <div
            className="buy-modal-card"
            style={{ maxWidth: "420px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="buy-modal-header buy">
              <div>
                <h3 className="buy-stock-title">
                  Set GTT: {gttModalHolding.name}
                </h3>
                <p className="buy-stock-sub">
                  Auto-exit position on Stop-Loss breach or Target reach
                </p>
              </div>
            </div>

            <div className="buy-modal-body">
              <div style={{ marginBottom: "16px" }}>
                <label className="input-label" style={{ color: "var(--color-loss)", marginBottom: "6px" }}>
                  Stop-Loss Price (₹)
                </label>
                <input
                  type="number"
                  step="0.05"
                  className="trade-input"
                  value={slInput}
                  onChange={(e) => setSlInput(e.target.value)}
                  placeholder="e.g. 1450"
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label className="input-label" style={{ color: "var(--color-profit)", marginBottom: "6px" }}>
                  Target Price (₹)
                </label>
                <input
                  type="number"
                  step="0.05"
                  className="trade-input"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="e.g. 1650"
                />
              </div>

              <div className="buy-modal-actions">
                <button
                  type="button"
                  disabled={savingGtt}
                  className="btn-execute buy"
                  onClick={handleSaveGTT}
                >
                  {savingGtt ? "Saving..." : "Save GTT Rules"}
                </button>

                {(gttModalHolding.stopLoss || gttModalHolding.target) && (
                  <button
                    type="button"
                    disabled={savingGtt}
                    className="btn-cancel"
                    style={{ color: "var(--color-loss)", borderColor: "var(--color-loss)" }}
                    onClick={handleClearGTT}
                  >
                    Clear
                  </button>
                )}

                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setGttModalHolding(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Confirmation Modal for Selling Delivery Holdings */}
      <ConfirmModal
        isOpen={!!confirmSellStock}
        title={`Sell ${confirmSellStock?.name}?`}
        message={`Are you sure you want to sell all ${confirmSellStock?.qty} shares of ${confirmSellStock?.name} at current LTP of ₹${(liveMap[confirmSellStock?.name]?.price || confirmSellStock?.price || 0).toFixed(2)}?`}
        icon="📉"
        confirmText="Confirm Sell"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={() => {
          const s = confirmSellStock;
          setConfirmSellStock(null);
          handleSell(s);
        }}
        onCancel={() => setConfirmSellStock(null)}
      />
    </div>
  );
};

export default Holdings;