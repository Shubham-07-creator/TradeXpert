import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Orders.css";

const Orders = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/orders`);

      setOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="orders">
      <h3>Orders History</h3>

      <table className="order-table">
        <thead>
          <tr>
            <th>Stock</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Type</th>
            <th>Date & Time</th>
          </tr>
        </thead>

        <tbody>
          {orders.length > 0 ? (
            orders.map((o, i) => (
              <tr key={i}>
                <td>{o.name}</td>

                <td>{o.qty}</td>

                <td>₹{o.price}</td>

                <td
                  style={{
                    color: o.mode === "BUY" ? "#4caf50" : "#ff4d4f",
                    fontWeight: "bold",
                  }}
                >
                  {o.mode}
                </td>

                <td>{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                style={{
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                No Orders Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
