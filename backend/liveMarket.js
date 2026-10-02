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

watchlistSeed.forEach((stock, idx) => {
  let volatility = 0.12;
  let activityRate = 0.38; // ~38% chance to tick in a cycle

  const sec = stock.sector || "";
  if (sec === "Tech" || sec === "IT") {
    volatility = 0.15;
    activityRate = 0.45;
  } else if (sec === "Banking" || sec === "Financial Services") {
    volatility = 0.12;
    activityRate = 0.50;
  } else if (sec === "Auto" || sec === "Metals") {
    volatility = 0.18;
    activityRate = 0.42;
  } else if (sec === "FMCG" || sec === "Pharma" || sec === "Power") {
    volatility = 0.08;
    activityRate = 0.28; // Stays quieter/steady longer
  }

  // Marquee high-volume stocks trade with higher frequency
  const marqueeStocks = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "TATAMOTORS", "ZOMATO"];
  if (marqueeStocks.includes(stock.name)) {
    activityRate = Math.min(activityRate + 0.18, 0.65);
  }

  const trends = ["BULL", "BEAR", "SIDEWAYS"];
  const initialTrend = trends[idx % 3];

  state[stock.name] = {
    name: stock.name,
    sector: stock.sector,
    basePrice: stock.price,
    price: stock.price,
    percent: "+0.00%",
    isDown: false,
    dayHigh: stock.price * 1.01,
    dayLow: stock.price * 0.99,
    volume: 100000 + Math.floor(Math.random() * 50000),
    isRealData: false,
    // Independent Quant Simulation Parameters
    trend: initialTrend,
    trendTicksLeft: Math.floor(Math.random() * 12) + 6,
    quietTicksLeft: idx % 3 === 0 ? Math.floor(Math.random() * 5) + 1 : 0, // Staggered start
    volatility,
    activityRate,
    demandBoost: 0,
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
 * Asynchronous, Independent Tick function executed every 2.5 seconds by server.
 * - If Market is OPEN: prices follow real Dalal Street quotes with micro-fluctuations.
 * - If Market is CLOSED: Testing / Learning / Sandbox Simulator:
 *    * Individual stocks move independently (NOT all at once).
 *    * Slower stocks remain quiet/consolidating (flat) for periods.
 *    * Stocks hold individual micro-trends (some in gain, some in loss, some sideways).
 *    * Mean-Reversion anchors prices realistically around basePrice.
 *    * User trades create instant demand/supply pressure.
 */
const tick = () => {
  if (isHalted) {
    return getSnapshot();
  }

  const isOpen = isIndianMarketOpen();

  if (isOpen) {
    // Market is OPEN (9:15 AM - 3:30 PM IST):
    // Real Dalal Street prices are primary (from 15s sync).
    // Between syncs, only active stocks receive realistic micro-fluctuation (±0.03%),
    // others remain steady, simulating genuine exchange order-book trades.
    Object.values(state).forEach((stock) => {
      // Randomized activity: not all stocks tick on every 2.5s cycle!
      if (Math.random() > stock.activityRate * 0.7) {
        return; // stays flat this cycle
      }

      const microJitter = (Math.random() - 0.5) * (stock.volatility || 0.1) * 0.4;
      const newPrice = Math.max(stock.price * (1 + microJitter / 100), 0.05);
      const totalChangePercent = ((newPrice - stock.basePrice) / stock.basePrice) * 100;
      stock.price = Number(newPrice.toFixed(2));
      stock.isDown = totalChangePercent < 0;
      stock.percent = `${totalChangePercent >= 0 ? "+" : ""}${totalChangePercent.toFixed(2)}%`;
    });

    const niftyJitter = (Math.random() - 0.5) * 0.03;
    niftyPrice = Math.max(niftyPrice * (1 + niftyJitter / 100), 1);
    sensexPrice = Math.max(sensexPrice * (1 + niftyJitter / 100), 1);
  } else {
    // Market is CLOSED (Testing / Learning / Sandbox Simulator):
    let advances = 0;
    let declines = 0;
    let activeMoved = 0;

    Object.values(state).forEach((stock) => {
      // 1. If stock is resting in a quiet / consolidation phase, leave price unchanged
      if (stock.quietTicksLeft > 0) {
        stock.quietTicksLeft--;
        return; // Flat price! No flash in UI, stays steady
      }

      // 2. Probability check: Does this stock trade on this tick?
      // If not, put it into a brief quiet/consolidation state (2 to 6 ticks = 5s to 15s)
      if (Math.random() > stock.activityRate) {
        stock.quietTicksLeft = Math.floor(Math.random() * 5) + 2;
        return;
      }

      // 3. Stock is ACTIVE on this tick!
      activeMoved++;

      // Trend lifecycle & Mean-Reversion Check
      stock.trendTicksLeft--;
      if (stock.trendTicksLeft <= 0) {
        const deviationPct = ((stock.price - stock.basePrice) / stock.basePrice) * 100;

        // Ornstein-Uhlenbeck Mean Reversion:
        if (deviationPct > 1.8) {
          // Stock has gained significantly: high chance of pullback / profit-booking
          stock.trend = Math.random() < 0.75 ? "BEAR" : "SIDEWAYS";
        } else if (deviationPct < -1.8) {
          // Stock has dropped significantly: high chance of bounce / value buying
          stock.trend = Math.random() < 0.75 ? "BULL" : "SIDEWAYS";
        } else {
          // Normal distribution: independent trends
          const r = Math.random();
          if (r < 0.42) stock.trend = "BULL";
          else if (r < 0.84) stock.trend = "BEAR";
          else stock.trend = "SIDEWAYS";
        }

        // New trend duration: 8 to 20 ticks (approx 20s to 50s of momentum)
        stock.trendTicksLeft = Math.floor(Math.random() * 12) + 8;
      }

      // Compute drift based on independent trend & stock volatility
      let drift = 0;
      const vol = stock.volatility || 0.12;

      if (stock.trend === "BULL") {
        drift = (0.03 + Math.random() * 0.11) * (vol / 0.12);
      } else if (stock.trend === "BEAR") {
        drift = -(0.03 + Math.random() * 0.11) * (vol / 0.12);
      } else {
        // SIDEWAYS: tiny oscillation around current price
        drift = (Math.random() - 0.5) * 0.04 * (vol / 0.12);
      }

      // Apply user order demand/supply pressure if any
      if (stock.demandBoost) {
        drift += stock.demandBoost;
        stock.demandBoost *= 0.6; // smooth decay
        if (Math.abs(stock.demandBoost) < 0.005) {
          stock.demandBoost = 0;
        }
      }

      const calculatedPrice = stock.price * (1 + drift / 100);
      const newPrice = Math.max(Number(calculatedPrice.toFixed(2)), 0.05);

      if (newPrice !== stock.price) {
        const totalChangePercent = ((newPrice - stock.basePrice) / stock.basePrice) * 100;
        stock.price = newPrice;
        stock.isDown = totalChangePercent < 0;
        stock.percent = `${totalChangePercent >= 0 ? "+" : ""}${totalChangePercent.toFixed(2)}%`;
        stock.dayHigh = Math.max(stock.dayHigh || newPrice, newPrice);
        stock.dayLow = Math.min(stock.dayLow || newPrice, newPrice);
        stock.volume = (stock.volume || 100000) + Math.floor(Math.random() * 400) + 50;

        if (stock.isDown) declines++;
        else advances++;
      }
    });

    // Correlation with Market Breadth for NIFTY and SENSEX
    if (activeMoved > 0) {
      const netBias = (advances - declines) / Math.max(activeMoved, 1);
      const indexDrift = netBias * 0.035 + (Math.random() - 0.5) * 0.015;

      niftyPrice = Math.max(Number((niftyPrice * (1 + indexDrift / 100)).toFixed(2)), 1);
      sensexPrice = Math.max(Number((sensexPrice * (1 + indexDrift / 100)).toFixed(2)), 1);
    }
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
    marketMode: isOpen ? "REAL" : "QUANT_SIM",
    marketStatus: isOpen ? "OPEN (NSE LIVE)" : "CLOSED (Independent Quant Simulator)",
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

/**
 * Records user buy/sell trade demand impact.
 * When a user buys a stock, demand pressure is applied to nudge the price up.
 * When a user sells, supply pressure nudges the price down.
 */
function recordTradeDemand(stockName, mode, quantity) {
  const stock = state[stockName];
  if (!stock) return;
  const qty = Number(quantity) || 1;
  const pressure = Math.min((qty / 500) * 0.15, 0.45); // up to 0.45% micro impact

  if (mode === "BUY") {
    stock.demandBoost = (stock.demandBoost || 0) + pressure;
    stock.trend = "BULL";
  } else {
    stock.demandBoost = (stock.demandBoost || 0) - pressure;
    stock.trend = "BEAR";
  }
  stock.quietTicksLeft = 0; // Wakes up immediately upon user trade!
}

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
  recordTradeDemand,
};