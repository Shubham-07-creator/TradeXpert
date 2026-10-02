import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ShowChart } from "@mui/icons-material";
import { getAuthHeader } from "../utils/auth";
import { getSnapshot, subscribeToLiveMarket } from "../utils/liveMarket";
import GeneralContext from "./GeneralContext";
import ConfirmModal from "./ConfirmModal";

const buildLiveMap = (snapshot) => {
  const map = {};
  snapshot.forEach((s) => {
    map[s.name] = s;
  });
  return map;
};

const Positions = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";
  const [allPositions, setAllPositions] = useState([]);
  const [liveMap, setLiveMap] = useState(() => buildLiveMap(getSnapshot()));
  const [hover, setHover] = useState(null);
  const [confirmExitPos, setConfirmExitPos] = useState(null);
  const generalContext = useContext(GeneralContext);

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
      const res = await axios.get(`${API}/allPositions`, {
        headers: getAuthHeader(),
      });
      setAllPositions(res.data || []);
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
          ? `Square off ${stock.name} ✅ — Profit ₹${gain.toFixed(2)}`
          : `Square off ${stock.name} ✅ — Loss ₹${Math.abs(gain).toFixed(2)}`;

      toast.success(gainText, {
        style: {
          background: gain >= 0 ? "#00D09C" : "#EF4444",
          color: "#fff",
          fontWeight: "600",
        },
      });

      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Square off failed ❌");
    }
  };

  const totalPositionsPnL = allPositions.reduce((acc, stock) => {
    const live = liveMap[stock.name];
    const price = live ? live.price : stock.price;
    return acc + (price - stock.avg) * stock.qty;
  }, 0);
  const isPositionsProfit = totalPositionsPnL >= 0;

  return (
    <div className="fade-up">
      {/* Page Header */}
      <div className="section-header">
        <div>
          <h2 className="page-title">Open Positions ({allPositions.length})</h2>
          <p className="page-subtitle">
            Intraday and F&amp;O active trading positions.
          </p>
        </div>
        {allPositions.length > 0 && (
          <div>
            <span
              className={`pnl-pill ${isPositionsProfit ? "profit" : "loss"}`}
              style={{ fontSize: "0.95rem", padding: "6px 14px" }}
            >
              Net P&amp;L: {isPositionsProfit ? "+" : ""}₹{totalPositionsPnL.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Positions Table */}
      <div className="table-card">
        {allPositions.length > 0 ? (
          <div className="table-responsive">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Instrument</th>
                  <th>Qty</th>
                  <th>Avg. Cost</th>
                  <th>LTP (Live)</th>
                  <th>P&amp;L</th>
                  <th>Day Chg</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {allPositions.map((stock, i) => {
                  const live = liveMap[stock.name];
                  const price = live ? live.price : stock.price;
                  const pnl = (price - stock.avg) * stock.qty;
                  const isProfit = pnl >= 0;
                  const chgLabel = live ? live.percent : stock.chg || "0.00%";
                  const isDown = live ? live.isDown : false;

                  return (
                    <tr
                      key={i}
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(null)}
                    >
                      <td>
                        <span
                          style={{
                            background: "var(--color-bg-subtle)",
                            color: "var(--color-primary)",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                          }}
                        >
                          {stock.product || "MIS"}
                        </span>
                      </td>

                      <td>
                        <div
                          style={{ cursor: "pointer" }}
                          onClick={() => generalContext.openChartModal(stock.name)}
                          title={`Click to view ${stock.name} interactive chart`}
                        >
                          <span style={{ fontWeight: "700", color: "var(--color-text-strong)" }}>
                            {stock.name}
                          </span>
                        </div>
                      </td>

                      <td style={{ fontWeight: "600" }}>{stock.qty}</td>
                      <td>₹{stock.avg.toFixed(2)}</td>
                      <td style={{ fontWeight: "700" }}>₹{price.toFixed(2)}</td>

                      <td>
                        <span className={`pnl-pill ${isProfit ? "profit" : "loss"}`}>
                          {isProfit ? "+" : ""}₹{pnl.toFixed(2)}
                        </span>
                      </td>

                      <td>
                        <span className={`index-percent ${isDown ? "down" : "up"}`}>
                          {chgLabel}
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
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
                            onClick={() => setConfirmExitPos(stock)}
                            title={`Square off ${stock.name}`}
                          >
                            Exit
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
            <div className="empty-state-icon">📊</div>
            <h4 className="empty-state-title">No Open Positions</h4>
            <p className="empty-state-text">
              You don't have any open intraday positions today. Any MIS or
              short-term orders you place will appear here in real-time.
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Squaring Off Positions */}
      <ConfirmModal
        isOpen={!!confirmExitPos}
        title={`Square off ${confirmExitPos?.name}?`}
        message={`Are you sure you want to exit your ${confirmExitPos?.product || "MIS"} position of ${confirmExitPos?.qty} shares of ${confirmExitPos?.name} at current LTP of ₹${(liveMap[confirmExitPos?.name]?.price || confirmExitPos?.price || 0).toFixed(2)}?`}
        icon="⚡"
        confirmText="Square Off"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={() => {
          const p = confirmExitPos;
          setConfirmExitPos(null);
          handleSell(p);
        }}
        onCancel={() => setConfirmExitPos(null)}
      />
    </div>
  );
};

export default Positions;