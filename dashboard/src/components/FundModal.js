import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  AddCircleOutline,
  RemoveCircleOutline,
  Close as CloseIcon,
  CheckCircle,
} from "@mui/icons-material";
import { getAuthHeader } from "../utils/auth";
import { sound } from "../utils/sound";
import "./FundModal.css";

const DEPOSIT_PRESETS = [5000, 10000, 25000, 50000, 100000];
const WITHDRAW_PRESETS = [5000, 10000, 25000, 50000];

const FundModal = ({ isOpen, onClose, initialMode = "DEPOSIT", walletBalance = 0, onSuccess }) => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";
  const [mode, setMode] = useState(initialMode);
  const [amount, setAmount] = useState(mode === "DEPOSIT" ? "50000" : "10000");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setAmount(initialMode === "DEPOSIT" ? "50000" : Math.min(walletBalance, 10000).toString());
  }, [initialMode, walletBalance]);

  // ESC key support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDeposit = mode === "DEPOSIT";
  const numAmount = Number(amount) || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!numAmount || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!isDeposit && numAmount > walletBalance) {
      toast.error(`Insufficient balance. Maximum withdrawable: ₹${walletBalance.toLocaleString("en-IN")}`);
      return;
    }

    try {
      setLoading(true);
      const endpoint = isDeposit ? `${API}/wallet/add` : `${API}/wallet/withdraw`;

      await axios.post(
        endpoint,
        { amount: numAmount },
        { headers: getAuthHeader() }
      );

      sound.playTradeChime();

      if (isDeposit) {
        toast.success(`₹${numAmount.toLocaleString("en-IN")} added to wallet successfully`);
      } else {
        toast.success(`₹${numAmount.toLocaleString("en-IN")} withdrawn successfully`);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fund-modal-overlay" onClick={onClose}>
      <div
        className="fund-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {/* Header */}
        <div className={`fund-modal-header ${isDeposit ? "deposit" : "withdraw"}`}>
          <div>
            <h3 className="fund-modal-title">
              {isDeposit ? "Add Virtual Trading Cash" : "Withdraw Available Cash"}
            </h3>
            <p className="fund-modal-sub">
              {isDeposit
                ? "Top-up instant virtual margin for practice trading"
                : "Transfer available trading balance back to simulated bank"}
            </p>
          </div>
          <button
            type="button"
            className="btn-chart-close"
            onClick={onClose}
            title="Close"
          >
            <CloseIcon style={{ fontSize: "1.1rem" }} />
          </button>
        </div>

        {/* Body */}
        <div className="fund-modal-body">
          {/* Segmented Mode Switcher */}
          <div className="fund-mode-tabs">
            <button
              type="button"
              className={`fund-mode-btn ${isDeposit ? "active deposit" : ""}`}
              onClick={() => {
                setMode("DEPOSIT");
                setAmount("50000");
              }}
            >
              <AddCircleOutline style={{ fontSize: "1rem" }} />
              Deposit Cash
            </button>
            <button
              type="button"
              className={`fund-mode-btn ${!isDeposit ? "active withdraw" : ""}`}
              onClick={() => {
                setMode("WITHDRAW");
                setAmount(Math.min(walletBalance, 10000).toString());
              }}
            >
              <RemoveCircleOutline style={{ fontSize: "1rem" }} />
              Withdraw
            </button>
          </div>

          {/* Current Available Balance Strip */}
          <div className="fund-balance-strip">
            <span className="fund-balance-label">Available Trading Margin:</span>
            <span className="fund-balance-val">
              ₹{walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Amount Input */}
            <div className="fund-amount-wrapper">
              <label className="fund-amount-label">Enter Amount (₹)</label>
              <div className="fund-input-container">
                <span className="fund-currency-symbol">₹</span>
                <input
                  type="number"
                  min="1"
                  step="100"
                  className="fund-amount-input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                  placeholder="0"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="fund-presets-grid">
              {(isDeposit ? DEPOSIT_PRESETS : WITHDRAW_PRESETS).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`fund-preset-btn ${Number(amount) === p ? "active" : ""}`}
                  onClick={() => setAmount(p.toString())}
                >
                  +₹{(p / 1000).toFixed(0)}k
                </button>
              ))}
              {!isDeposit && walletBalance > 0 && (
                <button
                  type="button"
                  className="fund-preset-btn"
                  onClick={() => setAmount(Math.floor(walletBalance).toString())}
                  title="Withdraw all available cash"
                >
                  All Cash
                </button>
              )}
            </div>

            {/* Simulated Payment Channel Strip */}
            <div className="fund-channel-badge">
              <CheckCircle style={{ fontSize: "1rem", color: isDeposit ? "var(--color-profit)" : "var(--color-primary)" }} />
              <span>Simulated Payment Gateway:</span> Instant Zero-Fee Virtual Transfer
            </div>

            {/* Actions */}
            <div className="fund-modal-actions">
              <button
                type="submit"
                disabled={loading || !numAmount}
                className={`btn-fund-submit ${isDeposit ? "deposit" : "withdraw"}`}
              >
                {loading
                  ? "Processing..."
                  : isDeposit
                  ? `Deposit ₹${numAmount.toLocaleString("en-IN")}`
                  : `Withdraw ₹${numAmount.toLocaleString("en-IN")}`}
              </button>

              <button
                type="button"
                className="btn-fund-close"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default FundModal;
