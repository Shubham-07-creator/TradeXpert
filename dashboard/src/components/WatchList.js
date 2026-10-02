import React, { useState, useEffect, useContext } from "react";
import GeneralContext from "./GeneralContext";
import { Tooltip, Grow } from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { DoughnutChart } from "./DoughnoutChart";
import { getSnapshot, subscribeToLiveMarket } from "../utils/liveMarket";

const WatchList = () => {
  const [search, setSearch] = useState("");
  const [liveStocks, setLiveStocks] = useState(getSnapshot());

  useEffect(() => {
    const unsubscribe = subscribeToLiveMarket(setLiveStocks);
    return unsubscribe;
  }, []);

  const filteredWatchlist = liveStocks.filter((stock) =>
    stock.name.toLowerCase().includes(search.toLowerCase())
  );

  // Modern Neo-Broker Chart Colors matching Option 1
  const chartColors = [
    "rgba(56, 126, 209, 0.8)",  // Royal Blue
    "rgba(0, 208, 156, 0.8)",   // Mint Emerald
    "rgba(79, 147, 230, 0.8)",  // Sky Blue
    "rgba(37, 99, 235, 0.8)",   // Deep Blue
    "rgba(16, 185, 129, 0.8)",  // Bright Emerald
    "rgba(99, 102, 241, 0.8)",  // Indigo
    "rgba(245, 158, 11, 0.8)",  // Amber
  ];

  const chartBorderColors = [
    "#387ED1",
    "#00D09C",
    "#4F93E6",
    "#2563EB",
    "#10B981",
    "#6366F1",
    "#F59E0B",
  ];

  const chartData = {
    labels: liveStocks.slice(0, 7).map((stock) => stock.name),
    datasets: [
      {
        label: "Price (₹)",
        data: liveStocks.slice(0, 7).map((stock) => stock.price),
        backgroundColor: chartColors,
        borderColor: chartBorderColors,
        borderWidth: 2,
      },
    ],
  };

  return (
    <aside className="watchlist-container">
      {/* Search Input Bar */}
      <div className="search-container">
        <SearchIcon className="search-icon" style={{ fontSize: "1.1rem" }} />
        <input
          type="text"
          placeholder="Search stocks (e.g. RELIANCE, INFY, TCS)"
          className="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search ? (
          <button
            onClick={() => setSearch("")}
            style={{
              position: "absolute",
              right: "26px",
              background: "transparent",
              border: "none",
              color: "var(--color-text-faint)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: 0,
            }}
            title="Clear search"
          >
            <CloseIcon style={{ fontSize: "1rem" }} />
          </button>
        ) : (
          <span className="counts">
            {filteredWatchlist.length}/{liveStocks.length}
          </span>
        )}
      </div>

      {/* Stock Items List */}
      <ul className="watchlist-scrollable">
        {filteredWatchlist.map((stock, index) => (
          <WatchListItem stock={stock} key={index} />
        ))}
      </ul>

      {/* Visual Market Weight Doughnut Chart */}
      <div style={{ padding: "16px", borderTop: "1px solid var(--color-border)" }}>
        <DoughnutChart data={chartData} />
      </div>
    </aside>
  );
};

export default WatchList;

const WatchListItem = ({ stock }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  return (
    <li
      className="watchlist-item"
      onMouseEnter={() => setShowWatchlistActions(true)}
      onMouseLeave={() => setShowWatchlistActions(false)}
    >
      <div className="stock-name-group">
        <span className="stock-name">{stock.name}</span>
        <span className="stock-sector">NSE • EQ</span>
      </div>

      <div className="stock-price-group">
        <span className={`stock-percent ${stock.isDown ? "down" : "up"}`}>
          {stock.isDown ? (
            <KeyboardArrowDown style={{ fontSize: "0.9rem" }} />
          ) : (
            <KeyboardArrowUp style={{ fontSize: "0.9rem" }} />
          )}
          {stock.percent}
        </span>
        <span className="stock-price">
          ₹{Number(stock.price).toFixed(2)}
        </span>
      </div>

      {showWatchlistActions && <WatchListActions uid={stock.name} />}
    </li>
  );
};

const WatchListActions = ({ uid }) => {
  const generalContext = useContext(GeneralContext);

  const handleBuyClick = (e) => {
    e.stopPropagation();
    generalContext.openBuyWindow(uid);
  };

  const handleSellClick = (e) => {
    e.stopPropagation();
    generalContext.openSellWindow(uid);
  };

  return (
    <div className="watchlist-actions">
      <Tooltip title="Buy Order (B)" placement="top" arrow TransitionComponent={Grow}>
        <button className="btn-buy-quick" onClick={handleBuyClick}>
          BUY
        </button>
      </Tooltip>

      <Tooltip title="Sell Order (S)" placement="top" arrow TransitionComponent={Grow}>
        <button className="btn-sell-quick" onClick={handleSellClick}>
          SELL
        </button>
      </Tooltip>
    </div>
  );
};