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

const SECTOR_COLORS = [
  "rgba(255, 99, 132, 0.6)",
  "rgba(54, 162, 235, 0.6)",
  "rgba(255, 206, 86, 0.6)",
  "rgba(75, 192, 192, 0.6)",
  "rgba(153, 102, 255, 0.6)",
  "rgba(255, 159, 64, 0.6)",
  "rgba(103, 201, 136, 0.6)",
  "rgba(223, 73, 73, 0.6)",
  "rgba(180, 180, 180, 0.6)",
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
      setLiveMap(buildLiveMap(snapshot)),
    );
    return unsubscribe;
  }, []);

  const fetchHoldings = async () => {
    try {
      const res = await axios.get(`${API}/allHoldings`, {
        headers: getAuthHeader(),
      });
      setHoldings(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const sectorTotals = {};
  holdings.forEach((h) => {
    const live = liveMap[h.name];
    const sector = live?.sector || "Other";
    const price = live ? live.price : h.price;
    sectorTotals[sector] = (sectorTotals[sector] || 0) + price * h.qty;
  });

  const labels = Object.keys(sectorTotals);
  const values = Object.values(sectorTotals);

  if (labels.length === 0) {
    return (
      <div className="section">
        <p style={{ padding: "10px 0", color: "#888" }}>
          Buy some stocks to see your sector-wise diversification here.
        </p>
      </div>
    );
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Sector allocation (₹)",
        data: values,
        backgroundColor: SECTOR_COLORS,
      },
    ],
  };

  return (
    <div className="section">
      <p style={{ marginBottom: "10px" }}>
        Sector-wise Portfolio Diversification
      </p>
      <DoughnutChart data={data} />
    </div>
  );
};

export default SectorAllocation;