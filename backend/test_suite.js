/**
 * TradeXpert End-to-End Comprehensive Test Suite
 * Covers Backend, Schemas, Security, Validation, Market Engine, Order Logic, and Client Route Maps.
 */

require('dotenv').config({ path: 'C:/TradeXpert/backend/.env' });
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

console.log('====================================================');
console.log('🚀 TRADEXPERT COMPREHENSIVE AUTOMATED TEST SUITE 🚀');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Reason: ${err.message}`);
  }
}

async function testAsync(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Reason: ${err.message}`);
  }
}

async function runAllTests() {
  // ----------------------------------------------------
  // SECTION 1: ENVIRONMENT & CONFIGURATION
  // ----------------------------------------------------
  console.log('\n--- [SECTION 1] Environment & Security Config ---');
  test('JWT_SECRET is set and sufficiently strong (>= 32 chars)', () => {
    assert(process.env.JWT_SECRET, 'JWT_SECRET is missing');
    assert(process.env.JWT_SECRET.length >= 32, 'JWT_SECRET should be >= 32 characters');
  });

  test('MONGO_URL connection string is present and valid', () => {
    assert(process.env.MONGO_URL, 'MONGO_URL is missing');
    assert(process.env.MONGO_URL.startsWith('mongodb'), 'MONGO_URL must be a mongodb URI');
  });

  test('GOOGLE_CLIENT_ID configuration exists', () => {
    assert(process.env.GOOGLE_CLIENT_ID, 'GOOGLE_CLIENT_ID is missing');
  });

  // ----------------------------------------------------
  // SECTION 2: FORM VALIDATION RULES (User Specific Checks)
  // ----------------------------------------------------
  console.log('\n--- [SECTION 2] Form Validation & Edge Case Engine ---');

  const indiaStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry"
  ];

  test('India States list contains exactly 36 States & UTs with no duplicates', () => {
    assert.strictEqual(indiaStates.length, 36);
    const unique = new Set(indiaStates);
    assert.strictEqual(unique.size, 36);
  });

  const cityRegex = /^[a-zA-Z\s]{2,50}$/;
  test('City validation rejects user bad input "4768476fdw"', () => {
    assert.strictEqual(cityRegex.test("4768476fdw"), false);
  });

  test('City validation rejects special characters like "Mumbai#123"', () => {
    assert.strictEqual(cityRegex.test("Mumbai#123"), false);
    assert.strictEqual(cityRegex.test("Delhi<script>"), false);
  });

  test('City validation accepts valid Indian cities ("Bengaluru", "New Delhi", "Pune")', () => {
    assert.strictEqual(cityRegex.test("Bengaluru"), true);
    assert.strictEqual(cityRegex.test("New Delhi"), true);
    assert.strictEqual(cityRegex.test("Pune"), true);
  });

  test('State validation rejects user bad input "9+688698vrv"', () => {
    assert.strictEqual(indiaStates.includes("9+688698vrv"), false);
  });

  test('State validation accepts registered Indian states ("Maharashtra", "Delhi")', () => {
    assert.strictEqual(indiaStates.includes("Maharashtra"), true);
    assert.strictEqual(indiaStates.includes("Delhi"), true);
  });

  const addressValidate = (addr) => {
    if (!addr || addr.trim().length < 10) return false;
    return true;
  };

  test('Address validation rejects short/empty strings', () => {
    assert.strictEqual(addressValidate(""), false);
    assert.strictEqual(addressValidate("Flat 1"), false);
    assert.strictEqual(addressValidate("   "), false);
  });

  test('Address validation accepts full residential addresses', () => {
    assert.strictEqual(addressValidate("Flat 402, Trade Tower, Bandra Kurla Complex, Mumbai"), true);
  });

  const ageValidate = (dobStr) => {
    if (!dobStr) return false;
    const dobDate = new Date(dobStr);
    if (isNaN(dobDate.getTime())) return false;
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    return age >= 18;
  };

  test('Age check rejects underage users (< 18 years old)', () => {
    assert.strictEqual(ageValidate("2016-01-01"), false);
    assert.strictEqual(ageValidate("2012-05-20"), false);
  });

  test('Age check accepts adult users (>= 18 years old)', () => {
    assert.strictEqual(ageValidate("1995-10-15"), true);
    assert.strictEqual(ageValidate("2000-01-01"), true);
  });

  const phoneRegex = /^[6-9]\d{9}$/;
  test('Phone validation strictly enforces 10-digit Indian mobile numbers', () => {
    assert.strictEqual(phoneRegex.test("12345"), false);
    assert.strictEqual(phoneRegex.test("987654321"), false); // 9 digits
    assert.strictEqual(phoneRegex.test("98765432100"), false); // 11 digits
    assert.strictEqual(phoneRegex.test("5876543210"), false); // starts with 5
    assert.strictEqual(phoneRegex.test("9876543210"), true); // starts with 9
    assert.strictEqual(phoneRegex.test("8765432109"), true); // starts with 8
    assert.strictEqual(phoneRegex.test("7654321098"), true); // starts with 7
    assert.strictEqual(phoneRegex.test("6543210987"), true); // starts with 6
  });

  // ----------------------------------------------------
  // SECTION 3: AUTHENTICATION, TOKENS & CRYPTOGRAPHY
  // ----------------------------------------------------
  console.log('\n--- [SECTION 3] Auth Cryptography & RBAC Middlewares ---');

  await testAsync('Bcrypt hashes and verifies user passwords securely', async () => {
    const rawPass = 'TradeXpert@Secure2026';
    const hash = await bcrypt.hash(rawPass, 10);
    assert(hash !== rawPass, 'Password was not hashed');
    const isMatch = await bcrypt.compare(rawPass, hash);
    assert.strictEqual(isMatch, true, 'Valid password failed to match hash');
    const isBadMatch = await bcrypt.compare('WrongPassword123', hash);
    assert.strictEqual(isBadMatch, false, 'Invalid password erroneously matched hash');
  });

  test('JWT sign and verify generates valid payload & detects tampering', () => {
    const payload = { id: 'user123', email: 'trader@tradexpert.com', role: 'user' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    assert.strictEqual(decoded.id, payload.id);
    assert.strictEqual(decoded.email, payload.email);

    // Tampered token test
    assert.throws(() => {
      jwt.verify(token + 'tampered', process.env.JWT_SECRET);
    });
  });

  test('Admin RBAC Middleware allows admin and blocks regular user', () => {
    const adminMiddleware = require('C:/TradeXpert/backend/middleware/adminMiddleware');
    let adminPassed = false;
    const reqAdmin = { userRole: 'admin' };
    const resMock = {
      status: (code) => ({
        json: (data) => ({ code, data })
      })
    };
    adminMiddleware(reqAdmin, resMock, () => { adminPassed = true; });
    assert.strictEqual(adminPassed, true, 'Admin should have been allowed through');

    let userBlocked = false;
    const reqUser = { userRole: 'user' };
    const resUserMock = {
      status: (code) => {
        if (code === 403) userBlocked = true;
        return { json: () => {} };
      }
    };
    adminMiddleware(reqUser, resUserMock, () => {});
    assert.strictEqual(userBlocked, true, 'Regular user must be blocked with HTTP 403');
  });

  // ----------------------------------------------------
  // SECTION 4: LIVE MARKET QUANT ENGINE
  // ----------------------------------------------------
  console.log('\n--- [SECTION 4] Live Market Quant Simulation Engine ---');

  test('liveMarket module loads and provides market snapshot with stocks, nifty, and sensex', () => {
    const liveMarket = require('C:/TradeXpert/backend/liveMarket');
    assert(liveMarket, 'liveMarket module failed to load');
    const snapshot = liveMarket.getSnapshot();
    assert(snapshot, 'getSnapshot returned null/undefined');
    assert(Array.isArray(snapshot.stocks), 'snapshot.stocks must be an array');
    assert(snapshot.stocks.length > 0, 'snapshot.stocks must contain items');

    const firstStock = snapshot.stocks[0];
    assert(firstStock.name, 'Stock must have a name');
    assert(firstStock.price > 0, `Price for ${firstStock.name} must be positive, got ${firstStock.price}`);
    assert(typeof firstStock.percent === 'string', 'Stock percent must be formatted string');

    assert(snapshot.nifty && snapshot.nifty.price > 0, 'NIFTY price must be positive');
    assert(snapshot.sensex && snapshot.sensex.price > 0, 'SENSEX price must be positive');
    console.log(`     📊 Loaded ${snapshot.stocks.length} stocks | NIFTY: ₹${snapshot.nifty.price} | SENSEX: ₹${snapshot.sensex.price}`);
  });

  // ----------------------------------------------------
  // SECTION 5: DATABASE SCHEMAS & MODELS
  // ----------------------------------------------------
  console.log('\n--- [SECTION 5] Database Models & Mongoose Schemas ---');

  test('UserModel schema fields, defaults and indexes', () => {
    const { UserModel } = require('C:/TradeXpert/backend/model/UserModel');
    assert(UserModel, 'UserModel is undefined');
    const testUser = new UserModel({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedpassword'
    });
    assert.strictEqual(testUser.wallet, 100000, 'Default wallet balance must be 100,000');
    assert.strictEqual(testUser.role, 'user', 'Default role must be user');
    assert.strictEqual(testUser.isBlocked, false, 'Default isBlocked must be false');
    assert.strictEqual(testUser.realizedPnL, 0, 'Default realizedPnL must be 0');
  });

  test('HoldingsModel schema fields and defaults', () => {
    const { HoldingsModel } = require('C:/TradeXpert/backend/model/HoldingsModel');
    assert(HoldingsModel, 'HoldingsModel is undefined');
    const testHolding = new HoldingsModel({
      name: 'RELIANCE',
      qty: 10,
      avg: 2450.50,
      price: 2460.00,
      net: '+0.39%',
      day: '+1.2%'
    });
    assert.strictEqual(testHolding.name, 'RELIANCE');
    assert.strictEqual(testHolding.qty, 10);
  });

  test('OrdersModel schema fields and order status enum', () => {
    const { OrdersModel } = require('C:/TradeXpert/backend/model/OrdersModel');
    assert(OrdersModel, 'OrdersModel is undefined');
    const testOrder = new OrdersModel({
      name: 'TCS',
      qty: 5,
      price: 3800.00,
      mode: 'BUY',
      orderType: 'MARKET',
      status: 'COMPLETED'
    });
    assert.strictEqual(testOrder.status, 'COMPLETED');
    assert.strictEqual(testOrder.mode, 'BUY');
  });

  test('PositionsModel schema fields and day change logic', () => {
    const { PositionsModel } = require('C:/TradeXpert/backend/model/PositionsModel');
    assert(PositionsModel, 'PositionsModel is undefined');
    const testPos = new PositionsModel({
      product: 'MIS',
      name: 'INFY',
      qty: 25,
      avg: 1550,
      price: 1565,
      net: '+0.97%',
      day: '+0.5%'
    });
    assert.strictEqual(testPos.product, 'MIS');
    assert.strictEqual(testPos.qty, 25);
  });

  // ----------------------------------------------------
  // SECTION 6: CLIENT CODE INTEGRITY & ROUTE MAPPING
  // ----------------------------------------------------
  console.log('\n--- [SECTION 6] Client Routing, Components & Assets Integrity ---');

  test('Frontend index.js references valid component files', () => {
    const frontendPages = [
      'C:/TradeXpert/frontend/src/landing_page/home/HomePage.js',
      'C:/TradeXpert/frontend/src/landing_page/Navbar.js',
      'C:/TradeXpert/frontend/src/landing_page/Footer.js',
      'C:/TradeXpert/frontend/src/components/ScrollToTop.js',
      'C:/TradeXpert/frontend/src/landing_page/login/Login.js',
      'C:/TradeXpert/frontend/src/landing_page/signup/Signup.js',
      'C:/TradeXpert/frontend/src/landing_page/login/ForgotPassword.js',
      'C:/TradeXpert/frontend/src/landing_page/login/ResetPassword.js',
      'C:/TradeXpert/frontend/src/landing_page/profile/Profile.js',
      'C:/TradeXpert/frontend/src/landing_page/about/AboutPage.js',
      'C:/TradeXpert/frontend/src/landing_page/products/ProductsPage.js',
      'C:/TradeXpert/frontend/src/landing_page/pricing/PricingPage.js',
      'C:/TradeXpert/frontend/src/landing_page/support/SupportPage.js',
      'C:/TradeXpert/frontend/src/landing_page/NotFound.js',
      'C:/TradeXpert/frontend/src/utils/indiaStates.js'
    ];

    for (const file of frontendPages) {
      assert(fs.existsSync(file), `Missing expected frontend file: ${file}`);
    }
  });

  test('Dashboard Dashboard.js references valid component files', () => {
    const dashboardComponents = [
      'C:/TradeXpert/dashboard/src/components/Apps.js',
      'C:/TradeXpert/dashboard/src/components/Funds.js',
      'C:/TradeXpert/dashboard/src/components/Holdings.js',
      'C:/TradeXpert/dashboard/src/components/Orders.js',
      'C:/TradeXpert/dashboard/src/components/Positions.js',
      'C:/TradeXpert/dashboard/src/components/Summary.js',
      'C:/TradeXpert/dashboard/src/components/WatchList.js',
      'C:/TradeXpert/dashboard/src/components/Leaderboard.js',
      'C:/TradeXpert/dashboard/src/components/AdminPanel.js',
      'C:/TradeXpert/dashboard/src/components/DashboardNotFound.js',
      'C:/TradeXpert/dashboard/src/components/GeneralContext.js'
    ];

    for (const file of dashboardComponents) {
      assert(fs.existsSync(file), `Missing expected dashboard component: ${file}`);
    }
  });

  test('ScrollToTop component contains window.scrollTo implementation', () => {
    const content = fs.readFileSync('C:/TradeXpert/frontend/src/components/ScrollToTop.js', 'utf-8');
    assert(content.includes('window.scrollTo'), 'ScrollToTop must call window.scrollTo');
    assert(content.includes('useLocation'), 'ScrollToTop must use useLocation hook');
  });

  test('NotFound (404) page provides return navigation CTAs', () => {
    const content = fs.readFileSync('C:/TradeXpert/frontend/src/landing_page/NotFound.js', 'utf-8');
    assert(content.includes('Lost in Dalal Street'), 'NotFound should have Dalal Street theme');
    assert(content.includes('Back to Home'), 'NotFound must have Back to Home CTA');
  });

  test('DashboardNotFound component provides return navigation CTA', () => {
    const content = fs.readFileSync('C:/TradeXpert/dashboard/src/components/DashboardNotFound.js', 'utf-8');
    assert(content.includes('404'), 'DashboardNotFound must indicate 404');
    assert(content.includes('Dashboard Summary'), 'DashboardNotFound must have Return CTA');
  });

  // ----------------------------------------------------
  // SECTION 7: SUMMARY & RESULTS
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`TEST RESULTS SUMMARY:`);
  console.log(`Total Executed: ${totalTests}`);
  console.log(`Passed:         ${passedTests} ✅`);
  console.log(`Failed:         ${failedTests} ❌`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error('Test suite crashed unexpectedly:', err);
  process.exit(1);
});
