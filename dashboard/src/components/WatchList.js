import React, { useState, useEffect, useContext } from "react";
import GeneralContext from "./GeneralContext";
import { Tooltip, Grow } from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Search as SearchIcon,
  Close as CloseIcon,
  ShowChart,
} from "@mui/icons-material";
import { DoughnutChart } from "./DoughnoutChart";
import { getSnapshot, subscribeToLiveMarket } from "../utils/liveMarket";

const WatchList = () => {
  const [search, setSearch] = useState("");
  const [liveStocks, setLiveStocks] = useState(getSnapshot());
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToLiveMarket(setLiveStocks);
    return unsubscribe;
  }, []);

  const filteredWatchlist = liveStocks.filter((stock) =>
    stock.name.toLowerCase().includes(search.toLowerCase())
  );

  // Modern High-End Chart Palette
  const chartColors = [
    "rgba(37, 99, 235, 0.85)",  // Cobalt
    "rgba(16, 185, 129, 0.85)", // Emerald
    "rgba(99, 102, 241, 0.85)", // Indigo
    "rgba(245, 158, 11, 0.85)", // Amber
    "rgba(14, 165, 233, 0.85)", // Sky
    "rgba(168, 85, 247, 0.85)", // Purple
    "rgba(244, 63, 94, 0.85)",  // Rose
  ];

  const chartBorderColors = [
    "#2563EB",
    "#10B981",
    "#6366F1",
    "#F59E0B",
    "#0EA5E9",
    "#A855F7",
    "#F43F5E",
  ];

  const chartData = {
    labels: liveStocks.slice(0, 7).map((stock) => stock.name),
    datasets: [
      {
        label: "Price (₹)",
        data: liveStocks.slice(0, 7).map((stock) => stock.price),
        backgroundColor: chartColors,
        borderColor: chartBorderColors,
        borderWidth: 1.5,
      },
    ],
  };

  return (
    <aside className="watchlist-container">
      {/* Search Input Bar */}
      <div className="search-container">
        <SearchIcon className="search-icon" style={{ fontSize: "1.05rem" }} />
        <input
          type="text"
          placeholder="Search stocks (e.g. RELIANCE, TCS)"
          className="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search ? (
          <button
            onClick={() => setSearch("")}
            style={{
              position: "absolute",
              right: "24px",
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
            <CloseIcon style={{ fontSize: "0.95rem" }} />
          </button>
        ) : (
          <span className="counts">
            {filteredWatchlist.length} stocks
          </span>
        )}
      </div>

      {/* Stock Items List */}
      <ul className="watchlist-scrollable">
        {filteredWatchlist.map((stock, index) => (
          <WatchListItem stock={stock} key={index} />
        ))}
      </ul>

      {/* Collapsible Market Distribution Footer */}
      <div
        style={{
          borderTop: "1px solid var(--color-border)",
          background: "var(--color-bg-card)",
        }}
      >
        <button
          type="button"
          onClick={() => setShowChart(!showChart)}
          style={{
            width: "100%",
            padding: "8px 16px",
            background: "transparent",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.74rem",
            fontWeight: "700",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            cursor: "pointer",
          }}
        >
          <span>Market Weighting</span>
          <span style={{ fontSize: "0.8rem", color: "var(--color-text-faint)" }}>
            {showChart ? "✕ Close" : "📊 View"}
          </span>
        </button>

        {showChart && (
          <div style={{ padding: "12px 16px 16px" }}>
            <DoughnutChart data={chartData} />
          </div>
        )}
      </div>
    </aside>
  );
};

export default WatchList;

const WatchListItem = ({ stock }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);
  const generalContext = useContext(GeneralContext);

  return (
    <li
      className="watchlist-item"
      onMouseEnter={() => setShowWatchlistActions(true)}
      onMouseLeave={() => setShowWatchlistActions(false)}
      onClick={() => generalContext.openChartModal(stock.name)}
      style={{ cursor: "pointer" }}
      title={`Click to view ${stock.name} interactive chart`}
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

  const handleChartClick = (e) => {
    e.stopPropagation();
    generalContext.openChartModal(uid);
  };

  return (
    <div className="watchlist-actions">
      <Tooltip title="View Interactive Chart" placement="top" arrow TransitionComponent={Grow}>
        <button
          className="btn-chart-quick"
          onClick={handleChartClick}
          style={{
            background: "var(--color-bg-base)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            padding: "4px 6px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--color-primary)",
            transition: "all 0.15s ease",
          }}
          title="Interactive Chart"
        >
          <ShowChart style={{ fontSize: "1.05rem" }} />
        </button>
      </Tooltip>

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