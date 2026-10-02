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
let stocksArray = [];
let niftyState = { price: 0, percent: "+0.00%", changePercent: 0 };
let marketHaltedState = false;

// Seed with the static list in O(N) single pass
baseWatchlist.forEach((stock) => {
  const item = {
    name: stock.name,
    sector: stock.sector || "Other",
    price: stock.price,
    percent: stock.percent,
    isDown: stock.isDown,
  };
  stocksState[stock.name] = item;
  stocksArray.push(item);
});

const listeners = new Set();
const haltListeners = new Set();

socket.on("market:update", (snapshot) => {
  if (snapshot.stocks) {
    const list = snapshot.stocks;
    stocksArray = list;
    const map = {};
    for (let i = 0; i < list.length; i++) {
      const s = list[i];
      map[s.name] = s;
    }
    stocksState = map;
  }
  if (snapshot.nifty) {
    niftyState = snapshot.nifty;
  }
  if (typeof snapshot.isHalted === "boolean") {
    marketHaltedState = snapshot.isHalted;
    haltListeners.forEach((cb) => cb(marketHaltedState));
  }

  listeners.forEach((cb) => cb(stocksArray, stocksState));
});

socket.on("market:circuit-breaker", (data) => {
  if (data && typeof data.isHalted === "boolean") {
    marketHaltedState = data.isHalted;
    haltListeners.forEach((cb) => cb(marketHaltedState));
  }
});

// O(1) cached snapshot (no Object.values allocation)
export const getSnapshot = () => stocksArray;

// O(1) cached live map
export const getLiveMap = () => stocksState;

export const getNifty = () => niftyState;

export const getLivePrice = (name) => stocksState[name]?.price;

export const isMarketHalted = () => marketHaltedState;

export const subscribeToLiveMarket = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

export const subscribeToNifty = (callback) => {
  const wrapped = () => callback(getNifty());
  listeners.add(wrapped);
  return () => listeners.delete(wrapped);
};

export const subscribeToMarketHalt = (callback) => {
  haltListeners.add(callback);
  callback(marketHaltedState);
  return () => haltListeners.delete(callback);
};