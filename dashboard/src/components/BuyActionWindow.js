import React, { useState, useContext, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import toast from "react-hot-toast";
import GeneralContext from "./GeneralContext";
import "./BuyActionWindow.css";
import { getLivePrice } from "../utils/liveMarket";
import { getAuthHeader } from "../utils/auth";
import { sound } from "../utils/sound";

const BuyActionWindow = ({ uid, type }) => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  // Quantity & Price
  const [qty, setQty] = useState(1);
  const [marketPrice, setMarketPrice] = useState(0);
  const [limitPrice, setLimitPrice] = useState(0);

  // Order Mode & Execution Type
  const [product, setProduct] = useState("CNC"); // CNC (Delivery) or MIS (Intraday)
  const [orderType, setOrderType] = useState("MARKET"); // MARKET or LIMIT

  // GTT (Good Till Triggered) Stop-Loss & Target
  const [enableGTT, setEnableGTT] = useState(false);
  const [stopLoss, setStopLoss] = useState("");
  const [target, setTarget] = useState("");

  const [loading, setLoading] = useState(false);

  const { closeWindow } = useContext(GeneralContext);

  // Sync with live price
  useEffect(() => {
    const live = getLivePrice(uid);
    if (live) {
      setMarketPrice(live);
      setLimitPrice(live);
      // Default GTT values: SL = -2%, Target = +5%
      setStopLoss((live * 0.98).toFixed(2));
      setTarget((live * 1.05).toFixed(2));
    } else {
      axios
        .get(`${API}/allHoldings`, { headers: getAuthHeader() })
        .then((res) => {
          const stock = res.data.find((s) => s.name === uid);
          if (stock) {
            setMarketPrice(stock.price);
            setLimitPrice(stock.price);
            setStopLoss((stock.price * 0.98).toFixed(2));
            setTarget((stock.price * 1.05).toFixed(2));
          }
        })
        .catch((err) => console.log(err));
    }
  }, [uid, API]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeWindow();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeWindow]);

  // Adjust limit price by percent
  const adjustLimitPrice = (percentDelta) => {
    const adjusted = marketPrice * (1 + percentDelta / 100);
    setLimitPrice(Number(adjusted.toFixed(2)));
  };

  const effectivePrice = orderType === "LIMIT" ? limitPrice : marketPrice;
  const marginRequired = Number(qty) * Number(effectivePrice) || 0;

  const handleSubmit = async () => {
    if (!qty || Number(qty) <= 0) {
      toast.error("Please enter a valid quantity ❌");
      return;
    }

    if (orderType === "LIMIT" && (!limitPrice || Number(limitPrice) <= 0)) {
      toast.error("Please enter a valid limit price ❌");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: uid,
        qty: Number(qty),
        price: Number(effectivePrice),
        mode: type,
        product,
        orderType,
        limitPrice: orderType === "LIMIT" ? Number(limitPrice) : undefined,
        stopLoss: enableGTT && stopLoss ? Number(stopLoss) : null,
        target: enableGTT && target ? Number(target) : null,
      };

      const res = await axios.post(`${API}/newOrder`, payload, {
        headers: getAuthHeader(),
      });

      // Play joyful execution chime!
      sound.playTradeChime();

      if (orderType === "LIMIT") {
        toast.success(
          `Limit ${type} Order for ${qty}x ${uid} placed at ₹${Number(limitPrice).toFixed(2)} (OPEN) 🎯`,
          {
            style: {
              background: "#387ED1",
              color: "#fff",
              fontWeight: "600",
            },
          }
        );
      } else if (type === "SELL") {
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
        toast.success(
          `Bought ${qty} shares of ${uid} at ₹${Number(marketPrice).toFixed(2)} ✅`,
          {
            style: {
              background: "var(--color-profit)",
              color: "#fff",
              fontWeight: "600",
            },
          }
        );
      }

      closeWindow();
    } catch (err) {
      toast.error(err.response?.data?.message || "Order execution failed");
    } finally {
      setLoading(false);
    }
  };

  const isBuy = type === "BUY";

  const modalContent = (
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
            <p className="buy-stock-sub">
              NSE • {orderType === "LIMIT" ? "Limit Order" : "Market Order"}
            </p>
          </div>
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: "700",
              color: isBuy ? "var(--color-primary)" : "var(--color-loss)",
              background: isBuy
                ? "var(--color-primary-light)"
                : "var(--color-loss-soft)",
              padding: "4px 10px",
              borderRadius: "var(--radius-pill)",
            }}
          >
            LTP: ₹{Number(marketPrice).toFixed(2)}
          </span>
        </div>

        {/* Body */}
        <div className="buy-modal-body">
          {/* Dual Segmented Controls: Product & Order Type */}
          <div className="order-controls-row">
            {/* Product Type (CNC / MIS) */}
            <div className="order-type-tabs">
              <button
                type="button"
                className={`order-tab-btn ${product === "CNC" ? "active" : ""}`}
                onClick={() => setProduct("CNC")}
              >
                CNC (Delivery)
              </button>
              <button
                type="button"
                className={`order-tab-btn ${product === "MIS" ? "active" : ""}`}
                onClick={() => setProduct("MIS")}
              >
                MIS (Intraday)
              </button>
            </div>

            {/* Execution Type (Market / Limit) */}
            <div className="order-type-tabs">
              <button
                type="button"
                className={`order-tab-btn ${orderType === "MARKET" ? "active" : ""}`}
                onClick={() => setOrderType("MARKET")}
              >
                Market ⚡
              </button>
              <button
                type="button"
                className={`order-tab-btn ${orderType === "LIMIT" ? "active" : ""}`}
                onClick={() => setOrderType("LIMIT")}
              >
                Limit 🎯
              </button>
            </div>
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
              <label className="input-label">
                {orderType === "LIMIT" ? "Limit Price (₹)" : "Market Price (₹)"}
                {orderType === "MARKET" && (
                  <span className="input-label-badge">LIVE</span>
                )}
              </label>
              <input
                type="number"
                min="0.05"
                step="0.05"
                className="trade-input"
                disabled={orderType === "MARKET"}
                value={orderType === "LIMIT" ? limitPrice : marketPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
              />
              {orderType === "LIMIT" && (
                <div className="price-quick-tags">
                  <button
                    type="button"
                    className="quick-tag-btn"
                    onClick={() => adjustLimitPrice(-2)}
                  >
                    -2%
                  </button>
                  <button
                    type="button"
                    className="quick-tag-btn"
                    onClick={() => adjustLimitPrice(-1)}
                  >
                    -1%
                  </button>
                  <button
                    type="button"
                    className="quick-tag-btn"
                    onClick={() => adjustLimitPrice(1)}
                  >
                    +1%
                  </button>
                  <button
                    type="button"
                    className="quick-tag-btn"
                    onClick={() => adjustLimitPrice(2)}
                  >
                    +2%
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stop-Loss & Target (GTT) Section */}
          <div className="gtt-section-box">
            <div
              className="gtt-header-toggle"
              onClick={() => setEnableGTT(!enableGTT)}
            >
              <span className="gtt-header-title">
                🛡️ Set Stop-Loss &amp; Target (GTT)
              </span>
              <label className="gtt-switch" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={enableGTT}
                  onChange={(e) => setEnableGTT(e.target.checked)}
                />
                <span className="gtt-slider"></span>
              </label>
            </div>

            {enableGTT && (
              <div className="gtt-fields-grid">
                <div className="input-box-wrapper">
                  <label className="input-label" style={{ color: "var(--color-loss)" }}>
                    Stop-Loss Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0.05"
                    step="0.05"
                    className="trade-input"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    placeholder="e.g. 1450"
                  />
                  <div className="price-quick-tags">
                    <button
                      type="button"
                      className="quick-tag-btn"
                      onClick={() =>
                        setStopLoss((marketPrice * 0.98).toFixed(2))
                      }
                    >
                      -2%
                    </button>
                    <button
                      type="button"
                      className="quick-tag-btn"
                      onClick={() =>
                        setStopLoss((marketPrice * 0.95).toFixed(2))
                      }
                    >
                      -5%
                    </button>
                  </div>
                </div>

                <div className="input-box-wrapper">
                  <label className="input-label" style={{ color: "var(--color-profit)" }}>
                    Target Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0.05"
                    step="0.05"
                    className="trade-input"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="e.g. 1650"
                  />
                  <div className="price-quick-tags">
                    <button
                      type="button"
                      className="quick-tag-btn"
                      onClick={() =>
                        setTarget((marketPrice * 1.05).toFixed(2))
                      }
                    >
                      +5%
                    </button>
                    <button
                      type="button"
                      className="quick-tag-btn"
                      onClick={() =>
                        setTarget((marketPrice * 1.10).toFixed(2))
                      }
                    >
                      +10%
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Margin Calculation */}
          <div className="margin-info-box">
            <span className="margin-label">
              {orderType === "LIMIT" ? "Margin Required (Limit):" : "Margin Required (Market):"}
            </span>
            <span className="margin-amount">
              ₹
              {marginRequired.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
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
                : orderType === "LIMIT"
                ? `Place Limit ${isBuy ? "BUY" : "SELL"}`
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

  return ReactDOM.createPortal(modalContent, document.body);
};

export default BuyActionWindow;