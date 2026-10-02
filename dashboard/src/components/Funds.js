import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getAuthHeader } from "../utils/auth";
import { getSnapshot, subscribeToLiveMarket } from "../utils/liveMarket";
import { sound } from "../utils/sound";
import FundModal from "./FundModal";

const buildLiveMap = (snapshot) => {
  const map = {};
  snapshot.forEach((s) => {
    map[s.name] = s;
  });
  return map;
};

const Funds = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";
  const [wallet, setWallet] = useState(0);
  const [realizedPnL, setRealizedPnL] = useState(0);
  const [holdings, setHoldings] = useState([]);
  const [liveMap, setLiveMap] = useState(() => buildLiveMap(getSnapshot()));

  // Modern Modal State
  const [fundModalOpen, setFundModalOpen] = useState(false);
  const [fundModalMode, setFundModalMode] = useState("DEPOSIT");

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, holdingsRes] = await Promise.all([
        axios.get(`${API}/profile`, { headers: getAuthHeader() }),
        axios.get(`${API}/allHoldings`, { headers: getAuthHeader() }),
      ]);

      setWallet(profileRes.data.wallet || 0);
      setRealizedPnL(profileRes.data.realizedPnL || 0);
      setHoldings(holdingsRes.data || []);
    } catch (err) {
      console.log(err);
    }
  }, [API]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const unsubscribe = subscribeToLiveMarket((snapshot) =>
      setLiveMap(buildLiveMap(snapshot))
    );
    return unsubscribe;
  }, []);

  const openDepositModal = () => {
    setFundModalMode("DEPOSIT");
    setFundModalOpen(true);
  };

  const openWithdrawModal = () => {
    setFundModalMode("WITHDRAW");
    setFundModalOpen(true);
  };

  const handleQuickAdd = async (amount) => {
    try {
      await axios.post(
        `${API}/wallet/add`,
        { amount },
        { headers: getAuthHeader() }
      );
      sound.playTradeChime();
      toast.success(`+₹${amount.toLocaleString("en-IN")} added to your virtual wallet! 💳`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add funds ❌");
    }
  };

  const investment = holdings.reduce((sum, h) => sum + h.avg * h.qty, 0);
  const currentValue = holdings.reduce((sum, h) => {
    const live = liveMap[h.name];
    const price = live ? live.price : h.price;
    return sum + price * h.qty;
  }, 0);

  const unrealizedPnL = currentValue - investment;
  const totalPortfolioValue = wallet + currentValue;
  const isUnrealizedProfit = unrealizedPnL >= 0;
  const isRealizedProfit = realizedPnL >= 0;

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="page-title">फंड्स व बैलेंस • Funds &amp; Capital</h2>
          <p className="page-subtitle">
            अपने ट्रेडिंग वॉलेट का बैलेंस देखें, पैसे जोड़ें या निकालें • Manage cash &amp; margins.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={openDepositModal}
            style={{
              background: "var(--gradient-profit)",
              color: "#fff",
              border: "none",
              padding: "9px 18px",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "var(--shadow-glow-profit)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            + Add Funds (पैसे जोड़ें)
          </button>
          <button
            onClick={openWithdrawModal}
            style={{
              background: "var(--color-bg-card)",
              color: "var(--color-text-strong)",
              border: "1px solid var(--color-border)",
              padding: "9px 18px",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Withdraw (पैसे निकालें)
          </button>
        </div>
      </div>

      {/* Hero Wallet Card */}
      <div
        className="stat-card"
        style={{
          background: "linear-gradient(135deg, rgba(56, 126, 209, 0.08) 0%, rgba(0, 208, 156, 0.08) 100%)",
          border: "1px solid var(--color-border)",
          padding: "28px",
          marginBottom: "24px",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span className="stat-card-label" style={{ color: "var(--color-primary)" }}>
              Net Portfolio Worth
            </span>
            <h1
              style={{
                fontSize: "2.8rem",
                fontWeight: "800",
                color: "var(--color-text-strong)",
                margin: "4px 0 8px 0",
                letterSpacing: "-0.5px",
              }}
            >
              ₹{totalPortfolioValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </h1>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              Available Cash + Current Market Value of Holdings
            </p>
          </div>

          {/* Quick preset add buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-text-faint)", textTransform: "uppercase" }}>
              Quick Cash Deposit
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              {[10000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleQuickAdd(amt)}
                  style={{
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-primary)",
                    padding: "6px 12px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  title={`Instantly add ₹${amt.toLocaleString("en-IN")}`}
                >
                  +₹{(amt / 1000).toFixed(0)}k
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Financial Stat Cards Grid */}
      <div className="stats-card-grid">
        <div className="stat-card">
          <div className="stat-card-label">उपलब्ध ट्रेडिंग कैश • Available Cash</div>
          <div className="stat-card-value" style={{ color: "var(--color-primary)" }}>
            ₹{wallet.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </div>
          <div className="stat-card-sub">नये शेयर खरीदने या निकासी के लिए फ्री कैश</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">शेयरों में लगी लागत • Invested in Stocks</div>
          <div className="stat-card-value">
            ₹{investment.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </div>
          <div className="stat-card-sub">शेयर खरीदने में खर्च किए गए कुल पैसे</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">शेयरों में चल रहा फायदा/घाटा • Unrealized P&amp;L</div>
          <div
            className="stat-card-value"
            style={{ color: isUnrealizedProfit ? "var(--color-profit)" : "var(--color-loss)" }}
          >
            {isUnrealizedProfit ? "+" : ""}₹{unrealizedPnL.toFixed(2)}
          </div>
          <div className="stat-card-sub">{isUnrealizedProfit ? "🟢 वर्तमान में मुनाफा चल रहा है" : "🔴 वर्तमान में घाटा चल रहा है"}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">बुक किया गया पक्का मुनाफा • Realized P&amp;L</div>
          <div
            className="stat-card-value"
            style={{ color: isRealizedProfit ? "var(--color-profit)" : "var(--color-loss)" }}
          >
            {isRealizedProfit ? "+" : ""}₹{realizedPnL.toFixed(2)}
          </div>
          <div className="stat-card-sub">शेयर बेचकर बुक किया गया लाइफटाइम रिटर्न</div>
        </div>
      </div>

      {/* Modern Add / Withdraw Modal */}
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

export default Funds;