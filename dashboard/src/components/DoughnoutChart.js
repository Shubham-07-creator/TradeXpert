import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export function DoughnutChart({ data }) {
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

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: isDark ? "#F8FAFC" : "#0F172A",
          font: { weight: "700", family: "Inter, sans-serif", size: 11 },
          padding: 8,
          usePointStyle: true,
          boxWidth: 6,
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.94)",
        titleColor: "#94A3B8",
        bodyColor: "#F8FAFC",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total ? ((val / total) * 100).toFixed(1) : 0;
            return ` ₹${Number(val).toLocaleString("en-IN", { maximumFractionDigits: 2 })} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: "215px", width: "100%", position: "relative" }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}