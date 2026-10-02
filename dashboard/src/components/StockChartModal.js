import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip as ChartTooltip,
} from "chart.js";
import {
  Close as CloseIcon,
  TrendingUp,
  ShowChart,
  BarChart,
  ShoppingCartOutlined,
  SellOutlined,
} from "@mui/icons-material";
import { getLivePrice, subscribeToLiveMarket } from "../utils/liveMarket";
import "./StockChartModal.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  ChartTooltip
);

// Deterministic Pseudo-Random Generator for consistent stock history
function pseudoRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Generate realistic OHLC historical dataset for any timeframe
function generateOHLC(stockName, basePrice, timeframe) {
  let count = 25;
  let labelFormat = "time";
  let volatility = 0.008;

  if (timeframe === "1D") {
    count = 26;
    labelFormat = "time";
    volatility = 0.004;
  } else if (timeframe === "1W") {
    count = 7;
    labelFormat = "day";
    volatility = 0.015;
  } else if (timeframe === "1M") {
    count = 22;
    labelFormat = "date";
    volatility = 0.02;
  } else if (timeframe === "1Y") {
    count = 48;
    labelFormat = "month";
    volatility = 0.035;
  } else if (timeframe === "ALL") {
    count = 60;
    labelFormat = "year";
    volatility = 0.05;
  }

  let hash = 0;
  for (let i = 0; i < stockName.length; i++) {
    hash = (hash << 5) - hash + stockName.charCodeAt(i);
    hash |= 0;
  }

  const candles = [];
  let current = basePrice * (1 - volatility * (count / 2));
  let seed = Math.abs(hash);

  const now = new Date();

  for (let i = 0; i < count; i++) {
    const r1 = pseudoRandom(seed++);
    const r2 = pseudoRandom(seed++);
    const r3 = pseudoRandom(seed++);
    const r4 = pseudoRandom(seed++);

    const delta = (r1 - 0.48) * volatility * current;
    const open = current;
    const close = i === count - 1 ? basePrice : open + delta;
    const high = Math.max(open, close) + r2 * volatility * current * 0.8;
    const low = Math.min(open, close) - r3 * volatility * current * 0.8;
    const volume = Math.floor(50000 + r4 * 450000);

    let label = "";
    if (labelFormat === "time") {
      const minutes = 9 * 60 + 15 + i * 15; // 09:15 to 15:30
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      label = `${h < 10 ? "0" : ""}${h}:${m < 10 ? "0" : ""}${m}`;
    } else if (labelFormat === "day") {
      const d = new Date();
      d.setDate(now.getDate() - (count - 1 - i));
      label = d.toLocaleDateString("en-IN", { weekday: "short" });
    } else if (labelFormat === "date") {
      const d = new Date();
      d.setDate(now.getDate() - (count - 1 - i) * 1.3);
      label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    } else if (labelFormat === "month") {
      const d = new Date();
      d.setMonth(now.getMonth() - (count - 1 - i) / 4);
      label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    } else {
      const d = new Date();
      d.setFullYear(now.getFullYear() - 5 + Math.floor(i / 12));
      label = `${d.getFullYear()}`;
    }

    candles.push({
      time: label,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });

    current = close;
  }

  return candles;
}

