import { watchlist as baseWatchlist } from "../data/data";
import { socket } from "./socket";

// Live market data now comes from the backend over Socket.io (see
// backend/liveMarket.js + backend/index.js) instead of being
// simulated separately in every browser tab. This file keeps the
// same public API it always had (getSnapshot, getLivePrice,
// subscribeToLiveMarket) so Holdings/Positions/Summary/WatchList/
// BuyActionWindow don't need any changes — only the data source
// underneath changed.

let stocksState = {};
let niftyState = { price: 0, percent: "+0.00%", changePercent: 0 };

// Seed with the static list so the UI has something to render before
// the first "market:update" event arrives from the server.
baseWatchlist.forEach((stock) => {
  stocksState[stock.name] = {
    name: stock.name,
    sector: stock.sector || "Other",
    price: stock.price,
    percent: stock.percent,
    isDown: stock.isDown,
  };
});

const listeners = new Set();

socket.on("market:update", (snapshot) => {
  const map = {};
  snapshot.stocks.forEach((s) => {
    map[s.name] = s;
  });
  stocksState = map;
  niftyState = snapshot.nifty;

  const out = getSnapshot();
  listeners.forEach((cb) => cb(out));
});

export const getSnapshot = () => Object.values(stocksState);

export const getNifty = () => niftyState;

export const getLivePrice = (name) => stocksState[name]?.price;

export const subscribeToLiveMarket = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export const subscribeToNifty = (callback) => {
  const wrapped = () => callback(getNifty());
  listeners.add(wrapped);
  return () => listeners.delete(wrapped);
};