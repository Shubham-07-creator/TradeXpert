import { watchlist as baseWatchlist } from "../data/data";
import { socket } from "./socket";

// Live market data comes from the backend over Socket.io (see backend/liveMarket.js).
// Supports SMART HYBRID MODE:
// - Live Dalal Street (NSE/BSE) during market hours.
// - Testing simulator mode when market is closed so demo trading is functional 24/7.

let stocksState = {};
let stocksArray = [];
let niftyState = { price: 22421.95, percent: "+0.00%", changePercent: 0, isDown: false };
let sensexState = { price: 71909.7, percent: "+0.00%", changePercent: 0, isDown: false };
let marketInfoState = {
  isMarketOpen: false,
  marketMode: "TESTING",
  marketStatus: "CLOSED (Testing Simulator)",
};
let marketHaltedState = false;

// Seed with static list in O(N) pass
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
const marketInfoListeners = new Set();

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
  if (snapshot.sensex) {
    sensexState = snapshot.sensex;
  }
  if (snapshot.marketMode) {
    marketInfoState = {
      isMarketOpen: Boolean(snapshot.isMarketOpen),
      marketMode: snapshot.marketMode,
      marketStatus: snapshot.marketStatus || (snapshot.isMarketOpen ? "OPEN (NSE LIVE)" : "CLOSED (Testing Mode)"),
    };
    marketInfoListeners.forEach((cb) => cb(marketInfoState));
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

// O(1) cached snapshot
export const getSnapshot = () => stocksArray;

// O(1) cached live map
export const getLiveMap = () => stocksState;

export const getNifty = () => niftyState;

export const getSensex = () => sensexState;

export const getMarketInfo = () => marketInfoState;

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

export const subscribeToSensex = (callback) => {
  const wrapped = () => callback(getSensex());
  listeners.add(wrapped);
  return () => listeners.delete(wrapped);
};

export const subscribeToMarketInfo = (callback) => {
  marketInfoListeners.add(callback);
  callback(marketInfoState);
  return () => marketInfoListeners.delete(callback);
};

export const subscribeToMarketHalt = (callback) => {
  haltListeners.add(callback);
  callback(marketHaltedState);
  return () => haltListeners.delete(callback);
};