const StockChartModal = ({ stockName, onClose, onBuy, onSell }) => {
  const [timeframe, setTimeframe] = useState("1D");
  const [chartType, setChartType] = useState("line"); // "line" | "candle"
  const [livePrice, setLivePrice] = useState(() => getLivePrice(stockName) || 1000);
  const [hoveredCandle, setHoveredCandle] = useState(null);
  const canvasRef = useRef(null);

  // Subscribe to real-time price updates for this stock
  useEffect(() => {
    const unsubscribe = subscribeToLiveMarket(() => {
      const p = getLivePrice(stockName);
      if (p) setLivePrice(p);
    });
    return unsubscribe;
  }, [stockName]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Generate dataset for current timeframe
  const candles = useMemo(() => {
    return generateOHLC(stockName, livePrice, timeframe);
  }, [stockName, livePrice, timeframe]);

  const activeCandle = hoveredCandle || candles[candles.length - 1];

  const firstPrice = candles[0]?.open || livePrice;
  const priceDiff = livePrice - firstPrice;
  const percentChange = ((priceDiff / firstPrice) * 100).toFixed(2);
  const isPositive = priceDiff >= 0;

  // Key Statistics
  const highPrice = useMemo(
    () => Math.max(...candles.map((c) => c.high)),
    [candles]
  );
  const lowPrice = useMemo(
    () => Math.min(...candles.map((c) => c.low)),
    [candles]
  );
  const fiftyTwoWeekHigh = (livePrice * 1.28).toFixed(2);
  const fiftyTwoWeekLow = (livePrice * 0.76).toFixed(2);
  const totalVolume = useMemo(
    () => candles.reduce((acc, c) => acc + c.volume, 0),
    [candles]
  );

  // Candlestick Canvas Renderer
  const drawCandlesticks = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 20, right: 60, bottom: 40, left: 16 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const minP = Math.min(...candles.map((c) => c.low));
    const maxP = Math.max(...candles.map((c) => c.high));
    const rangeP = maxP - minP || 1;

    const getY = (val) =>
      padding.top + chartH - ((val - minP) / rangeP) * chartH;

    // Draw horizontal grid lines & price labels
    const gridSteps = 5;
    ctx.strokeStyle = "rgba(148, 163, 184, 0.12)";
    ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
    ctx.font = "11px Inter, system-ui, sans-serif";
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridSteps; i++) {
      const price = minP + (rangeP / gridSteps) * i;
      const y = getY(price);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillText(`₹${price.toFixed(1)}`, width - padding.right + 8, y + 4);
    }

    // Draw Candles & Volume
    const candleWidth = Math.max(4, (chartW / candles.length) * 0.65);
    const spacing = chartW / candles.length;

    const maxVol = Math.max(...candles.map((c) => c.volume));
    const volHeight = chartH * 0.25;

    candles.forEach((c, idx) => {
      const x = padding.left + idx * spacing + spacing / 2;
      const isBull = c.close >= c.open;
      const candleColor = isBull ? "#00D09C" : "#EF4444";

      // 1. Draw Volume bar
      const vH = (c.volume / maxVol) * volHeight;
      ctx.fillStyle = isBull
        ? "rgba(0, 208, 156, 0.2)"
        : "rgba(239, 68, 68, 0.2)";
      ctx.fillRect(
        x - candleWidth / 2,
        padding.top + chartH - vH,
        candleWidth,
        vH
      );

      // 2. Draw Wick line (High to Low)
      ctx.strokeStyle = candleColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, getY(c.high));
      ctx.lineTo(x, getY(c.low));
      ctx.stroke();

      // 3. Draw Candle Body (Open to Close)
      const openY = getY(c.open);
      const closeY = getY(c.close);
      const bodyY = Math.min(openY, closeY);
      const bodyH = Math.max(2, Math.abs(closeY - openY));

      ctx.fillStyle = candleColor;
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyH);

      // 4. X-Axis Time Labels (spaced out)
      if (idx % Math.ceil(candles.length / 6) === 0) {
        ctx.fillStyle = "rgba(148, 163, 184, 0.8)";
        ctx.fillText(c.time, x - 14, height - 12);
      }
    });
  }, [candles]);

  useEffect(() => {
    if (chartType === "candle") {
      drawCandlesticks();
      const handleResize = () => drawCandlesticks();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [chartType, drawCandlesticks]);

  // Line Chart Configuration
  const lineChartData = {
    labels: candles.map((c) => c.time),
    datasets: [
      {
        fill: true,
        label: `${stockName} Price (₹)`,
        data: candles.map((c) => c.close),
        borderColor: isPositive ? "#00D09C" : "#EF4444",
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );
          if (isPositive) {
            gradient.addColorStop(0, "rgba(0, 208, 156, 0.28)");
            gradient.addColorStop(1, "rgba(0, 208, 156, 0.00)");
          } else {
            gradient.addColorStop(0, "rgba(239, 68, 68, 0.28)");
            gradient.addColorStop(1, "rgba(239, 68, 68, 0.00)");
          }
          return gradient;
        },
        borderWidth: 2.2,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: isPositive ? "#00D09C" : "#EF4444",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !candles.length) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const padding = { left: 16, right: 60 };
    const chartW = rect.width - padding.left - padding.right;
    const spacing = chartW / candles.length;
    const idx = Math.floor((mouseX - padding.left) / spacing);
    if (idx >= 0 && idx < candles.length) {
      setHoveredCandle(candles[idx]);
    }
  };

  const handleCanvasMouseLeave = () => {
    setHoveredCandle(null);
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        titleColor: "#94A3B8",
        bodyColor: "#F8FAFC",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => {
            const idx = context.dataIndex;
            if (idx !== undefined && candles[idx]) {
              setHoveredCandle(candles[idx]);
            }
            return ` ₹${Number(context.raw).toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "rgba(148, 163, 184, 0.8)",
          font: { size: 11, family: "Inter, sans-serif" },
          maxTicksLimit: 7,
        },
      },
      y: {
        position: "right",
        grid: { color: "rgba(148, 163, 184, 0.12)" },
        ticks: {
          color: "rgba(148, 163, 184, 0.8)",
          font: { size: 11, family: "Inter, sans-serif" },
          callback: (value) => `₹${value.toFixed(1)}`,
        },
      },
    },
  };

  return (
    <div className="chart-modal-overlay" onClick={onClose}>
      <div
        className="chart-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {/* Header */}
        <div className="chart-modal-header">
          <div className="chart-stock-info">
            <div className="chart-stock-avatar">
              {stockName.slice(0, 2)}
            </div>
            <div className="chart-title-area">
              <h3>
                {stockName}
                <span className="chart-badge">NSE • EQ</span>
              </h3>
              <div className="chart-live-price-group">
                <span className="chart-live-price">
                  ₹{Number(livePrice).toFixed(2)}
                </span>
                <span
                  className={`chart-percent-badge ${
                    isPositive ? "up" : "down"
                  }`}
                >
                  <TrendingUp
                    style={{
                      fontSize: "1rem",
                      transform: isPositive ? "none" : "rotate(90deg)",
                    }}
                  />
                  {isPositive ? "+" : ""}
                  {priceDiff.toFixed(2)} ({isPositive ? "+" : ""}
                  {percentChange}%)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Trade Triggers & Close */}
          <div className="chart-modal-header-actions">
            <button
              className="btn-chart-action buy"
              onClick={() => {
                onClose();
                if (onBuy) onBuy(stockName);
              }}
            >
              <ShoppingCartOutlined style={{ fontSize: "1rem" }} />
              BUY
            </button>
            <button
              className="btn-chart-action sell"
              onClick={() => {
                onClose();
                if (onSell) onSell(stockName);
              }}
            >
              <SellOutlined style={{ fontSize: "1rem" }} />
              SELL
            </button>
            <button
              className="btn-chart-close"
              onClick={onClose}
              title="Close modal (Esc)"
            >
              <CloseIcon style={{ fontSize: "1.2rem" }} />
            </button>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="chart-controls-bar">
          {/* Timeframe Selectors */}
          <div className="chart-tabs-group">
            {["1D", "1W", "1M", "1Y", "ALL"].map((tf) => (
              <button
                key={tf}
                className={`chart-tab-pill ${timeframe === tf ? "active" : ""}`}
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Line vs Candlestick Switch */}
          <div className="chart-type-toggle">
            <button
              className={`chart-type-btn ${
                chartType === "line" ? "active" : ""
              }`}
              onClick={() => setChartType("line")}
            >
              <ShowChart style={{ fontSize: "1rem" }} /> Area
            </button>
            <button
              className={`chart-type-btn ${
                chartType === "candle" ? "active" : ""
              }`}
              onClick={() => setChartType("candle")}
            >
              <BarChart style={{ fontSize: "1rem" }} /> Candles
            </button>
          </div>
        </div>

        {/* Real-time OHLC Floating HUD Bar */}
        <div className="chart-ohlc-hud">
          <div className="chart-ohlc-item">
            Time: <span>{activeCandle?.time}</span>
          </div>
          <div className="chart-ohlc-item">
            Open: <span>₹{activeCandle?.open?.toFixed(2)}</span>
          </div>
          <div className="chart-ohlc-item">
            High: <span>₹{activeCandle?.high?.toFixed(2)}</span>
          </div>
          <div className="chart-ohlc-item">
            Low: <span>₹{activeCandle?.low?.toFixed(2)}</span>
          </div>
          <div
            className={`chart-ohlc-item ${
              activeCandle?.close >= activeCandle?.open
                ? "bullish"
                : "bearish"
            }`}
          >
            Close: <span>₹{activeCandle?.close?.toFixed(2)}</span>
          </div>
          <div className="chart-ohlc-item">
            Vol: <span>{activeCandle?.volume?.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div className="chart-canvas-container">
          <div className="chart-canvas-wrapper">
            {chartType === "line" ? (
              <Line data={lineChartData} options={lineChartOptions} />
            ) : (
              <canvas
                ref={canvasRef}
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={handleCanvasMouseLeave}
                style={{ width: "100%", height: "100%", cursor: "crosshair" }}
              />
            )}
          </div>
        </div>

        {/* Key Market Stats Bar */}
        <div className="chart-stats-footer">
          <div className="stat-item">
            <span className="stat-item-label">Day High</span>
            <span className="stat-item-value" style={{ color: "var(--color-profit)" }}>
              ₹{highPrice.toFixed(2)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-item-label">Day Low</span>
            <span className="stat-item-value" style={{ color: "var(--color-loss)" }}>
              ₹{lowPrice.toFixed(2)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-item-label">52W High</span>
            <span className="stat-item-value">₹{fiftyTwoWeekHigh}</span>
          </div>
          <div className="stat-item">
            <span className="stat-item-label">52W Low</span>
            <span className="stat-item-value">₹{fiftyTwoWeekLow}</span>
          </div>
          <div className="stat-item">
            <span className="stat-item-label">Volume</span>
            <span className="stat-item-value">
              {(totalVolume / 100000).toFixed(2)} Lakh
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockChartModal;
