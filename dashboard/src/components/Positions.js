import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getAuthHeader } from "../utils/auth";
import { getSnapshot, subscribeToLiveMarket } from "../utils/liveMarket";

const buildLiveMap = (snapshot) => {
  const map = {};
  snapshot.forEach((s) => {
    map[s.name] = s;
  });
  return map;
};

const Positions = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  const [allPositions, setAllPositions] = useState([]);

  // Live-updating price map — see utils/liveMarket.js. Positions whose
  // name matches a watchlist stock get a moving LTP/P&L automatically.
  const [liveMap, setLiveMap] = useState(() => buildLiveMap(getSnapshot()));

  const [hover, setHover] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToLiveMarket((snapshot) => {
      setLiveMap(buildLiveMap(snapshot));
    });
    return unsubscribe;
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/allPositions`, {
        headers: getAuthHeader(),
      });

      setAllPositions(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSell = async (stock) => {
    const live = liveMap[stock.name];
    const sellPrice = live ? live.price : stock.price;

    try {
      const res = await axios.post(
        `${API}/newOrder`,
        {
          name: stock.name,
          qty: stock.qty,
          price: sellPrice,
          mode: "SELL",
        },
        { headers: getAuthHeader() },
      );

      const gain = res.data.realizedPnL || 0;
      const gainText =
        gain >= 0
          ? `Sold ✅ — Profit ₹${gain.toFixed(2)}`
          : `Sold ✅ — Loss ₹${Math.abs(gain).toFixed(2)}`;

      toast.success(gainText, {
        style: {
          background: gain >= 0 ? "#1ea672" : "#e5484d",
          color: "#fff",
        },
      });

      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Sell failed ❌");
    }
  };

  return (
    <>
      <h3 className="title">Positions ({allPositions.length})</h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Instrument</th>
              <th>Qty</th>
              <th>Avg</th>
              <th>LTP</th>
              <th>P&L</th>
              <th>Chg</th>
            </tr>
          </thead>

          <tbody>
            {allPositions.map((stock, i) => {
              const live = liveMap[stock.name];
              const price = live ? live.price : stock.price;

              const pnl = (price - stock.avg) * stock.qty;

              const cls = pnl >= 0 ? "profit" : "loss";

              const chgLabel = live ? live.percent : stock.chg;

              return (
                <tr
                  key={i}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  <td>{stock.product}</td>

                  <td>
                    {stock.name}

                    {hover === i && (
                      <button
                        style={{
                          marginLeft: "10px",
                          background: "#ff4d4f",
                          color: "#fff",
                          border: "none",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleSell(stock)}
                      >
                        Sell
                      </button>
                    )}
                  </td>

                  <td>{stock.qty}</td>

                  <td>{stock.avg.toFixed(2)}</td>

                  <td>{price.toFixed(2)}</td>

                  <td className={cls}>{pnl.toFixed(2)}</td>

                  <td>{chgLabel}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Positions;