import React, { useEffect, useState } from "react";
import Menu from "./Menu";
import {
  getNifty,
  getSensex,
  subscribeToNifty,
  subscribeToSensex,
} from "../utils/liveMarket";

const TopBar = () => {
  const [nifty, setNifty] = useState(() => getNifty());
  const [sensex, setSensex] = useState(() => getSensex());

  useEffect(() => {
    const initialNifty = getNifty();
    if (initialNifty && initialNifty.price) {
      const isDown = initialNifty.isDown || (initialNifty.changePercent && initialNifty.changePercent < 0);
      const formattedPrice = Number(initialNifty.price).toLocaleString("en-IN", {
        maximumFractionDigits: 0,
      });
      document.title = `(${isDown ? "▼" : "▲"} ${formattedPrice}) TradeXpert Terminal`;
    }

    const unsubNifty = subscribeToNifty((updatedNifty) => {
      if (updatedNifty && updatedNifty.price) {
        setNifty(updatedNifty);
        const isDown = updatedNifty.isDown || (updatedNifty.changePercent && updatedNifty.changePercent < 0);
        const formattedPrice = Number(updatedNifty.price).toLocaleString("en-IN", {
          maximumFractionDigits: 0,
        });
        document.title = `(${isDown ? "▼" : "▲"} ${formattedPrice}) TradeXpert Terminal`;
      }
    });
    const unsubSensex = subscribeToSensex((updatedSensex) => {
      if (updatedSensex && updatedSensex.price) {
        setSensex(updatedSensex);
      }
    });

    return () => {
      unsubNifty();
      unsubSensex();
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
      </div>

      <Menu />
    </header>
  );
};

export default TopBar;