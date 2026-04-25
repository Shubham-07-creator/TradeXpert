import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { VerticalGraph } from "./VerticalGraph";

const Holdings = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  const [allHoldings, setAllHoldings] = useState([]);

  const [hover, setHover] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/allHoldings`);

      setAllHoldings(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSell = async (stock) => {
    try {
      await axios.post(`${API}/newOrder`, {
        name: stock.name,
        qty: stock.qty,
        price: stock.price,
        mode: "SELL",
      });

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
              const value = stock.price * stock.qty;

              const pnl = value - stock.avg * stock.qty;

              const cls = pnl >= 0 ? "profit" : "loss";

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

                  <td>{stock.price.toFixed(2)}</td>

                  <td>{value.toFixed(2)}</td>

                  <td className={cls}>{pnl.toFixed(2)}</td>

                  <td>{stock.net}</td>

                  <td>{stock.day}</td>
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
              data: allHoldings.map((s) => s.price),
              backgroundColor: "rgba(255,99,132,0.5)",
            },
          ],
        }}
      />
    </>
  );
};

export default Holdings;
