import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const Positions = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  const [allPositions, setAllPositions] = useState([]);

  const [hover, setHover] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/allPositions`);

      setAllPositions(res.data);
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

      toast.success("Sell Order Executed 🚀", {
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
              const pnl = (stock.price - stock.avg) * stock.qty;

              const cls = pnl >= 0 ? "profit" : "loss";

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

                  <td>{stock.price.toFixed(2)}</td>

                  <td className={cls}>{pnl.toFixed(2)}</td>

                  <td>{stock.chg}</td>
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
