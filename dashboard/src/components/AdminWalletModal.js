import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./AdminWalletModal.css";

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 500000];

const AdminWalletModal = ({ isOpen, user, onClose, onSubmit, loading }) => {
  const [type, setType] = useState("CREDIT");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setType("CREDIT");
      setAmount("");
      setReason("");
      setError("");
    }
  }, [isOpen, user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !user) return null;

  const numAmount = parseFloat(amount) || 0;
  const currentWallet = user.wallet || 0;
  const projectedWallet =
    type === "CREDIT"
      ? currentWallet + numAmount
      : Math.max(0, currentWallet - numAmount);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!numAmount || numAmount <= 0) {
      setError("Please enter a valid positive amount");
      return;
    }
    if (type === "DEBIT" && numAmount > currentWallet) {
      setError(`Cannot debit more than user's current balance (₹${currentWallet.toLocaleString("en-IN")})`);
      return;
    }
    setError("");
    onSubmit({ userId: user.id, amount: numAmount, type, reason });
  };

  const modalContent = (
    <div className="admin-wallet-overlay" onClick={!loading ? onClose : undefined}>
      <div className="admin-wallet-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-wallet-header">
          <div>
            <h3 className="admin-wallet-title">Adjust Virtual Capital 💰</h3>
            <p className="admin-wallet-subtitle">
              Modify funds for <span className="highlight-trader">{user.name}</span> ({user.email})
            </p>
          </div>
          <button
            type="button"
            className="admin-modal-close"
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Current & Projected Balance */}
        <div className="balance-projection-card">
          <div className="balance-col">
            <span className="balance-label">Current Balance</span>
            <span className="balance-val current">
              ₹{currentWallet.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="balance-arrow">➔</div>
          <div className="balance-col">
            <span className="balance-label">Projected Balance</span>
            <span className={`balance-val projected ${type === "CREDIT" ? "up" : "down"}`}>
              ₹{projectedWallet.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="admin-wallet-form">
          {/* Action Type Toggle */}
          <div className="type-toggle-group">
            <button
              type="button"
              className={`type-btn ${type === "CREDIT" ? "active-credit" : ""}`}
              onClick={() => setType("CREDIT")}
            >
              ➕ Credit Funds (Add)
            </button>
            <button
              type="button"
              className={`type-btn ${type === "DEBIT" ? "active-debit" : ""}`}
              onClick={() => setType("DEBIT")}
            >
              ➖ Debit Funds (Deduct)
            </button>
          </div>

          {/* Amount input */}
          <div className="admin-form-group">
            <label className="admin-form-label">Adjustment Amount (₹)</label>
            <div className="admin-input-wrapper">
              <span className="admin-currency-prefix">₹</span>
              <input
                type="number"
                step="any"
                min="1"
                placeholder="e.g. 50000"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                className="admin-amount-input"
                autoFocus
              />
            </div>
          </div>

          {/* Preset Chips */}
          <div className="preset-chips-row">
            {PRESET_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                className="preset-chip-btn"
                onClick={() => {
                  setAmount(val.toString());
                  setError("");
                }}
              >
                +₹{(val / 1000).toFixed(0)}k
              </button>
            ))}
          </div>

          {/* Reason / Admin Memo */}
          <div className="admin-form-group">
            <label className="admin-form-label">Audit Memo / Reason (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Platform welcome bonus, Liquidity test grant"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="admin-text-input"
            />
          </div>

          {error && <div className="admin-form-error">{error}</div>}

          {/* Action Buttons */}
          <div className="admin-modal-actions">
            <button
              type="submit"
              className={`btn-admin-submit ${type === "CREDIT" ? "credit" : "debit"}`}
              disabled={loading || !numAmount}
            >
              {loading
                ? "Processing..."
                : type === "CREDIT"
                ? `Credit ₹${numAmount.toLocaleString("en-IN")}`
                : `Debit ₹${numAmount.toLocaleString("en-IN")}`}
            </button>
            <button
              type="button"
              className="btn-admin-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default AdminWalletModal;
