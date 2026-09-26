import React from "react";

import Menu from "./Menu";

const TopBar = () => {
  return (
    <div className="topbar-container">
      <div className="indices-container">
        <div className="nifty">
          <p className="index">NIFTY 50</p>
          <p className="index-points">24,850.20</p>
          <p className="percent up">+0.42%</p>
        </div>
        <div className="sensex">
          <p className="index">SENSEX</p>
          <p className="index-points">81,340.15</p>
          <p className="percent up">+0.38%</p>
        </div>
      </div>
      {/* NOTE: these two indices are placeholder values, not live data.
          Hooking this up to a real market-data API is listed as a
          future feature — see the "Live/Simulated Stock Prices"
          recommendation. */}

      <Menu />
    </div>
  );
};

export default TopBar;