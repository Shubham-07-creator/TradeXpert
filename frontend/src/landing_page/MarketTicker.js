import React from "react";

const TICKER_DATA = [
  { name: "NIFTY 50", price: "24,850.20", change: "+0.45%", isUp: true },
  { name: "SENSEX", price: "81,320.10", change: "+0.38%", isUp: true },
  { name: "BANK NIFTY", price: "51,200.00", change: "-0.12%", isUp: false },
  { name: "RELIANCE", price: "₹2,112.40", change: "+1.20%", isUp: true },
  { name: "TCS", price: "₹3,194.80", change: "-0.35%", isUp: false },
  { name: "INFY", price: "₹1,555.45", change: "+0.82%", isUp: true },
  { name: "HDFCBANK", price: "₹1,522.35", change: "+0.25%", isUp: true },
  { name: "TATAMOTORS", price: "₹945.60", change: "+1.85%", isUp: true },
  { name: "SBIN", price: "₹785.40", change: "-0.40%", isUp: false },
  { name: "ITC", price: "₹465.10", change: "+0.15%", isUp: true },
  { name: "LT", price: "₹3,450.00", change: "+1.10%", isUp: true },
];

const TICKER_ITEMS = [...TICKER_DATA, ...TICKER_DATA];

function MarketTicker() {
  return (
    <div className="market-ticker-bar" title="Live Market Indices">
      <div className="ticker-track">
        {TICKER_ITEMS.map((item, idx) => (
          <div className="ticker-item" key={idx}>
            <span className="ticker-name">{item.name}</span>
            <span className="ticker-price">{item.price}</span>
            <span className={`ticker-change ${item.isUp ? "up" : "down"}`}>
              {item.isUp ? "▲ " : "▼ "}
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MarketTicker;
