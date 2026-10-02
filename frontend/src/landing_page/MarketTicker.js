import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

const DEFAULT_TICKER = [
  { name: "NIFTY 50", price: "22,421.95", change: "-0.88%", isUp: false },
  { name: "SENSEX", price: "71,909.70", change: "-0.78%", isUp: false },
  { name: "RELIANCE", price: "₹1,167.70", change: "-1.63%", isUp: false },
  { name: "TCS", price: "₹2,075.00", change: "+1.19%", isUp: true },
  { name: "INFY", price: "₹1,035.00", change: "+4.11%", isUp: true },
  { name: "HDFCBANK", price: "₹721.20", change: "+1.76%", isUp: true },
  { name: "ICICIBANK", price: "₹1,310.60", change: "-0.84%", isUp: false },
  { name: "SBIN", price: "₹954.10", change: "-0.56%", isUp: false },
  { name: "ITC", price: "₹255.90", change: "-2.61%", isUp: false },
  { name: "BHARTIARTL", price: "₹1,741.10", change: "+0.85%", isUp: true },
  { name: "MARUTI", price: "₹11,386.00", change: "+1.20%", isUp: true },
];

function MarketTicker() {
  const [tickerData, setTickerData] = useState(DEFAULT_TICKER);
  const [marketMode, setMarketMode] = useState("SIMULATOR");
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchSnapshot = async () => {
      try {
        const res = await axios.get(`${API}/market/snapshot`, { timeout: 4000 });
        if (!isMounted || !res.data) return;

        const data = res.data;
        const items = [];

        if (data.nifty && data.nifty.price) {
          items.push({
            name: "NIFTY 50",
            price: Number(data.nifty.price).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
            change: data.nifty.percent,
            isUp: !data.nifty.isDown,
          });
        }

        if (data.sensex && data.sensex.price) {
          items.push({
            name: "SENSEX",
            price: Number(data.sensex.price).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
            change: data.sensex.percent,
            isUp: !data.sensex.isDown,
          });
        }

        if (Array.isArray(data.stocks) && data.stocks.length > 0) {
          const featured = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "ITC", "BHARTIARTL", "MARUTI", "LT"];
          featured.forEach((sym) => {
            const st = data.stocks.find((s) => s.name === sym);
            if (st) {
              items.push({
                name: st.name,
                price: `₹${Number(st.price).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`,
                change: st.percent,
                isUp: !st.isDown,
              });
            }
          });
        }

        if (items.length > 0) {
          setTickerData(items);
        }
        if (typeof data.isMarketOpen === "boolean") {
          setIsMarketOpen(data.isMarketOpen);
          setMarketMode(data.marketMode || (data.isMarketOpen ? "REAL" : "SIMULATOR"));
        }
      } catch (e) {
        // Fallback to default ticker silently
      }
    };

    fetchSnapshot();
    const interval = setInterval(fetchSnapshot, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const tickerItems = [...tickerData, ...tickerData];

  return (
    <div
      className="market-ticker-bar"
      title={
        isMarketOpen
          ? "Live Real-Time Dalal Street Market Feed (NSE / BSE)"
          : "Market Closed (Testing Simulator Active with Real Closing Prices)"
      }
    >
      <div className="ticker-track">
        {tickerItems.map((item, idx) => (
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
