import React, { useState } from "react";
import BuyActionWindow from "./BuyActionWindow";
import StockChartModal from "./StockChartModal";

const GeneralContext = React.createContext();

export const GeneralContextProvider = (props) => {
  const [type, setType] = useState(null);
  const [uid, setUid] = useState("");
  const [chartStock, setChartStock] = useState(null);

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

  const openChartModal = (stockName) => {
    setChartStock(stockName);
  };

  const closeChartModal = () => {
    setChartStock(null);
  };

  return (
    <GeneralContext.Provider
      value={{
        openBuyWindow,
        openSellWindow,
        closeWindow,
        openChartModal,
        closeChartModal,
      }}
    >
      {props.children}
      {type && <BuyActionWindow uid={uid} type={type} />}
      {chartStock && (
        <StockChartModal
          stockName={chartStock}
          onClose={closeChartModal}
          onBuy={(stock) => openBuyWindow(stock)}
          onSell={(stock) => openSellWindow(stock)}
        />
      )}
    </GeneralContext.Provider>
  );
};

export default GeneralContext;