/**
 * TradeXpert Real HTTP API & Database Integration Test Suite
 */

require('dotenv').config({ path: 'C:/TradeXpert/backend/.env' });
process.env.PORT = '3005'; // Run on test port 3005

const assert = require('assert');
const mongoose = require('mongoose');

console.log('====================================================');
console.log('🌐 TRADEXPERT LIVE API & DATABASE INTEGRATION TEST 🌐');
console.log('====================================================\n');

const BASE_URL = 'http://localhost:3005';

let passed = 0;
let failed = 0;

function logPass(name) {
  passed++;
  console.log(`  ✅ PASS: ${name}`);
}

function logFail(name, err) {
  failed++;
  console.error(`  ❌ FAIL: ${name}`);
  console.error(`     Reason: ${err.message || err}`);
}

async function run() {
  // 1. Connect to Mongo
  console.log('1. Connecting to Database...');
  await mongoose.connect(process.env.MONGO_URL);
  console.log('   DB Connected ✅');

  const { UserModel } = require('./model/UserModel');
  const { OrdersModel } = require('./model/OrdersModel');

  // Start the server by requiring index.js
  console.log('\n2. Starting local test instance on port 3005...');
  require('./index.js');
  // Give server 2.5 seconds to bind and initialize
  await new Promise((r) => setTimeout(r, 2500));
  console.log('   Server running on 3005 ✅\n');

  console.log('--- [TEST GROUP 1] Health & Market Endpoints ---');

  // Test 1: GET /
  try {
    const res = await fetch(`${BASE_URL}/`);
    assert.strictEqual(res.status, 200);
    const text = await res.text();
    assert(text.includes('TradeXpert API Running'));
    logPass('GET / health check returns "TradeXpert API Running"');
  } catch (err) {
    logFail('GET / health check', err);
  }

  // Test 2: GET /market/snapshot
  try {
    const res = await fetch(`${BASE_URL}/market/snapshot`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(Array.isArray(data.stocks));
    assert(data.nifty && data.nifty.price > 0);
    assert(data.sensex && data.sensex.price > 0);
    logPass(`GET /market/snapshot returns live market data (${data.stocks.length} stocks)`);
  } catch (err) {
    logFail('GET /market/snapshot', err);
  }

  console.log('\n--- [TEST GROUP 2] Form Validation & Registration Security ---');

  // Test 3: Reject bad city input "4768476fdw"
  try {
    const res = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bad City User',
        email: `badcity_${Date.now()}@test.com`,
        password: 'Password123!',
        city: '4768476fdw',
        state: 'Delhi',
        address: '123 Main Street, Sector 15',
        phone: '9876543210',
        dob: '1995-05-15',
      }),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert(data.message.includes('City name must contain only letters'));
    logPass('POST /signup rejects invalid numeric city "4768476fdw" with HTTP 400');
  } catch (err) {
    logFail('Reject invalid city "4768476fdw"', err);
  }

  // Test 4: Reject bad state input "9+688698vrv"
  try {
    const res = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bad State User',
        email: `badstate_${Date.now()}@test.com`,
        password: 'Password123!',
        city: 'Delhi',
        state: '9+688698vrv',
        address: '123 Main Street, Sector 15',
        phone: '9876543210',
        dob: '1995-05-15',
      }),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert(data.message.includes('valid Indian State'));
    logPass('POST /signup rejects invalid state "9+688698vrv" with HTTP 400');
  } catch (err) {
    logFail('Reject invalid state "9+688698vrv"', err);
  }

  // Test 5: Reject underage user
  try {
    const res = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Underage User',
        email: `underage_${Date.now()}@test.com`,
        password: 'Password123!',
        city: 'Mumbai',
        state: 'Maharashtra',
        address: '123 Marine Drive, Mumbai',
        phone: '9876543210',
        dob: '2016-01-01',
      }),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert(data.message.includes('18 years'));
    logPass('POST /signup rejects underage user (DOB: 2016-01-01) with HTTP 400');
  } catch (err) {
    logFail('Reject underage user', err);
  }

  // Test 6: Reject invalid phone number
  try {
    const res = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bad Phone User',
        email: `badphone_${Date.now()}@test.com`,
        password: 'Password123!',
        city: 'Mumbai',
        state: 'Maharashtra',
        address: '123 Marine Drive, Mumbai',
        phone: '12345',
        dob: '1995-01-01',
      }),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert(data.message.includes('10-digit'));
    logPass('POST /signup rejects invalid phone "12345" with HTTP 400');
  } catch (err) {
    logFail('Reject invalid phone', err);
  }

  // Test 7: Valid Registration
  const testEmail = `validtrader_${Date.now()}@tradexpert.test`;
  const testPassword = 'StrongPassword@123';
  let authToken = null;
  let testUserId = null;

  try {
    const res = await fetch(`${BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rohit Sharma',
        email: testEmail,
        password: testPassword,
        city: 'Mumbai',
        state: 'Maharashtra',
        address: 'Flat 502, Worli Sea Face, Mumbai',
        phone: '9812345678',
        dob: '1992-04-30',
      }),
    });
    assert(res.status === 200 || res.status === 201);
    const data = await res.json();
    assert(data.message.includes('Signup success') || data.message.includes('Account created'));
    logPass('POST /signup creates user with valid data, state dropdown, & clean profile');
  } catch (err) {
    logFail('Valid user signup', err);
  }

  console.log('\n--- [TEST GROUP 3] Authentication, Tokens & Sessions ---');

  // Test 8: Login with bad credentials
  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword999!',
      }),
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert(data.message.includes('Invalid') || data.message.includes('Wrong') || data.message.includes('❌'));
    logPass('POST /login rejects incorrect password with HTTP 400');
  } catch (err) {
    logFail('Login bad credentials', err);
  }

  // Test 9: Login with correct credentials
  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(data.token, 'Response must contain JWT token');
    assert(data.user, 'Response must contain user profile');
    assert.strictEqual(data.user.email, testEmail);
    assert.strictEqual(data.user.city, 'Mumbai');
    assert.strictEqual(data.user.state, 'Maharashtra');
    authToken = data.token;
    testUserId = data.user.id || data.user._id;
    logPass(`POST /login authenticates user & generates valid JWT token (Wallet: ₹${data.user.wallet})`);
  } catch (err) {
    logFail('Login valid credentials', err);
  }

  console.log('\n--- [TEST GROUP 4] User Profile & Wallet Operations ---');

  // Test 10: GET /profile
  try {
    const res = await fetch(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(res.status, 200);
    const profile = await res.json();
    assert.strictEqual(profile.email, testEmail);
    assert.strictEqual(profile.wallet, 100000);
    logPass('GET /profile retrieves authenticated user account details');
  } catch (err) {
    logFail('GET /profile', err);
  }

  // Test 11: PUT /updateProfile validation (rejects bad city)
  try {
    const res = await fetch(`${BASE_URL}/updateProfile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        city: '12345Gibberish',
      }),
    });
    assert.strictEqual(res.status, 400);
    logPass('PUT /updateProfile rejects invalid alphanumeric city on profile edit');
  } catch (err) {
    logFail('PUT /updateProfile bad city', err);
  }

  // Test 12: PUT /updateProfile valid
  try {
    const res = await fetch(`${BASE_URL}/updateProfile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        city: 'Bengaluru',
        state: 'Karnataka',
        address: 'Indiranagar 100ft road, Bengaluru, Karnataka',
      }),
    });
    assert.strictEqual(res.status, 200);
    const updated = await res.json();
    assert.strictEqual(updated.user.city, 'Bengaluru');
    assert.strictEqual(updated.user.state, 'Karnataka');
    logPass('PUT /updateProfile updates profile city and state dropdown accurately');
  } catch (err) {
    logFail('PUT /updateProfile valid', err);
  }

  // Test 13: POST /wallet/add
  try {
    const res = await fetch(`${BASE_URL}/wallet/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ amount: 25000 }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user.wallet, 125000);
    logPass(`POST /wallet/add credited ₹25,000 -> New Balance: ₹${data.user.wallet}`);
  } catch (err) {
    logFail('POST /wallet/add', err);
  }

  // Test 14: POST /wallet/withdraw (insufficient funds)
  try {
    const res = await fetch(`${BASE_URL}/wallet/withdraw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ amount: 999999999 }),
    });
    assert.strictEqual(res.status, 400);
    logPass('POST /wallet/withdraw correctly protects against overdraft / insufficient funds');
  } catch (err) {
    logFail('POST /wallet/withdraw overdraw', err);
  }

  // Test 15: POST /wallet/withdraw (valid)
  try {
    const res = await fetch(`${BASE_URL}/wallet/withdraw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ amount: 15000 }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user.wallet, 110000);
    logPass(`POST /wallet/withdraw deducted ₹15,000 -> New Balance: ₹${data.user.wallet}`);
  } catch (err) {
    logFail('POST /wallet/withdraw valid', err);
  }

  console.log('\n--- [TEST GROUP 5] Portfolio & Order Execution ---');

  // Test 16: GET /allHoldings
  try {
    const res = await fetch(`${BASE_URL}/allHoldings`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(Array.isArray(data));
    logPass('GET /allHoldings returns user holdings array');
  } catch (err) {
    logFail('GET /allHoldings', err);
  }

  // Test 17: GET /allPositions
  try {
    const res = await fetch(`${BASE_URL}/allPositions`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(Array.isArray(data));
    logPass('GET /allPositions returns user intraday positions array');
  } catch (err) {
    logFail('GET /allPositions', err);
  }

  // Test 18: GET /orders
  try {
    const res = await fetch(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(Array.isArray(data.orders));
    logPass('GET /orders returns user order book with pagination');
  } catch (err) {
    logFail('GET /orders', err);
  }

  // Test 19: POST /newOrder (Market Buy)
  try {
    const res = await fetch(`${BASE_URL}/newOrder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: 'RELIANCE',
        qty: 2,
        price: 2450.0,
        mode: 'BUY',
        orderType: 'MARKET',
      }),
    });
    assert(res.status === 200 || res.status === 201);
    const data = await res.json();
    assert(data.order || data.message);
    logPass('POST /newOrder successfully matched and placed BUY order for RELIANCE');
  } catch (err) {
    logFail('POST /newOrder', err);
  }

  console.log('\n--- [TEST GROUP 6] Platform Security & Role-Based Access Control ---');

  // Test 20: Regular user accessing Admin Route
  try {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert(data.message.includes('Admin'));
    logPass('GET /admin/users enforces RBAC: regular user blocked with HTTP 403');
  } catch (err) {
    logFail('RBAC Admin Users check', err);
  }

  // Test 21: GET /system/announcement
  try {
    const res = await fetch(`${BASE_URL}/system/announcement`);
    assert.strictEqual(res.status, 200);
    logPass('GET /system/announcement returns announcement status');
  } catch (err) {
    logFail('GET /system/announcement', err);
  }

  // Test 22: GET /leaderboard
  try {
    const res = await fetch(`${BASE_URL}/leaderboard`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(Array.isArray(data));
    logPass(`GET /leaderboard returns active platform leaderboard (${data.length} users listed)`);
  } catch (err) {
    logFail('GET /leaderboard', err);
  }

  // ----------------------------------------------------
  // CLEANUP
  // ----------------------------------------------------
  console.log('\nCleaning up test data from MongoDB Atlas...');
  try {
    await UserModel.deleteMany({ email: { $in: [testEmail] } });
    await OrdersModel.deleteMany({ user: testUserId });
    console.log('Test data cleaned up successfully ✅');
  } catch (e) {
    console.warn('Cleanup error (non-fatal):', e.message);
  }

  console.log('\n====================================================');
  console.log(`INTEGRATION TEST SUMMARY:`);
  console.log(`Total API Tests: ${passed + failed}`);
  console.log(`Passed:          ${passed} ✅`);
  console.log(`Failed:          ${failed} ❌`);
  console.log('====================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Integration test crashed:', err);
  process.exit(1);
});
