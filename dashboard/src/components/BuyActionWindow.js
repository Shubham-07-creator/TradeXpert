import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import GeneralContext from "./GeneralContext";
import "./BuyActionWindow.css";
import { watchlist } from "../data/data";

const BuyActionWindow = ({ uid, type }) => {
  const API = process.env.REACT_APP_API_URL || "http://localhost:3002";

  const [qty, setQty] = useState(1);

  const [price, setPrice] = useState(0);

  const { closeWindow } = useContext(GeneralContext);

  useEffect(() => {
    const loadPrice = async () => {
      try {
        const res = await axios.get(`${API}/allHoldings`);

        const stock = res.data.find((s) => s.name === uid);

        if (stock) {
          setPrice(stock.price);
        } else {
          const wl = watchlist.find((s) => s.name === uid);

          if (wl) {
            setPrice(wl.price);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    loadPrice();
  }, [uid, API]);

  const handleSubmit = async () => {
    try {
      await axios.post(`${API}/newOrder`, {
        name: uid,
        qty: Number(qty),
        price: Number(price),
        mode: type,
      });

      toast.success(
        type === "BUY" ? "Buy Successfully ✅" : "Sell Successfully ✅",
        {
          style: {
            background: type === "SELL" ? "#ff4d4f" : "#4caf50",
            color: "#fff",
          },
        },
      );

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
        <span>Margin required ₹140.65</span>

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
  