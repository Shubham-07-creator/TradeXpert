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
  Legend,
);

const MAX_POINTS = 30;

// Tracks % change of the user's portfolio vs the (simulated) NIFTY 50
// index since this component mounted. Both series start at 0% at the
// same moment so they're a fair visual comparison.
const BenchmarkChart = ({ portfolioValue }) => {
  const [history, setHistory] = useState([]);
  const baseline = useRef(null);

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
            time: new Date().toLocaleTimeString(),
            portfolioPercent: Number(portfolioPercent.toFixed(2)),
            niftyPercent: Number(niftyPercent.toFixed(2)),
          },
        ].slice(-MAX_POINTS),
      );
    });

    return unsubscribe;
  }, [portfolioValue]);

  if (!baseline.current || history.length < 2) {
    return (
      <div className="section">
        <p style={{ padding: "10px 0", color: "#888" }}>
          Portfolio vs NIFTY tracking starts once your holdings have a
          value — buy a stock and check back here in a few seconds.
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
        borderColor: "rgb(103, 201, 136)",
        backgroundColor: "rgba(103, 201, 136, 0.15)",
        tension: 0.3,
      },
      {
        label: "NIFTY 50",
        data: history.map((h) => h.niftyPercent),
        borderColor: "rgb(223, 73, 73)",
        backgroundColor: "rgba(223, 73, 73, 0.15)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Portfolio vs NIFTY 50 (% change)" },
    },
  };

  return (
    <div className="section">
      <Line data={data} options={options} />
    </div>
  );
};

export default BenchmarkChart;