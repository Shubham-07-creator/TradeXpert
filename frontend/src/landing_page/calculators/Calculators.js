import React, { useState } from "react";

function Calculators() {
  const [activeTab, setActiveTab] = useState("brokerage");

  // --- Brokerage State ---
  const [segment, setSegment] = useState("delivery"); // "delivery" | "intraday"
  const [buyPrice, setBuyPrice] = useState(1500);
  const [sellPrice, setSellPrice] = useState(1550);
  const [quantity, setQuantity] = useState(100);

  // --- SIP State ---
  const [monthlySip, setMonthlySip] = useState(5000);
  const [sipRate, setSipRate] = useState(12);
  const [sipYears, setSipYears] = useState(10);

  // --- Brokerage Calculations ---
  const turnover = (buyPrice + sellPrice) * quantity;
  const grossPnl = (sellPrice - buyPrice) * quantity;

  // TradeXpert charges: Flat 0 on Delivery, flat ₹20 on Intraday
  const tradeXpertBrokerage = segment === "delivery" ? 0 : 40; // ₹20 buy + ₹20 sell
  const traditionalBrokerage = Math.round(turnover * 0.005); // 0.5% traditional broker
  const stt = Math.round(
    segment === "delivery"
      ? turnover * 0.001
      : sellPrice * quantity * 0.00025
  );
  const exchTxn = Number((turnover * 0.0000345).toFixed(2));
  const gst = Number(((tradeXpertBrokerage + exchTxn) * 0.18).toFixed(2));
  const stampDuty = Math.round(buyPrice * quantity * 0.00015);
  const totalTax = Number(
    (tradeXpertBrokerage + stt + exchTxn + gst + stampDuty).toFixed(2)
  );
  const netPnl = Number((grossPnl - totalTax).toFixed(2));
  const savings = Math.max(0, traditionalBrokerage - tradeXpertBrokerage);

  // --- SIP Calculations ---
  const monthlyRate = sipRate / 12 / 100;
  const totalMonths = sipYears * 12;
  const investedAmount = monthlySip * totalMonths;
  const totalSipValue = Math.round(
    monthlySip *
      ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
      (1 + monthlyRate)
  );
  const sipReturns = Math.max(0, totalSipValue - investedAmount);
  const gainPercentage = investedAmount
    ? ((sipReturns / investedAmount) * 100).toFixed(0)
    : 0;

  return (
    <div className="container py-5" id="calculators">
      <div className="text-center mb-5 fade-up">
        <span className="badge rounded-pill px-3 py-2 mb-2" style={{ background: "var(--primary-light)", color: "var(--primary)", fontWeight: "700" }}>
          TRANSPARENT & FREE TOOLS
        </span>
        <h2 className="fw-bold" style={{ color: "var(--ink)" }}>
          Financial Calculators
        </h2>
        <p className="text-muted" style={{ maxWidth: "600px", margin: "0 auto" }}>
          Calculate your exact trading charges or estimate your wealth growth with our interactive tools.
        </p>
      </div>

      <div className="calc-card fade-up">
        {/* Tabs */}
        <div className="calc-tabs">
          <button
            type="button"
            className={`calc-tab-btn ${activeTab === "brokerage" ? "active" : ""}`}
            onClick={() => setActiveTab("brokerage")}
          >
            <i className="fa-solid fa-receipt"></i> Brokerage Calculator
          </button>
          <button
            type="button"
            className={`calc-tab-btn ${activeTab === "sip" ? "active" : ""}`}
            onClick={() => setActiveTab("sip")}
          >
            <i className="fa-solid fa-chart-pie"></i> SIP Wealth Calculator
          </button>
        </div>

        {/* Tab 1: Brokerage Calculator */}
        {activeTab === "brokerage" && (
          <div className="row g-4 align-items-center">
            <div className="col-lg-7">
              {/* Segment Toggle */}
              <div className="d-flex gap-2 mb-4">
                <button
                  type="button"
                  className={`btn btn-sm ${segment === "delivery" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setSegment("delivery")}
                  style={{ borderRadius: "8px", fontWeight: "600" }}
                >
                  Equity Delivery (₹0)
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${segment === "intraday" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setSegment("intraday")}
                  style={{ borderRadius: "8px", fontWeight: "600" }}
                >
                  Equity Intraday (₹20)
                </button>
              </div>

              {/* Buy Price */}
              <div className="calc-slider-group">
                <div className="calc-slider-header">
                  <span className="calc-slider-label">Buy Price (₹)</span>
                  <span className="calc-slider-val">₹{buyPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="10000"
                  step="10"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(Number(e.target.value))}
                  className="calc-range-input"
                />
              </div>

              {/* Sell Price */}
              <div className="calc-slider-group">
                <div className="calc-slider-header">
                  <span className="calc-slider-label">Sell Price (₹)</span>
                  <span className="calc-slider-val">₹{sellPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="10000"
                  step="10"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(Number(e.target.value))}
                  className="calc-range-input"
                />
              </div>

              {/* Quantity */}
              <div className="calc-slider-group">
                <div className="calc-slider-header">
                  <span className="calc-slider-label">Quantity</span>
                  <span className="calc-slider-val">{quantity} shares</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="2000"
                  step="5"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="calc-range-input"
                />
              </div>
            </div>

            {/* Result Box */}
            <div className="col-lg-5">
              <div className="calc-result-box">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0" style={{ color: "var(--ink)" }}>Charges Breakdown</h5>
                  {savings > 0 && (
                    <span className="calc-badge-save">
                      <i className="fa-solid fa-tag"></i> Save ₹{savings.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="calc-result-row">
                  <span className="text-muted">Turnover</span>
                  <span className="fw-bold">₹{turnover.toLocaleString()}</span>
                </div>
                <div className="calc-result-row">
                  <span className="text-muted">TradeXpert Brokerage</span>
                  <span className="fw-bold text-success">
                    {tradeXpertBrokerage === 0 ? "₹0 (Free)" : `₹${tradeXpertBrokerage}`}
                  </span>
                </div>
                <div className="calc-result-row">
                  <span className="text-muted">STT / CTT Total</span>
                  <span>₹{stt.toLocaleString()}</span>
                </div>
                <div className="calc-result-row">
                  <span className="text-muted">Exchange & GST</span>
                  <span>₹{(exchTxn + gst).toFixed(2)}</span>
                </div>
                <div className="calc-result-row">
                  <span className="text-muted">Stamp Duty</span>
                  <span>₹{stampDuty}</span>
                </div>

                <div className="calc-result-row total">
                  <span>Net P&L</span>
                  <span style={{ color: netPnl >= 0 ? "#10B981" : "#EF4444" }}>
                    {netPnl >= 0 ? "+" : ""}₹{netPnl.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: SIP Calculator */}
        {activeTab === "sip" && (
          <div className="row g-4 align-items-center">
            <div className="col-lg-7">
              {/* Monthly Amount */}
              <div className="calc-slider-group">
                <div className="calc-slider-header">
                  <span className="calc-slider-label">Monthly Investment</span>
                  <span className="calc-slider-val">₹{monthlySip.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="100000"
                  step="500"
                  value={monthlySip}
                  onChange={(e) => setMonthlySip(Number(e.target.value))}
                  className="calc-range-input"
                />
              </div>

              {/* Expected Return Rate */}
              <div className="calc-slider-group">
                <div className="calc-slider-header">
                  <span className="calc-slider-label">Expected Return Rate (p.a)</span>
                  <span className="calc-slider-val">{sipRate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={sipRate}
                  onChange={(e) => setSipRate(Number(e.target.value))}
                  className="calc-range-input"
                />
              </div>

              {/* Time Period */}
              <div className="calc-slider-group">
                <div className="calc-slider-header">
                  <span className="calc-slider-label">Time Period</span>
                  <span className="calc-slider-val">{sipYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="35"
                  step="1"
                  value={sipYears}
                  onChange={(e) => setSipYears(Number(e.target.value))}
                  className="calc-range-input"
                />
              </div>
            </div>

            {/* Result Box */}
            <div className="col-lg-5">
              <div className="calc-result-box">
                <h5 className="fw-bold mb-3" style={{ color: "var(--ink)" }}>Wealth Projection</h5>

                <div className="calc-result-row">
                  <span className="text-muted">Total Invested</span>
                  <span className="fw-bold">₹{investedAmount.toLocaleString()}</span>
                </div>
                <div className="calc-result-row">
                  <span className="text-muted">Estimated Gains (+{gainPercentage}%)</span>
                  <span className="fw-bold text-success">
                    +₹{sipReturns.toLocaleString()}
                  </span>
                </div>

                <div className="calc-result-row total">
                  <span>Total Future Value</span>
                  <span className="text-primary">
                    ₹{totalSipValue.toLocaleString()}
                  </span>
                </div>

                <div className="mt-3 pt-2">
                  <div className="progress" style={{ height: "10px", borderRadius: "10px" }}>
                    <div
                      className="progress-bar bg-primary"
                      role="progressbar"
                      style={{
                        width: `${(investedAmount / totalSipValue) * 100}%`,
                      }}
                      title="Invested"
                    ></div>
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{
                        width: `${(sipReturns / totalSipValue) * 100}%`,
                      }}
                      title="Returns"
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between mt-2 text-muted small">
                    <span>🔵 Invested ({((investedAmount / totalSipValue) * 100).toFixed(0)}%)</span>
                    <span>🟢 Gains ({((sipReturns / totalSipValue) * 100).toFixed(0)}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Calculators;
