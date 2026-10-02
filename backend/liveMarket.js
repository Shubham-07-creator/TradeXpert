const { watchlistSeed } = require("./data/watchlistSeed");
const YahooFinance = require("yahoo-finance2").default;

// Initialize Yahoo Finance with notices suppressed
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// Server-side market engine:
// 1. Fetches REAL NSE stock quotes & indices from Yahoo Finance.
// 2. SMART HYBRID MODE:
//    - When Indian Market is OPEN (Mon-Fri 9:15 AM - 3:30 PM IST): Streams genuine live market ticks.
//    - When Indian Market is CLOSED (Off-hours/Weekends): Switches to Testing/Simulator mode
//      around real closing prices so demo trading, charts, limits, and GTT work 24/7!

const state = {};

watchlistSeed.forEach((stock) => {
  state[stock.name] = {
    name: stock.name,
    sector: stock.sector,
    basePrice: stock.price,
    price: stock.price,
    percent: "+0.00%",
    isDown: false,
    dayHigh: stock.price * 1.01,
    dayLow: stock.price * 0.99,
    volume: 100000,
    isRealData: false,
  };
});

let niftyBase = 22421.95;
let niftyPrice = niftyBase;

let sensexBase = 71909.7;
let sensexPrice = sensexBase;

let isHalted = false;
let isSyncing = false;
let lastSyncTime = null;

/**
 * Checks whether the Indian stock market (NSE / BSE) is currently open for regular trading.
 * Trading hours: Monday to Friday, 9:15 AM to 3:30 PM IST (Asia/Kolkata).
 */
function isIndianMarketOpen() {
  try {
    const now = new Date();
    const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istDate = new Date(istString);
    const day = istDate.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
    const hours = istDate.getHours();
    const minutes = istDate.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    // Mon - Fri, 9:15 AM (555 mins) to 3:30 PM (930 mins)
    const isWeekday = day >= 1 && day <= 5;
    const isTradingHours = totalMinutes >= 555 && totalMinutes <= 930;

    return isWeekday && isTradingHours;
  } catch (e) {
    return false;
  }
}

/**
 * Fetches real stock quotes and indices from Yahoo Finance in batches.
 */
async function syncRealMarketData() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    // 1. Sync Indices (^NSEI = NIFTY 50, ^BSESN = SENSEX)
    try {
      const indexQuotes = await yf.quote(["^NSEI", "^BSESN"]);
      if (Array.isArray(indexQuotes)) {
        indexQuotes.forEach((q) => {
          if (!q) return;
          if (q.symbol === "^NSEI" && q.regularMarketPrice) {
            niftyPrice = q.regularMarketPrice;
            niftyBase = q.regularMarketPreviousClose || q.regularMarketPrice;
          } else if (q.symbol === "^BSESN" && q.regularMarketPrice) {
            sensexPrice = q.regularMarketPrice;
            sensexBase = q.regularMarketPreviousClose || q.regularMarketPrice;
          }
        });
      }
    } catch (indexErr) {
      console.warn("Notice: Real index sync error (using cached):", indexErr.message);
    }

    // 2. Sync Stocks in batches of 35
    const stockList = Object.values(state);
    const chunkSize = 35;

    for (let i = 0; i < stockList.length; i += chunkSize) {
      const chunk = stockList.slice(i, i + chunkSize);
      const symbols = chunk.map((s) => `${s.name}.NS`);

      try {
        const quotes = await yf.quote(symbols);
        if (Array.isArray(quotes)) {
          quotes.forEach((q) => {
            if (!q || !q.regularMarketPrice) return;
            const stockName = q.symbol.replace(".NS", "").replace(".BO", "");
            if (state[stockName]) {
              const prevClose = q.regularMarketPreviousClose || q.regularMarketPrice;
              const curPrice = q.regularMarketPrice;
              const chgPct =
                q.regularMarketChangePercent !== undefined && q.regularMarketChangePercent !== null
                  ? q.regularMarketChangePercent
                  : ((curPrice - prevClose) / prevClose) * 100;

              state[stockName].basePrice = prevClose;
              state[stockName].price = Number(curPrice.toFixed(2));
              state[stockName].percent = `${chgPct >= 0 ? "+" : ""}${chgPct.toFixed(2)}%`;
              state[stockName].isDown = chgPct < 0;
              state[stockName].dayHigh = q.regularMarketDayHigh || curPrice;
              state[stockName].dayLow = q.regularMarketDayLow || curPrice;
              state[stockName].volume = q.regularMarketVolume || state[stockName].volume;
              state[stockName].isRealData = true;
            }
          });
        }
      } catch (chunkErr) {
        console.warn(`Notice: Stock chunk ${i / chunkSize + 1} sync warning:`, chunkErr.message);
      }
    }

    lastSyncTime = new Date();
  } catch (err) {
    console.error("Error in syncRealMarketData:", err.message);
  } finally {
    isSyncing = false;
  }
}

// Initial sync on module load
syncRealMarketData()
  .then(() => console.log("Real NSE Stock Data Initialized from Yahoo Finance ✅"))
  .catch((e) => console.warn("Initial stock sync warning:", e.message));

