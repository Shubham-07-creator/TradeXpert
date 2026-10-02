import React, { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { subscribeToLiveMarket, getNifty } from "../utils/liveMarket";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MAX_POINTS = 30;

const BenchmarkChart = ({ portfolioValue }) => {
  const [history, setHistory] = useState([]);
  const baseline = useRef(null);
  const [themeMode, setThemeMode] = useState(() => {
    return (
      (typeof document !== "undefined" &&
        document.documentElement.getAttribute("data-theme")) ||
      "light"
    );
  });

  useEffect(() => {
    const handleTheme = (e) => {
      setThemeMode(
        e.detail ||
          document.documentElement.getAttribute("data-theme") ||
          "light"
      );
    };
    window.addEventListener("themeChanged", handleTheme);
    return () => window.removeEventListener("themeChanged", handleTheme);
  }, []);

  const isDark = themeMode === "dark";

  useEffect(() => {
    if (!baseline.current && portfolioValue > 0) {
      const nifty = getNifty();
      if (nifty.price > 0) {
        baseline.current = { portfolioValue, niftyPrice: nifty.price };
      }
    }
  }, [portfolioValue]);

  useEffect(() => {
    const unsubscribe = subscribeToLiveMarket(() => {
      if (!baseline.current) return;

      const nifty = getNifty();

      const portfolioPercent =
        ((portfolioValue - baseline.current.portfolioValue) /
          baseline.current.portfolioValue) *
        100;

      const niftyPercent =
        ((nifty.price - baseline.current.niftyPrice) /
          baseline.current.niftyPrice) *
        100;

      setHistory((prev) =>
        [
          ...prev,
          {
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            portfolioPercent: Number(portfolioPercent.toFixed(2)),
            niftyPercent: Number(niftyPercent.toFixed(2)),
          },
        ].slice(-MAX_POINTS)
      );
    });

    return unsubscribe;
  }, [portfolioValue]);

  if (!baseline.current || history.length < 2) {
    return (
      <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--color-text-muted)" }}>
        <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📈</div>
        <p style={{ margin: 0, fontWeight: "700", fontSize: "0.92rem", color: "var(--color-text-strong)" }}>
          Portfolio vs NIFTY Comparison is syncing...
        </p>
        <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
          Buy a stock from the watchlist to watch your portfolio track live against NIFTY 50.
        </p>
      </div>
    );
  }

  const data = {
    labels: history.map((h) => h.time),
    datasets: [
      {
        label: "Your Portfolio",
        data: history.map((h) => h.portfolioPercent),
        borderColor: isDark ? "#10B981" : "#059669",
        backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(5, 150, 105, 0.15)",
        borderWidth: 2.2,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
      {
        label: "NIFTY 50",
        data: history.map((h) => h.niftyPercent),
        borderColor: isDark ? "#F87171" : "#DC2626",
        backgroundColor: isDark ? "rgba(248, 113, 113, 0.15)" : "rgba(220, 38, 38, 0.15)",
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: isDark ? "#F8FAFC" : "#0F172A",
          font: { weight: "700", family: "Inter, sans-serif", size: 12 },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.92)",
        titleColor: "#94A3B8",
        bodyColor: "#F8FAFC",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.raw >= 0 ? "+" : ""}${context.raw}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? "#94A3B8" : "#1E293B",
          font: { weight: "600", family: "Inter, sans-serif", size: 10 },
          maxTicksLimit: 6,
        },
      },
      y: {
        position: "right",
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)",
        },
        ticks: {
          color: isDark ? "#94A3B8" : "#1E293B",
          font: { weight: "600", family: "Inter, sans-serif", size: 11 },
          callback: (value) => `${value >= 0 ? "+" : ""}${value}%`,
        },
      },
    },
  };

  return (
    <div style={{ height: "230px", width: "100%", position: "relative" }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default BenchmarkChart;