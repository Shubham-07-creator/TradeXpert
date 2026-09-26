import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { VerticalGraph } from "./VerticalGraph";
import { getAuthHeader } from "../utils/auth";
import { getSnapshot, subscribeToLiveMarket } from "../utils/liveMarket";

// Turns the live market snapshot array into a name -> stock lookup map.
const buildLiveMap = (snapshot) => {
  const map = {};
  snapshot.forEach((s) => {
    map[s.name] = s;
  });
  return map;
};

const Holdings = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  const [allHoldings, setAllHoldings] = useState([]);

  // Live-updating price map (ticks every ~2.5s) — see utils/liveMarket.js.
  // A holding's LTP/P&L now moves on its own instead of only changing
  // after a manual buy/sell, as long as its name matches a watchlist
  // stock. Holdings not on the watchlist just keep their stored price.
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
      const res = await axios.get(`${API}/allHoldings`, {
        headers: getAuthHeader(),
      });

      setAllHoldings(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSell = async (stock) => {
    const live = liveMap[stock.name];
    const sellPrice = live ? live.price : stock.price;

    try {
      await axios.post(
        `${API}/newOrder`,
        {
          name: stock.name,
          qty: stock.qty,
          price: sellPrice,
          mode: "SELL",
        },
        { headers: getAuthHeader() },
      );

      toast.success("Sell Stock ✅", {
        style: {
          background: "#ff4d4f",
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
      <h3 className="title">Holdings ({allHoldings.length})</h3>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty</th>
              <th>Avg</th>
              <th>LTP</th>
              <th>Value</th>
              <th>P&L</th>
              <th>Net</th>
              <th>Day</th>
            </tr>
          </thead>

          <tbody>
            {allHoldings.map((stock, i) => {
              const live = liveMap[stock.name];
              const price = live ? live.price : stock.price;

              const value = price * stock.qty;

              const pnl = value - stock.avg * stock.qty;

              const cls = pnl >= 0 ? "profit" : "loss";

              const netPercent = ((price - stock.avg) / stock.avg) * 100;

              const dayLabel = live ? live.percent : stock.day;

              return (
                <tr
                  key={i}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
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

                  <td>{value.toFixed(2)}</td>

                  <td className={cls}>{pnl.toFixed(2)}</td>

                  <td className={netPercent >= 0 ? "profit" : "loss"}>
                    {netPercent >= 0 ? "+" : ""}
                    {netPercent.toFixed(2)}%
                  </td>

                  <td>{dayLabel}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <VerticalGraph
        data={{
          labels: allHoldings.map((s) => s.name),
          datasets: [
            {
              label: "Price",
              data: allHoldings.map((s) =>
                liveMap[s.name] ? liveMap[s.name].price : s.price,
              ),
              backgroundColor: "rgba(255,99,132,0.5)",
            },
          ],
        }}
      />
    </>
  );
};

export default Holdings;