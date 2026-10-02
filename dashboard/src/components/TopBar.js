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
          <span className="index-name">NIFTY 50</span>
          <span className="index-points">
            {Number(niftyPrice).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span className={`index-percent ${isNiftyDown ? "down" : "up"}`}>
            {niftyPercent}
          </span>
        </div>

        <div className="index-box" title="Bombay Stock Exchange SENSEX Index">
          <span className="index-name">SENSEX</span>
          <span className="index-points">
            {Number(sensexPrice).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span className={`index-percent ${isNiftyDown ? "down" : "up"}`}>
            {formattedSensexPercent}
          </span>
        </div>

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