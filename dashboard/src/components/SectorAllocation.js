import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { DoughnutChart } from "./DoughnoutChart";
import { getAuthHeader } from "../utils/auth";
import { getLiveMap, subscribeToLiveMarket } from "../utils/liveMarket";

// Vibrant, solid neo-broker sector colors (high contrast in both Light & Dark modes)
const SECTOR_COLORS = [
  "#387ED1", // Blue (Banking/Financials)
  "#10B981", // Emerald (Consumer/FMCG)
  "#8B5CF6", // Purple (Technology)
  "#F59E0B", // Amber (Energy/Oil)
  "#EC4899", // Pink (Auto)
  "#06B6D4", // Cyan (Healthcare/Pharma)
  "#F97316", // Orange (Metals & Mining)
  "#6366F1", // Indigo (Infrastructure)
  "#14B8A6", // Teal (Telecom)
  "#84CC16", // Lime (Other)
];

const SectorAllocation = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  const [holdings, setHoldings] = useState([]);
  const [liveMap, setLiveMap] = useState(getLiveMap);

  const fetchHoldings = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/allHoldings`, {
        headers: getAuthHeader(),
      });
      setHoldings(res.data || []);
    } catch (err) {
      console.log(err);
    }
  }, [API]);

  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  useEffect(() => {
    const unsubscribe = subscribeToLiveMarket((_arr, map) =>
      setLiveMap(map)
    );
    return unsubscribe;
  }, []);

  const { labels, values } = useMemo(() => {
    const sectorTotals = {};
    for (let i = 0; i < holdings.length; i++) {
      const h = holdings[i];
      const live = liveMap[h.name];
      const sector = live?.sector || "Diversified";
      const price = live ? live.price : h.price;
      sectorTotals[sector] = (sectorTotals[sector] || 0) + price * h.qty;
    }
    return { labels: Object.keys(sectorTotals), values: Object.values(sectorTotals) };
  }, [holdings, liveMap]);

  if (labels.length === 0) {
    return (
      <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--color-text-muted)" }}>
        <div style={{ marginBottom: "8px", display: "flex", justifyContent: "center", color: "var(--color-text-muted)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
            <path d="M22 12A10 10 0 0 0 12 2v10z" />
          </svg>
        </div>
        <p style={{ margin: 0, fontWeight: "700", fontSize: "0.92rem", color: "var(--color-text-strong)" }}>
          Sector Diversification
        </p>
        <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
          Buy shares across different companies to see your industry breakdown here.
        </p>
      </div>
    );
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Sector allocation",
        data: values,
        backgroundColor: SECTOR_COLORS.slice(0, labels.length),
        borderWidth: 2,
        borderColor: "var(--color-bg-card)",
      },
    ],
  };

  return (
    <div>
      <DoughnutChart data={data} />
    </div>
  );
};

export default SectorAllocation;