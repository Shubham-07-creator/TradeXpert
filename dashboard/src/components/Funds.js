import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getAuthHeader } from "../utils/auth";
import { getSnapshot, subscribeToLiveMarket } from "../utils/liveMarket";

const buildLiveMap = (snapshot) => {
  const map = {};
  snapshot.forEach((s) => {
    map[s.name] = s;
  });
  return map;
};

// This page shows the whole money story in one place, in plain
// language: how much free cash you have, how much is tied up in
// stocks, what those stocks are worth right now, and how much
// you've actually gained/lost — both on paper and for real.
const Funds = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  const [wallet, setWallet] = useState(0);
  const [realizedPnL, setRealizedPnL] = useState(0);
  const [holdings, setHoldings] = useState([]);
  const [liveMap, setLiveMap] = useState(() => buildLiveMap(getSnapshot()));

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToLiveMarket((snapshot) =>
      setLiveMap(buildLiveMap(snapshot)),
    );
    return unsubscribe;
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, holdingsRes] = await Promise.all([
        axios.get(`${API}/profile`, { headers: getAuthHeader() }),
        axios.get(`${API}/allHoldings`, { headers: getAuthHeader() }),
      ]);

      setWallet(profileRes.data.wallet || 0);
      setRealizedPnL(profileRes.data.realizedPnL || 0);
      setHoldings(holdingsRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddFunds = async () => {
    const amount = Number(window.prompt("Amount to add (₹)"));

    if (!amount || amount <= 0) return;

    try {
      await axios.post(
        `${API}/wallet/add`,
        { amount },
        { headers: getAuthHeader() },
      );

      toast.success("Funds added ✅");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Add funds failed ❌");
    }
  };

  const handleWithdraw = async () => {
    const amount = Number(window.prompt("Amount to withdraw (₹)"));

    if (!amount || amount <= 0) return;

    try {
      await axios.post(
        `${API}/wallet/withdraw`,
        { amount },
        { headers: getAuthHeader() },
      );

      toast.success("Withdrawal successful ✅");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Withdraw failed ❌");
    }
  };

  const investment = holdings.reduce((sum, h) => sum + h.avg * h.qty, 0);

  const currentValue = holdings.reduce((sum, h) => {
    const live = liveMap[h.name];
    const price = live ? live.price : h.price;
    return sum + price * h.qty;
  }, 0);

  const unrealizedPnL = currentValue - investment;
  const totalPortfolioValue = wallet + currentValue;

  return (
    <>
      <div className="funds">
        <p>Add or withdraw your virtual trading balance</p>
        <button className="btn btn-green" onClick={handleAddFunds}>
          Add funds
        </button>
        <button className="btn btn-blue" onClick={handleWithdraw}>
          Withdraw
        </button>
      </div>

      {/* The one number that matters most, up top and big */}
      <div className="section">
        <span>
          <p>Total Portfolio Value</p>
        </span>
        <h3 className="total-value">
          ₹
          {totalPortfolioValue.toLocaleString("en-IN", {
            maximumFractionDigits: 2,
          })}
        </h3>
        <p className="stat-note">
          Your available cash + what your current holdings are worth right
          now
        </p>
      </div>

      <div className="funds-grid">
        <div className="section stat-card">
          <p className="stat-label">Available Cash</p>
          <h3 className="stat-value">₹{wallet.toLocaleString("en-IN")}</h3>
          <p className="stat-note">Free money you can use to buy stocks</p>
        </div>

        <div className="section stat-card">
          <p className="stat-label">Invested Amount</p>
          <h3 className="stat-value">₹{investment.toFixed(2)}</h3>
          <p className="stat-note">
            What you originally paid for the stocks you still hold
          </p>
        </div>

        <div className="section stat-card">
          <p className="stat-label">Current Holdings Value</p>
          <h3 className="stat-value">₹{currentValue.toFixed(2)}</h3>
          <p className="stat-note">What those same stocks are worth now</p>
        </div>

        <div className="section stat-card">
          <p className="stat-label">Unrealized P&L</p>
          <h3
            className={`stat-value ${unrealizedPnL >= 0 ? "profit" : "loss"}`}
          >
            {unrealizedPnL >= 0 ? "+" : "-"}₹
            {Math.abs(unrealizedPnL).toFixed(2)}
          </h3>
          <p className="stat-note">
            What you'd gain or lose if you sold everything right now — this
            moves live with the market
          </p>
        </div>

        <div className="section stat-card">
          <p className="stat-label">Realized P&L (All-time)</p>
          <h3
            className={`stat-value ${realizedPnL >= 0 ? "profit" : "loss"}`}
          >
            {realizedPnL >= 0 ? "+" : "-"}₹{Math.abs(realizedPnL).toFixed(2)}
          </h3>
          <p className="stat-note">
            Actual profit or loss you've locked in from stocks you've
            already sold
          </p>
        </div>
      </div>
    </>
  );
};

export default Funds;