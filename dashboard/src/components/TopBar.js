import React, { useEffect, useState } from "react";
import Menu from "./Menu";
import {
  getNifty,
  getSensex,
  getMarketInfo,
  subscribeToNifty,
  subscribeToSensex,
  subscribeToMarketInfo,
  subscribeToMarketHalt,
} from "../utils/liveMarket";

const TopBar = () => {
  const [nifty, setNifty] = useState(() => getNifty());
  const [sensex, setSensex] = useState(() => getSensex());
  const [marketInfo, setMarketInfo] = useState(() => getMarketInfo());
  const [isHalted, setIsHalted] = useState(false);

  useEffect(() => {
    const unsubNifty = subscribeToNifty((updatedNifty) => {
      if (updatedNifty && updatedNifty.price) {
        setNifty(updatedNifty);
      }
    });
    const unsubSensex = subscribeToSensex((updatedSensex) => {
      if (updatedSensex && updatedSensex.price) {
        setSensex(updatedSensex);
      }
    });
    const unsubInfo = subscribeToMarketInfo((updatedInfo) => {
      if (updatedInfo) {
        setMarketInfo(updatedInfo);
      }
    });
    const unsubHalt = subscribeToMarketHalt((halted) => {
      setIsHalted(Boolean(halted));
    });

    return () => {
      unsubNifty();
      unsubSensex();
      unsubInfo();
      unsubHalt();
    };
  }, []);

  const niftyPrice = nifty.price || 22421.95;
  const isNiftyDown = nifty.isDown || (nifty.changePercent && nifty.changePercent < 0);
  const niftyPercent = nifty.percent || "+0.00%";

  const sensexPrice = sensex.price || 71909.7;
  const isSensexDown = sensex.isDown || (sensex.changePercent && sensex.changePercent < 0);
  const sensexPercent = sensex.percent || "+0.00%";

  return (
    <header className="topbar-container">
      <div className="indices-container">
        {/* NIFTY 50 Index */}
        <div className="index-box" title="National Stock Exchange Nifty 50 Index (Real Dalal Street Feed)">
          <div className="index-header">
            <span className="index-name">NIFTY 50</span>
            <span className={`index-percent ${isNiftyDown ? "down" : "up"}`}>
              {niftyPercent}
            </span>
          </div>
          <span className="index-points">
            {Number(niftyPrice).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        {/* SENSEX Index */}
        <div className="index-box" title="Bombay Stock Exchange SENSEX Index (Real Dalal Street Feed)">
          <div className="index-header">
            <span className="index-name">SENSEX</span>
            <span className={`index-percent ${isSensexDown ? "down" : "up"}`}>
              {sensexPercent}
            </span>
          </div>
          <span className="index-points">
            {Number(sensexPrice).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        {/* Market Mode Status Badge: LIVE NSE vs SIMULATOR */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: marketInfo.isMarketOpen
              ? "rgba(16, 185, 129, 0.12)"
              : "rgba(56, 126, 209, 0.12)",
            border: marketInfo.isMarketOpen
              ? "1px solid rgba(16, 185, 129, 0.3)"
              : "1px solid rgba(56, 126, 209, 0.3)",
            color: marketInfo.isMarketOpen ? "#10b981" : "#387ed1",
            padding: "4px 10px",
            borderRadius: "999px",
            fontSize: "0.72rem",
            fontWeight: "700",
            letterSpacing: "0.03em",
            userSelect: "none",
          }}
          title={
            marketInfo.isMarketOpen
              ? "Live Dalal Street Real Market Feed (NSE / BSE)"
              : "Market Closed (Trading Hours: 9:15 AM - 3:30 PM IST). Testing Simulator Active around Real Closing Prices."
          }
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: marketInfo.isMarketOpen ? "#10b981" : "#387ed1",
              boxShadow: marketInfo.isMarketOpen
                ? "0 0 8px rgba(16, 185, 129, 0.8)"
                : "0 0 6px rgba(56, 126, 209, 0.6)",
              display: "inline-block",
            }}
          />
          <span>{marketInfo.isMarketOpen ? "LIVE NSE" : "SIMULATOR"}</span>
        </div>

        {/* Circuit Breaker Halt Indicator */}
        {isHalted && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--color-loss-soft)",
              border: "1px solid var(--color-loss-border)",
              color: "var(--color-loss)",
              padding: "3px 10px",
              borderRadius: "var(--radius-pill)",
              fontSize: "0.72rem",
              fontWeight: "700",
              letterSpacing: "0.04em",
            }}
            title="Trading has been halted by Admin Circuit Breaker"
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--color-loss)",
                display: "inline-block",
              }}
            />
            <span>HALTED</span>
          </div>
        )}
      </div>

      <Menu />
    </header>
  );
};

export default TopBar;