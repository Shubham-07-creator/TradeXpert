import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import GeneralContext from "./GeneralContext";
import "./BuyActionWindow.css";
import { getLivePrice } from "../utils/liveMarket";
import { getAuthHeader } from "../utils/auth";

const BuyActionWindow = ({ uid, type }) => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  const [qty, setQty] = useState(1);

  const [price, setPrice] = useState(0);

  const { closeWindow } = useContext(GeneralContext);

  useEffect(() => {
    const loadPrice = async () => {
      try {
        // Live price first — this is what actually moves, and is what
        // makes a sell realize real gain/loss against your buy price.
        // Previously this used the holding's *stored* price (the price
        // from your last buy), which stayed frozen — so selling right
        // after a price move showed no profit/loss until you noticed
        // and manually edited the price field.
        const livePrice = getLivePrice(uid);

        if (livePrice) {
          setPrice(livePrice);
          return;
        }

        // Fallback for a stock with no live simulator data — use
        // whatever price is on record for it.
        const res = await axios.get(`${API}/allHoldings`, {
          headers: getAuthHeader(),
        });

        const stock = res.data.find((s) => s.name === uid);

        if (stock) {
          setPrice(stock.price);
        }
      } catch (error) {
        console.log(error);
      }
    };

    loadPrice();
  }, [uid, API]);

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `${API}/newOrder`,
        {
          name: uid,
          qty: Number(qty),
          price: Number(price),
          mode: type,
        },
        { headers: getAuthHeader() },
      );

      if (type === "SELL") {
        const gain = res.data.realizedPnL || 0;
        const gainText =
          gain >= 0
            ? `Sold ✅ — Profit ₹${gain.toFixed(2)}`
            : `Sold ✅ — Loss ₹${Math.abs(gain).toFixed(2)}`;

        toast.success(gainText, {
          style: {
            background: gain >= 0 ? "#1ea672" : "#e5484d",
            color: "#fff",
          },
        });
      } else {
        toast.success("Buy Successfully ✅", {
          style: {
            background: "#1ea672",
            color: "#fff",
          },
        });
      }

      closeWindow();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong ❌");
    }
  };

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>

            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </fieldset>

          <fieldset>
            <legend>Price</legend>

            <input
              type="number"
              step="0.05"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        <span>
          Margin required ₹{(Number(qty) * Number(price) || 0).toFixed(2)}
        </span>

        <div>
          <Link
            className={type === "BUY" ? "btn btn-blue" : "btn btn-red"}
            onClick={handleSubmit}
          >
            {type}
          </Link>

          <Link className="btn btn-grey" onClick={closeWindow}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;