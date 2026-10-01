import React from "react";

function Hero() {
  return (
    <div className="container">
      <div className="row p-5 mt-4 border-bottom text-center">
        <h1 style={{ color: "var(--ink)" }}>Transparent Pricing</h1>
        <h3 className="mt-3 fs-5" style={{ color: "var(--muted)" }}>
          Free equity investments and flat ₹20 intraday and F&O trades
        </h3>
      </div>
      <div className="row p-4 mt-4 text-center g-4">
        <div className="col-md-4 p-4">
          <img
            src="/media/images/pricingEquity.svg"
            alt="Free equity delivery"
            style={{ width: "220px", marginBottom: "20px" }}
          />
          <h2 className="fs-3 fw-bold" style={{ color: "var(--ink)" }}>
            Free equity delivery
          </h2>
          <p style={{ color: "var(--muted)", lineHeight: "1.7" }}>
            All equity delivery investments (NSE, BSE) are absolutely free — ₹0
            brokerage for lifetime.
          </p>
        </div>
        <div className="col-md-4 p-4">
          <img
            src="/media/images/intradayTrades.svg"
            alt="Intraday trades"
            style={{ width: "220px", marginBottom: "20px" }}
          />
          <h2 className="fs-3 fw-bold" style={{ color: "var(--ink)" }}>
            Intraday and F&O trades
          </h2>
          <p style={{ color: "var(--muted)", lineHeight: "1.7" }}>
            Flat ₹20 or 0.03% (whichever is lower) per executed order on
            intraday trades across equity, currency, and commodity.
          </p>
        </div>
        <div className="col-md-4 p-4">
          <img
            src="/media/images/pricingEquity.svg"
            alt="Free direct MF"
            style={{ width: "220px", marginBottom: "20px" }}
          />
          <h2 className="fs-3 fw-bold" style={{ color: "var(--ink)" }}>
            Free direct MF
          </h2>
          <p style={{ color: "var(--muted)", lineHeight: "1.7" }}>
            All direct mutual fund investments are absolutely free — ₹0
            commissions & zero DP charges.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Hero;