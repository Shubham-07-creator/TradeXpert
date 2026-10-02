import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function VerticalGraph({ data }) {
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
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.94)",
        titleColor: "#94A3B8",
        bodyColor: "#F8FAFC",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => ` Current Price: ₹${Number(context.raw).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? "#94A3B8" : "#1E293B",
          font: { weight: "700", family: "Inter, sans-serif", size: 11 },
          maxRotation: 45,
          minRotation: 0,
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
          callback: (value) => `₹${Number(value).toLocaleString("en-IN")}`,
        },
      },
    },
  };

  return (
    <div style={{ height: "260px", width: "100%", position: "relative" }}>
      <Bar options={options} data={data} />
    </div>
  );
}