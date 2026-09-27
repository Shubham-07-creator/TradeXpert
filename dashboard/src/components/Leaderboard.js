import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeader, getCurrentUser } from "../utils/auth";

const Leaderboard = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  const [board, setBoard] = useState([]);
  const user = getCurrentUser();

  useEffect(() => {
    fetchBoard();
    // refresh every 5s so ranks move as everyone's live prices change
    const interval = setInterval(fetchBoard, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchBoard = async () => {
    try {
      const res = await axios.get(`${API}/leaderboard`, {
        headers: getAuthHeader(),
      });
      setBoard(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="orders">
      <h3>Leaderboard — Top Portfolios</h3>

      <table className="order-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Portfolio Value</th>
          </tr>
        </thead>

        <tbody>
          {board.length > 0 ? (
            board.map((entry, i) => (
              <tr
                key={i}
                style={{
                  background:
                    user?.name === entry.name
                      ? "rgba(103,201,136,0.12)"
                      : "transparent",
                  fontWeight: user?.name === entry.name ? "600" : "400",
                }}
              >
                <td>#{i + 1}</td>
                <td>{entry.name}</td>
                <td>₹{entry.portfolioValue.toLocaleString("en-IN")}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                No data yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;