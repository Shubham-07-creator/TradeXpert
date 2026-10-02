import React, { useEffect, useState } from "react";
import Menu from "./Menu";
import { getNifty, subscribeToNifty, subscribeToMarketHalt } from "../utils/liveMarket";

const TopBar = () => {
  const [nifty, setNifty] = useState(() => getNifty());
  const [isHalted, setIsHalted] = useState(false);

  useEffect(() => {
    const unsub = subscribeToNifty((updatedNifty) => {
      if (updatedNifty && updatedNifty.price) {
        setNifty(updatedNifty);
      }
    });
    const unsubHalt = subscribeToMarketHalt((halted) => {
      setIsHalted(Boolean(halted));
    });

    return () => {
      unsub();
      unsubHalt();
    };
  }, []);

  const niftyPrice = nifty.price || 24850.2;
  const isNiftyDown = nifty.isDown || (nifty.changePercent && nifty.changePercent < 0);
  const niftyPercent = nifty.percent || "+0.42%";

  // Simulated SENSEX indexed relative to NIFTY
  const sensexPrice = (niftyPrice * 3.273).toFixed(2);
  const sensexPercentNum = parseFloat(niftyPercent) * 0.95;
  const formattedSensexPercent =
    sensexPercentNum >= 0 ? `+${sensexPercentNum.toFixed(2)}%` : `${sensexPercentNum.toFixed(2)}%`;

  return (
    <header className="topbar-container">
      <div className="indices-container">
        <div className="index-box" title="National Stock Exchange Nifty 50 Index">
          <div className="index-header">
            <span className="index-name">NIFTY 50</span>
            <span className={`index-percent ${isNiftyDown ? "down" : "up"}`}>
              {niftyPercent}
            </span>
          </div>
          <div className="index-data">
            <span className="index-points">
              {Number(niftyPrice).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        <div className="index-box" title="Bombay Stock Exchange SENSEX Index">
          <div className="index-header">
            <span className="index-name">SENSEX</span>
            <span className={`index-percent ${isNiftyDown ? "down" : "up"}`}>
              {formattedSensexPercent}
            </span>
          </div>
          <div className="index-data">
            <span className="index-points">
              {Number(sensexPrice).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {isHalted && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              color: "var(--color-loss)",
              padding: "4px 12px",
              borderRadius: "var(--radius-pill)",
              fontSize: "0.75rem",
              fontWeight: "700",
              letterSpacing: "0.04em",
              animation: "pulseCritical 2s infinite",
            }}
            title="Trading has been halted by Admin Circuit Breaker"
          >
            <span style={{ fontSize: "0.85rem" }}>🛑</span>
            <span>CIRCUIT BREAKER: HALTED</span>
          </div>
        )}
      </div>

      <Menu />
    </header>
  );
};

export default TopBar;