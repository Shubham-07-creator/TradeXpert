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
    <div className="orders-wrapper fade-up">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="page-title">Orders Log ({orders.length})</h2>
          <p className="page-subtitle">
            Complete transaction record of all buy and sell orders.
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-card">
        {orders.length > 0 ? (
          <div className="table-responsive">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Instrument</th>
                  <th>Quantity</th>
                  <th>Execution Price</th>
                  <th>Order Value</th>
                  <th>Date &amp; Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => {
                  const isBuy = o.mode === "BUY";
                  const orderValue = Number(o.qty) * Number(o.price);

                  return (
                    <tr key={i}>
                      <td>
                        <span className={isBuy ? "badge-buy" : "badge-sell"}>
                          {o.mode}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: "700", color: "var(--color-text-strong)" }}>
                            {o.name}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "var(--color-text-faint)" }}>
                            NSE • Market
                          </span>
                        </div>
                      </td>

                      <td style={{ fontWeight: "600" }}>{o.qty} shares</td>
                      <td style={{ fontWeight: "700" }}>₹{Number(o.price).toFixed(2)}</td>
                      <td style={{ fontWeight: "600" }}>₹{orderValue.toFixed(2)}</td>

                      <td style={{ color: "var(--color-text-muted)", fontSize: "0.82rem" }}>
                        {new Date(o.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>

                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            color: "var(--color-profit)",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: "var(--color-profit)",
                            }}
                          ></span>
                          Executed
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h4 className="empty-state-title">No Orders Placed Yet</h4>
            <p className="empty-state-text">
              You haven't executed any trades yet. Select a stock from the
              watchlist on the left and place your first trade!
            </p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-page"
          >
            ← Previous
          </button>
          <span className="page-indicator">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-page"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;