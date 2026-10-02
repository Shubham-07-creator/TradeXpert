import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import GeneralContext from "./GeneralContext";
import "./BuyActionWindow.css";
import { getLivePrice } from "../utils/liveMarket";
import { getAuthHeader } from "../utils/auth";

const BuyActionWindow = ({ uid, type }) => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);
  const [orderType, setOrderType] = useState("MIS"); // MIS (Intraday) or CNC (Delivery)
  const [loading, setLoading] = useState(false);

  const { closeWindow } = useContext(GeneralContext);

  useEffect(() => {
    const livePrice = getLivePrice(uid);
    if (livePrice) {
      setPrice(livePrice);
    } else {
      axios
        .get(`${API}/allHoldings`, { headers: getAuthHeader() })
        .then((res) => {
          const stock = res.data.find((s) => s.name === uid);
          if (stock) setPrice(stock.price);
        })
        .catch((err) => console.log(err));
    }
  }, [uid, API]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeWindow();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeWindow]);

  const handleSubmit = async () => {
    if (!qty || Number(qty) <= 0) {
      toast.error("Please enter a valid quantity ❌");
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error("Please enter a valid price ❌");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${API}/newOrder`,
        {
          name: uid,
          qty: Number(qty),
          price: Number(price),
          mode: type,
          product: orderType,
        },
        { headers: getAuthHeader() }
      );

      if (type === "SELL") {
        const gain = res.data.realizedPnL || 0;
        const gainText =
          gain >= 0
            ? `Sold ${qty} shares of ${uid} ✅ — Profit ₹${gain.toFixed(2)}`
            : `Sold ${qty} shares of ${uid} ✅ — Loss ₹${Math.abs(gain).toFixed(2)}`;

        toast.success(gainText, {
          style: {
            background: gain >= 0 ? "#00D09C" : "#EF4444",
            color: "#fff",
            fontWeight: "600",
          },
        });
      } else {
        toast.success(`Bought ${qty} shares of ${uid} at ₹${Number(price).toFixed(2)} ✅`, {
          style: {
            background: "#00D09C",
            color: "#fff",
            fontWeight: "600",
          },
        });
      }

      closeWindow();
    } catch (err) {
      toast.error(err.response?.data?.message || "Order execution failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const isBuy = type === "BUY";
  const marginRequired = Number(qty) * Number(price) || 0;

  return (
    <div className="buy-modal-overlay" onClick={closeWindow}>
      <div
        className="buy-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={`buy-modal-header ${isBuy ? "buy" : "sell"}`}>
          <div>
            <h3 className="buy-stock-title">
              {isBuy ? "BUY" : "SELL"} {uid}
            </h3>
            <p className="buy-stock-sub">NSE • Market Order Execution</p>
          </div>
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: "700",
              color: isBuy ? "var(--color-primary)" : "var(--color-loss)",
              background: isBuy ? "var(--color-primary-light)" : "var(--color-loss-soft)",
              padding: "4px 10px",
              borderRadius: "var(--radius-pill)",
            }}
          >
            LTP: ₹{Number(price).toFixed(2)}
          </span>
        </div>

        {/* Body */}
        <div className="buy-modal-body">
          {/* Segmented Product Tabs */}
          <div className="order-type-tabs">
            <button
              type="button"
              className={`order-tab-btn ${orderType === "CNC" ? "active" : ""}`}
              onClick={() => setOrderType("CNC")}
            >
              CNC (Delivery / Long-term)
            </button>
            <button
              type="button"
              className={`order-tab-btn ${orderType === "MIS" ? "active" : ""}`}
              onClick={() => setOrderType("MIS")}
            >
              MIS (Intraday)
            </button>
          </div>

          {/* Quantity & Price Inputs */}
          <div className="input-field-group">
            <div className="input-box-wrapper">
              <label className="input-label">Quantity</label>
              <input
                type="number"
                min="1"
                step="1"
                className="trade-input"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                autoFocus
              />
            </div>

            <div className="input-box-wrapper">
              <label className="input-label">Order Price (₹)</label>
              <input
                type="number"
                min="0.05"
                step="0.05"
                className="trade-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Live Margin Calculation */}
          <div className="margin-info-box">
            <span className="margin-label">Margin Required:</span>
            <span className="margin-amount">
              ₹{marginRequired.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Actions */}
          <div className="buy-modal-actions">
            <button
              type="button"
              disabled={loading}
              className={`btn-execute ${isBuy ? "buy" : "sell"}`}
              onClick={handleSubmit}
            >
              {loading
                ? "Placing order..."
                : `${isBuy ? "BUY" : "SELL"} ${uid}`}
            </button>

            <button
              type="button"
              className="btn-cancel"
              onClick={closeWindow}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;