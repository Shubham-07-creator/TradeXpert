import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Orders.css";
import { getAuthHeader } from "../utils/auth";

const Orders = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const fetchOrders = async (p) => {
    try {
      const res = await axios.get(`${API}/orders?page=${p}&limit=20`, {
        headers: getAuthHeader(),
      });

      // Support both paginated and legacy response formats
      if (Array.isArray(res.data)) {
        setOrders(res.data);
        setTotalPages(1);
      } else {
        setOrders(res.data.orders || []);
        setTotalPages(res.data.totalPages || 1);
      }
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginTop: "15px",
          }}
        >
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn btn-sm btn-outline-primary"
          >
            ← Prev
          </button>
          <span style={{ alignSelf: "center" }}>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn btn-sm btn-outline-primary"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;