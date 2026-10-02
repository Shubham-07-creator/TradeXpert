import React, { useState, useEffect, useContext, useMemo } from "react";
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

// Constant chart palettes outside component to avoid recreation
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

const WatchList = () => {
  const [search, setSearch] = useState("");
  const [liveStocks, setLiveStocks] = useState(getSnapshot());

  useEffect(() => {
    const unsubscribe = subscribeToLiveMarket((stocks) => {
      setLiveStocks(stocks);
    });
    return unsubscribe;
  }, []);

  // O(N) single-pass search with pre-computed lowercase query
  const filteredWatchlist = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return liveStocks;
    return liveStocks.filter((stock) =>
      stock.name.toLowerCase().includes(q)
    );
  }, [liveStocks, search]);

  // Memoized Chart Dataset: O(1) creation only when live price changes
  const chartData = useMemo(() => {
    const topStocks = liveStocks.slice(0, 7);
    return {
      labels: topStocks.map((stock) => stock.name),
      datasets: [
        {
          label: "Price (₹)",
          data: topStocks.map((stock) => stock.price),
          backgroundColor: chartColors,
          borderColor: chartBorderColors,
          borderWidth: 1.5,
        },
      ],
    };
  }, [liveStocks]);

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <aside className={`watchlist-container ${isMobileOpen ? "is-mobile-expanded" : ""}`}>
      {/* Mobile-only toggle header */}
      <div
        className="watchlist-mobile-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        role="button"
        tabIndex={0}
      >
        <div className="d-flex align-items-center gap-2">
          <span>📊</span>
          <span className="fw-bold">Watchlist</span>
          <span className="counts">{filteredWatchlist.length}</span>
        </div>
        <div className="d-flex align-items-center gap-1 text-primary fw-semibold" style={{ fontSize: "0.82rem" }}>
          <span>{isMobileOpen ? "Hide List" : "Search & Trade"}</span>
          <span>{isMobileOpen ? "▲" : "▼"}</span>
        </div>
      </div>

      <div className={`watchlist-content-body ${isMobileOpen ? "show" : ""}`}>
        {/* Search Input Bar */}
        <div className="search-container">
        <SearchIcon className="search-icon" style={{ fontSize: "1rem" }} />
        <input
          type="text"
          placeholder="Search stocks..."
          className="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search ? (
          <button
            onClick={() => setSearch("")}
            style={{
              position: "absolute",
              right: "18px",
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
            {filteredWatchlist.length}
          </span>
        )}
      </div>

      {/* Stock Items List */}
      <ul className="watchlist-scrollable">
        {filteredWatchlist.map((stock, index) => (
          <WatchListItem stock={stock} key={index} />
        ))}
      </ul>

      {/* Market Distribution Doughnut Chart - Always Visible */}
      <div
        style={{
          borderTop: "1px solid var(--color-border)",
          background: "var(--color-bg-card)",
          padding: "10px 14px 14px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.72rem",
            fontWeight: "700",
            color: "var(--color-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "6px",
          }}
        >
          <span>Market Weighting</span>
          <span style={{ fontSize: "0.7rem", color: "var(--color-text-faint)" }}>
            Top 7 Stocks
          </span>
        </div>
        <DoughnutChart data={chartData} />
      </div>
      </div>
    </aside>
  );
};

export default WatchList;

const WatchListItem = React.memo(({ stock }) => {
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
}, (prevProps, nextProps) => {
  return (
    prevProps.stock.name === nextProps.stock.name &&
    prevProps.stock.price === nextProps.stock.price &&
    prevProps.stock.percent === nextProps.stock.percent &&
    prevProps.stock.isDown === nextProps.stock.isDown
  );
});

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