import React, { useEffect, useState } from "react";
import Menu from "./Menu";
import { getNifty, subscribeToNifty } from "../utils/liveMarket";

const TopBar = () => {
  const [nifty, setNifty] = useState(() => getNifty());

  useEffect(() => {
    const unsub = subscribeToNifty((updatedNifty) => {
      if (updatedNifty && updatedNifty.price) {
        setNifty(updatedNifty);
      }
    });
    return unsub;
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
      </div>

      <Menu />
    </header>
  );
};

export default TopBar;