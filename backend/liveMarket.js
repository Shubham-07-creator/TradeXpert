const { watchlistSeed } = require("./data/watchlistSeed");

// Server-side "market simulator" — NOT a real price feed. It nudges
// each stock (and a mock NIFTY index) up/down by a small random
// amount every tick, and broadcasts the result to every connected
// dashboard via Socket.io (see index.js). Swap this for a real
// market-data API later.

const state = {};

watchlistSeed.forEach((stock) => {
  state[stock.name] = {
    name: stock.name,
    sector: stock.sector,
    basePrice: stock.price,
    price: stock.price,
    percent: "+0.00%",
    isDown: false,
  };
});

let niftyBase = 24850.2;
let niftyPrice = niftyBase;

const tick = () => {
  Object.values(state).forEach((stock) => {
    // random wiggle of roughly ±0.6% per tick
    const changePercent = (Math.random() - 0.5) * 1.2;
    const newPrice = Math.max(stock.price * (1 + changePercent / 100), 0.05);

    const totalChangePercent =
      ((newPrice - stock.basePrice) / stock.basePrice) * 100;

    stock.price = Number(newPrice.toFixed(2));
    stock.isDown = totalChangePercent < 0;
    stock.percent = `${
      totalChangePercent >= 0 ? "+" : ""
    }${totalChangePercent.toFixed(2)}%`;
  });

  // NIFTY moves a bit more smoothly (smaller wiggle) than individual stocks
  const niftyChangePercent = (Math.random() - 0.5) * 0.5;
  niftyPrice = Math.max(niftyPrice * (1 + niftyChangePercent / 100), 1);
  const niftyTotalChange = ((niftyPrice - niftyBase) / niftyBase) * 100;

  return getSnapshot(niftyTotalChange);
};

function getSnapshot(niftyTotalChange = 0) {
  return {
    stocks: Object.values(state),
    nifty: {
      price: Number(niftyPrice.toFixed(2)),
      changePercent: Number(niftyTotalChange.toFixed(2)),
      percent: `${niftyTotalChange >= 0 ? "+" : ""}${niftyTotalChange.toFixed(
        2,
      )}%`,
    },
  };
}

const getLivePrice = (name) => state[name]?.price;

module.exports = { tick, getSnapshot, getLivePrice };