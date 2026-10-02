import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./Orders.css";
import { getAuthHeader } from "../utils/auth";
import { socket } from "../utils/socket";
import ConfirmModal from "./ConfirmModal";

const Orders = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("ALL"); // "ALL" | "OPEN" | "EXECUTED"
  const [cancellingId, setCancellingId] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const fetchOrders = useCallback(
    async (p) => {
      try {
        const res = await axios.get(`${API}/orders?page=${p}&limit=50`, {
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
    },
    [API]
  );

  useEffect(() => {
    fetchOrders(page);
  }, [page, fetchOrders]);

  // Real-time reactive updates when limit orders or GTT trigger
  useEffect(() => {
    const handleOrderExecuted = (data) => {
      fetchOrders(page);
      toast.success(
        `Limit Order Filled: ${data.mode} ${data.qty}x ${data.name} at ₹${Number(data.price).toFixed(2)} 🎉`,
        {
          style: {
            background: "#00D09C",
            color: "#fff",
            fontWeight: "600",
          },
        }
      );
    };

    const handleGttTriggered = (data) => {
      fetchOrders(page);
      const isSL = data.type === "STOP_LOSS";
      toast(
        `${isSL ? "🛑 Stop-Loss Triggered" : "🎉 Target Achieved"}: Auto-sold ${data.qty}x ${data.name} at ₹${Number(data.price).toFixed(2)}`,
        {
          style: {
            background: isSL ? "#EF4444" : "#00D09C",
            color: "#fff",
            fontWeight: "600",
          },
        }
      );
    };

    socket.on("order:executed", handleOrderExecuted);
    socket.on("gtt:triggered", handleGttTriggered);

    return () => {
      socket.off("order:executed", handleOrderExecuted);
      socket.off("gtt:triggered", handleGttTriggered);
    };
  }, [fetchOrders, page]);

  // Cancel OPEN Limit Order
  const handleCancelOrder = async (orderId) => {
    try {
      setCancellingId(orderId);
      const res = await axios.put(
        `${API}/orders/cancel/${orderId}`,
        {},
        { headers: getAuthHeader() }
      );

      toast.success(res.data.message || "Limit order cancelled ✅");
      fetchOrders(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel order ❌");
    } finally {
      setCancellingId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === "OPEN") return o.status === "OPEN";
    if (filter === "EXECUTED") return o.status === "EXECUTED";
    return true;
  });

  const openCount = orders.filter((o) => o.status === "OPEN").length;
  const executedCount = orders.filter((o) => o.status === "EXECUTED").length;

  return (
    <div className="orders-wrapper fade-up">
      {/* Header */}
      <div className="section-header">
        <div>
          <h2 className="page-title">Order Book ({orders.length})</h2>
          <p className="page-subtitle">
            Complete transaction record of Market orders, Limit orders &amp; GTT triggers.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="orders-filter-bar">
        <button
          className={`order-filter-btn ${filter === "ALL" ? "active" : ""}`}
          onClick={() => setFilter("ALL")}
        >
          All Orders ({orders.length})
        </button>
        <button
          className={`order-filter-btn ${filter === "OPEN" ? "active" : ""}`}
          onClick={() => setFilter("OPEN")}
        >
          Open / Pending ({openCount})
        </button>
        <button
          className={`order-filter-btn ${filter === "EXECUTED" ? "active" : ""}`}
          onClick={() => setFilter("EXECUTED")}
        >
          Executed ({executedCount})
        </button>
      </div>

      {/* Orders Table */}
      <div className="table-card">
        {filteredOrders.length > 0 ? (
          <div className="table-responsive">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Mode</th>
                  <th>Instrument</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Order Value</th>
                  <th>GTT Triggers</th>
                  <th>Date &amp; Time</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o, i) => {
                  const isBuy = o.mode === "BUY";
                  const price = o.limitPrice || o.price || 0;
                  const orderValue = Number(o.qty) * Number(price);
                  const orderType = o.orderType || "MARKET";
                  const status = o.status || "EXECUTED";
                  const isOpen = status === "OPEN";

                  return (
                    <tr key={o._id || i}>
                      <td>
                        <span className={isBuy ? "badge-buy" : "badge-sell"}>
                          {o.mode}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span
                            style={{
                              fontWeight: "700",
                              color: "var(--color-text-strong)",
                            }}
                          >
                            {o.name}
                          </span>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--color-text-faint)",
                            }}
                          >
                            NSE • {o.product || "CNC"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`order-type-tag ${
                            orderType === "LIMIT"
                              ? "limit"
                              : orderType === "SL_TRIGGER"
                              ? "sl"
                              : orderType === "TARGET_TRIGGER"
                              ? "target"
                              : "market"
                          }`}
                        >
                          {orderType === "LIMIT"
                            ? "LIMIT 🎯"
                            : orderType === "SL_TRIGGER"
                            ? "STOP-LOSS 🛑"
                            : orderType === "TARGET_TRIGGER"
                            ? "TARGET 🎯"
                            : "MARKET ⚡"}
                        </span>
                      </td>

                      <td style={{ fontWeight: "600" }}>{o.qty} shares</td>

                      <td style={{ fontWeight: "700" }}>
                        ₹{Number(price).toFixed(2)}
                      </td>

                      <td style={{ fontWeight: "600" }}>
                        ₹{orderValue.toFixed(2)}
                      </td>

                      <td>
                        {o.stopLoss || o.target ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "2px",
                              fontSize: "0.74rem",
                            }}
                          >
                            {o.stopLoss && (
                              <span style={{ color: "var(--color-loss)" }}>
                                SL: ₹{Number(o.stopLoss).toFixed(2)}
                              </span>
                            )}
                            {o.target && (
                              <span style={{ color: "var(--color-profit)" }}>
                                Tgt: ₹{Number(o.target).toFixed(2)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "var(--color-text-faint)", fontSize: "0.8rem" }}>
                            —
                          </span>
                        )}
                      </td>

                      <td
                        style={{
                          color: "var(--color-text-muted)",
                          fontSize: "0.82rem",
                        }}
                      >
                        {new Date(o.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>

                      <td>
                        <span
                          className={`order-status-badge ${status.toLowerCase()}`}
                        >
                          <span
                            className={`status-dot ${status.toLowerCase()}`}
                          ></span>
                          {status}
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        {isOpen ? (
                          <button
                            className="btn-cancel-order"
                            disabled={cancellingId === o._id}
                            onClick={() => setOrderToCancel(o)}
                            title="Cancel this open limit order and refund wallet"
                          >
                            {cancellingId === o._id ? "Cancelling..." : "Cancel"}
                          </button>
                        ) : (
                          <span style={{ color: "var(--color-text-faint)", fontSize: "0.8rem" }}>
                            —
                          </span>
                        )}
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
            <h4 className="empty-state-title">
              {filter === "OPEN"
                ? "No Open Limit Orders"
                : filter === "EXECUTED"
                ? "No Executed Orders"
                : "No Orders Placed Yet"}
            </h4>
            <p className="empty-state-text">
              {filter === "OPEN"
                ? "You don't have any pending limit orders at the moment. Place a Limit Order from the watchlist to see it here!"
                : "Select a stock from the watchlist and place your first trade to populate your order log."}
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

      {/* Confirmation Modal for Cancelling Limit Order */}
      <ConfirmModal
        isOpen={!!orderToCancel}
        title="Cancel Limit Order?"
        message={`Are you sure you want to cancel your open ${orderToCancel?.mode} order for ${orderToCancel?.qty} shares of ${orderToCancel?.name}? The margin of ₹${(Number(orderToCancel?.qty) * Number(orderToCancel?.limitPrice || orderToCancel?.price || 0)).toFixed(2)} will be refunded to your wallet immediately.`}
        icon="❌"
        confirmText="Yes, Cancel Order"
        cancelText="Keep Order Open"
        isDanger={true}
        onConfirm={() => {
          const id = orderToCancel._id;
          setOrderToCancel(null);
          handleCancelOrder(id);
        }}
        onCancel={() => setOrderToCancel(null)}
      />
    </div>
  );
};

export default Orders;