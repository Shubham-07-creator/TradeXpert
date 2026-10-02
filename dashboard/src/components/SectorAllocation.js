import React, { useEffect, useState } from "react";
import axios from "axios";
import { DoughnutChart } from "./DoughnoutChart";
import { getAuthHeader } from "../utils/auth";
import { getSnapshot, subscribeToLiveMarket } from "../utils/liveMarket";

const buildLiveMap = (snapshot) => {
  const map = {};
  snapshot.forEach((s) => {
    map[s.name] = s;
  });
  return map;
};

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
  const [liveMap, setLiveMap] = useState(() => buildLiveMap(getSnapshot()));

  useEffect(() => {
    fetchHoldings();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToLiveMarket((snapshot) =>
      setLiveMap(buildLiveMap(snapshot))
    );
    return unsubscribe;
  }, []);

  const fetchHoldings = async () => {
    try {
      const res = await axios.get(`${API}/allHoldings`, {
        headers: getAuthHeader(),
      });
      setHoldings(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const sectorTotals = {};
  holdings.forEach((h) => {
    const live = liveMap[h.name];
    const sector = live?.sector || "Diversified";
    const price = live ? live.price : h.price;
    sectorTotals[sector] = (sectorTotals[sector] || 0) + price * h.qty;
  });

  const labels = Object.keys(sectorTotals);
  const values = Object.values(sectorTotals);

  if (labels.length === 0) {
    return (
      <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--color-text-muted)" }}>
        <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🥧</div>
        <p style={{ margin: 0, fontWeight: "700", fontSize: "0.92rem", color: "var(--color-text-strong)" }}>
          विभिन्न सेक्टर्स में विविधीकरण (Diversification)
        </p>
        <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
          जब आप अलग-अलग कंपनियों के शेयर खरीदेंगे, तो आपका सेक्टर ब्रेकडाउन यहाँ दिखेगा।
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