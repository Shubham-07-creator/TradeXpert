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

let isHalted = false;

const tick = () => {
  if (isHalted) {
    const niftyTotalChange = ((niftyPrice - niftyBase) / niftyBase) * 100;
    return getSnapshot(niftyTotalChange);
  }

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
    isHalted,
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

const isMarketHalted = () => isHalted;

const setMarketHalt = (haltStatus) => {
  if (typeof haltStatus === "boolean") {
    isHalted = haltStatus;
  } else {
    isHalted = !isHalted;
  }
  return isHalted;
};

const triggerShock = (direction, percent = 2.5) => {
  const pct = Math.abs(Number(percent) || 2.5);
  const factor = direction === "BEAR" ? 1 - pct / 100 : 1 + pct / 100;

  Object.values(state).forEach((stock) => {
    const newPrice = Math.max(stock.price * factor, 0.05);
    const totalChangePercent =
      ((newPrice - stock.basePrice) / stock.basePrice) * 100;

    stock.price = Number(newPrice.toFixed(2));
    stock.isDown = totalChangePercent < 0;
    stock.percent = `${
      totalChangePercent >= 0 ? "+" : ""
    }${totalChangePercent.toFixed(2)}%`;
  });

  niftyPrice = Math.max(niftyPrice * factor, 1);
  const niftyTotalChange = ((niftyPrice - niftyBase) / niftyBase) * 100;

  return getSnapshot(niftyTotalChange);
};

const resetMarketPrices = () => {
  watchlistSeed.forEach((stock) => {
    if (state[stock.name]) {
      state[stock.name].price = stock.price;
      state[stock.name].percent = "+0.00%";
      state[stock.name].isDown = false;
    }
  });
  niftyPrice = niftyBase;
  return getSnapshot(0);
};

module.exports = {
  tick,
  getSnapshot,
  getLivePrice,
  isMarketHalted,
  setMarketHalt,
  triggerShock,
  resetMarketPrices,
};