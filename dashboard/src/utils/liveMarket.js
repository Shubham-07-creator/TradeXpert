import { watchlist as baseWatchlist } from "../data/data";

// A lightweight in-memory "market simulator" — NOT a real price feed.
// It nudges each stock's price up/down by a small random amount every
// couple of seconds so the watchlist feels alive (like a real
// exchange ticking). Swap this for a real market-data API later.

const state = {};

baseWatchlist.forEach((stock) => {
  state[stock.name] = {
    name: stock.name,
    basePrice: stock.price,
    price: stock.price,
    percent: stock.percent,
    isDown: stock.isDown,
  };
});

const listeners = new Set();

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

  const snapshot = getSnapshot();
  listeners.forEach((cb) => cb(snapshot));
};

export const getSnapshot = () => Object.values(state);

export const getLivePrice = (name) => state[name]?.price;

export const subscribeToLiveMarket = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

let intervalStarted = false;

export const startLiveMarket = () => {
  if (intervalStarted) return;
  intervalStarted = true;
  setInterval(tick, 2500);
};

startLiveMarket();