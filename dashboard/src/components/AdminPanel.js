import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeader } from "../utils/auth";

const AdminPanel = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        axios.get(`${API}/admin/users`, { headers: getAuthHeader() }),
        axios.get(`${API}/admin/stats`, { headers: getAuthHeader() }),
      ]);

      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data ❌");
    }
  };

  if (error) {
    return (
      <div className="orders">
        <h3>{error}</h3>
      </div>
    );
  }

  return (
    <div className="orders">
      <h3>Admin Dashboard</h3>

      {stats && (
        <div style={{ display: "flex", gap: "30px", margin: "15px 0" }}>
          <div>
            <strong>{stats.totalUsers}</strong> Users
          </div>
          <div>
            <strong>{stats.totalOrders}</strong> Orders
          </div>
          <div>
            <strong>₹{stats.totalWallet.toLocaleString("en-IN")}</strong>{" "}
            Total Wallet Balance
          </div>
        </div>
      )}

      <table className="order-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Wallet</th>
            <th>Investment</th>
            <th>Holdings Value</th>
            <th>Holdings</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>₹{u.wallet.toLocaleString("en-IN")}</td>
              <td>₹{u.investment.toLocaleString("en-IN")}</td>
              <td>₹{u.holdingsValue.toLocaleString("en-IN")}</td>
              <td>{u.holdingsCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;