// Background sync scheduler:
// If Market is OPEN: sync every 15 seconds from live Dalal Street.
// If Market is CLOSED: sync every 15 minutes to refresh closing prices.
setInterval(() => {
  const isOpen = isIndianMarketOpen();
  const now = Date.now();
  const elapsed = lastSyncTime ? now - lastSyncTime.getTime() : Infinity;

  if (isOpen && elapsed >= 14000) {
    syncRealMarketData();
  } else if (!isOpen && elapsed >= 900000) {
    syncRealMarketData();
  }
}, 5000);

/**
 * Tick function executed every 2.5 seconds by server.
 * - If Market is OPEN: prices follow real Dalal Street quotes with micro-fluctuations.
 * - If Market is CLOSED: Testing/Simulator mode is active around real prices so orders execute.
 */
const tick = () => {
  if (isHalted) {
    return getSnapshot();
  }

  const isOpen = isIndianMarketOpen();

  if (isOpen) {
    // Market is OPEN: apply subtle micro-jitter (±0.04%) between 15s API syncs
    Object.values(state).forEach((stock) => {
      const microJitter = (Math.random() - 0.5) * 0.08;
      const newPrice = Math.max(stock.price * (1 + microJitter / 100), 0.05);
      const totalChangePercent = ((newPrice - stock.basePrice) / stock.basePrice) * 100;
      stock.price = Number(newPrice.toFixed(2));
      stock.isDown = totalChangePercent < 0;
      stock.percent = `${totalChangePercent >= 0 ? "+" : ""}${totalChangePercent.toFixed(2)}%`;
    });

    const niftyJitter = (Math.random() - 0.5) * 0.04;
    niftyPrice = Math.max(niftyPrice * (1 + niftyJitter / 100), 1);
    sensexPrice = Math.max(sensexPrice * (1 + niftyJitter / 100), 1);
  } else {
    // Market is CLOSED: Testing Mode (Simulator)
    // Nudges prices by ±0.4% around basePrice so testing/demo trading is 100% functional
    Object.values(state).forEach((stock) => {
      const changePercent = (Math.random() - 0.5) * 0.8;
      const newPrice = Math.max(stock.price * (1 + changePercent / 100), 0.05);
      const totalChangePercent = ((newPrice - stock.basePrice) / stock.basePrice) * 100;

      stock.price = Number(newPrice.toFixed(2));
      stock.isDown = totalChangePercent < 0;
      stock.percent = `${totalChangePercent >= 0 ? "+" : ""}${totalChangePercent.toFixed(2)}%`;
    });

    const niftyChangePercent = (Math.random() - 0.5) * 0.3;
    niftyPrice = Math.max(niftyPrice * (1 + niftyChangePercent / 100), 1);

    const sensexChangePercent = (Math.random() - 0.5) * 0.3;
    sensexPrice = Math.max(sensexPrice * (1 + sensexChangePercent / 100), 1);
  }

  return getSnapshot();
};

function getSnapshot() {
  const isOpen = isIndianMarketOpen();
  const niftyTotalChange = ((niftyPrice - niftyBase) / niftyBase) * 100;
  const sensexTotalChange = ((sensexPrice - sensexBase) / sensexBase) * 100;

  return {
    stocks: Object.values(state),
    isHalted,
    isMarketOpen: isOpen,
    marketMode: isOpen ? "REAL" : "TESTING",
    marketStatus: isOpen ? "OPEN (NSE LIVE)" : "CLOSED (Testing Simulator)",
    lastSyncTime: lastSyncTime ? lastSyncTime.toISOString() : null,
    nifty: {
      price: Number(niftyPrice.toFixed(2)),
      changePercent: Number(niftyTotalChange.toFixed(2)),
      percent: `${niftyTotalChange >= 0 ? "+" : ""}${niftyTotalChange.toFixed(2)}%`,
      isDown: niftyTotalChange < 0,
    },
    sensex: {
      price: Number(sensexPrice.toFixed(2)),
      changePercent: Number(sensexTotalChange.toFixed(2)),
      percent: `${sensexTotalChange >= 0 ? "+" : ""}${sensexTotalChange.toFixed(2)}%`,
      isDown: sensexTotalChange < 0,
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
    const totalChangePercent = ((newPrice - stock.basePrice) / stock.basePrice) * 100;
    stock.price = Number(newPrice.toFixed(2));
    stock.isDown = totalChangePercent < 0;
    stock.percent = `${totalChangePercent >= 0 ? "+" : ""}${totalChangePercent.toFixed(2)}%`;
  });

  niftyPrice = Math.max(niftyPrice * factor, 1);
  sensexPrice = Math.max(sensexPrice * factor, 1);

  return getSnapshot();
};

const resetMarketPrices = () => {
  Object.values(state).forEach((stock) => {
    stock.price = stock.basePrice;
    stock.percent = "+0.00%";
    stock.isDown = false;
  });
  niftyPrice = niftyBase;
  sensexPrice = sensexBase;
  return getSnapshot();
};

module.exports = {
  tick,
  getSnapshot,
  getLivePrice,
  isMarketHalted,
  setMarketHalt,
  triggerShock,
  resetMarketPrices,
  syncRealMarketData,
  isIndianMarketOpen,
};