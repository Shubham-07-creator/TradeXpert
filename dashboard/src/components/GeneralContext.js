import React, { useState } from "react";
import BuyActionWindow from "./BuyActionWindow";

const GeneralContext = React.createContext();

export const GeneralContextProvider = (props) => {
  const [type, setType] = useState(null);
  const [uid, setUid] = useState("");

  const openBuyWindow = (id) => {
    setUid(id);
    setType("BUY");
  };

  const openSellWindow = (id) => {
    setUid(id);
    setType("SELL");
  };

  const closeWindow = () => {
    setType(null);
    setUid("");
  };

  return (
    <GeneralContext.Provider
      value={{ openBuyWindow, openSellWindow, closeWindow }}
    >
      {props.children}
      {type && <BuyActionWindow uid={uid} type={type} />}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;