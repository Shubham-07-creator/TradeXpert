import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getAuthHeader } from "../utils/auth";

const Funds = () => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  const [wallet, setWallet] = useState(0);
  const [usedMargin, setUsedMargin] = useState(0);
  const [openingBalance, setOpeningBalance] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, holdingsRes] = await Promise.all([
        axios.get(`${API}/profile`, { headers: getAuthHeader() }),
        axios.get(`${API}/allHoldings`, { headers: getAuthHeader() }),
      ]);

      const used = holdingsRes.data.reduce(
        (sum, h) => sum + h.avg * h.qty,
        0,
      );

      setWallet(profileRes.data.wallet || 0);
      setUsedMargin(used);
      setOpeningBalance((profileRes.data.wallet || 0) + used);
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

  return (
    <>
      <div className="funds">
        <p>Instant, zero-cost fund transfers with UPI </p>
        <button className="btn btn-green" onClick={handleAddFunds}>
          Add funds
        </button>
        <button className="btn btn-blue" onClick={handleWithdraw}>
          Withdraw
        </button>
      </div>

      <div className="row">
        <div className="col">
          <span>
            <p>Equity</p>
          </span>

          <div className="table">
            <div className="data">
              <p>Available margin</p>
              <p className="imp colored">{wallet.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>Used margin</p>
              <p className="imp">{usedMargin.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>Available cash</p>
              <p className="imp">{wallet.toFixed(2)}</p>
            </div>
            <hr />
            <div className="data">
              <p>Opening Balance</p>
              <p>{openingBalance.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>Payin</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>SPAN</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Delivery margin</p>
              <p>{usedMargin.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>Exposure</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Options premium</p>
              <p>0.00</p>
            </div>
            <hr />
            <div className="data">
              <p>Collateral (Liquid funds)</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Collateral (Equity)</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Total Collateral</p>
              <p>0.00</p>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="commodity">
            <p>You don't have a commodity account</p>
            <button className="btn btn-blue" disabled>
              Open Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Funds;