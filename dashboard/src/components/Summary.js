import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeader, getCurrentUser } from "../utils/auth";
import { getSnapshot, subscribeToLiveMarket } from "../utils/liveMarket";

const buildLiveMap = (snapshot) => {
  const map = {};
  snapshot.forEach((s) => {
    map[s.name] = s;
  });
  return map;
};

const Summary = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  const [holdings, setHoldings] = useState([]);
  const [wallet, setWallet] = useState(0);

  // Live-updating price map so the overall P&L here moves in sync
  // with Holdings/Positions instead of only refreshing on order.
  const [liveMap, setLiveMap] = useState(() => buildLiveMap(getSnapshot()));

  const user = getCurrentUser();

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
      const [holdingsRes, profileRes] = await Promise.all([
        axios.get(`${API}/allHoldings`, { headers: getAuthHeader() }),
        axios.get(`${API}/profile`, { headers: getAuthHeader() }),
      ]);

      setHoldings(holdingsRes.data);
      setWallet(profileRes.data.wallet || 0);
    } catch (err) {
      console.log(err);
    }
  };

  const investment = holdings.reduce((sum, h) => sum + h.avg * h.qty, 0);
  const currentValue = holdings.reduce((sum, h) => {
    const live = liveMap[h.name];
    const price = live ? live.price : h.price;
    return sum + price * h.qty;
  }, 0);
  const pnl = currentValue - investment;
  const pnlPercent = investment ? ((pnl / investment) * 100).toFixed(2) : "0.00";
  const pnlClass = pnl >= 0 ? "profit" : "loss";

  return (
    <>
      <div className="username">
        <h6>Hi, {user?.name || "User"}!</h6>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Equity</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>₹{wallet.toLocaleString("en-IN")}</h3>
            <p>Margin available</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Margins used <span>₹{investment.toFixed(2)}</span>{" "}
            </p>
            <p>
              Opening balance{" "}
              <span>₹{(wallet + investment).toLocaleString("en-IN")}</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Holdings ({holdings.length})</p>
        </span>

        <div className="data">
          <div className="first">
            <h3 className={pnlClass}>
              ₹{pnl.toFixed(2)} <small>{pnlPercent}%</small>{" "}
            </h3>
            <p>P&L</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Current Value <span>₹{currentValue.toFixed(2)}</span>{" "}
            </p>
            <p>
              Investment <span>₹{investment.toFixed(2)}</span>{" "}
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>
    </>
  );
};

export default Summary;