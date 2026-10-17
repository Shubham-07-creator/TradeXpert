import React, { useState } from "react";
import { Link } from "react-router-dom";

function Brokerage() {
  const [activeTab, setActiveTab] = useState("equity");

  return (
    <section className="container py-5">
      {/* 1. Header & Trust Promise */}
      <div className="text-center mb-5">
        <span
          className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold mb-2"
          style={{ fontSize: "0.85rem" }}
        >
          100% Transparent Fee Schedule
        </span>
        <h2 className="fw-bold mt-2" style={{ color: "var(--color-text-strong, #1f2937)" }}>
          Statutory Regulatory Charges &amp; Brokerage Policy
        </h2>
        <p className="text-muted mx-auto" style={{ maxWidth: "680px", fontSize: "0.95rem" }}>
          No hidden fees, no fine-print surprises. We pass on exchange and government regulatory taxes at pure actual cost.
        </p>
      </div>

      {/* 2. Trust Assurance Grid */}
      <div className="row g-3 mb-5">
        <div className="col-md-3 col-6">
          <div className="p-3 rounded-3 text-center h-100" style={{ background: "var(--color-bg-card, #ffffff)", border: "1px solid var(--color-border, #e5e7eb)" }}>
            <div className="fs-3 mb-2 text-primary">₹0</div>
            <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>Free Equity Delivery</h6>
            <small className="text-muted" style={{ fontSize: "0.78rem" }}>Zero brokerage on all long-term delivery investments</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="p-3 rounded-3 text-center h-100" style={{ background: "var(--color-bg-card, #ffffff)", border: "1px solid var(--color-border, #e5e7eb)" }}>
            <div className="fs-3 mb-2 text-primary">₹20</div>
            <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>Capped Intraday &amp; F&amp;O</h6>
            <small className="text-muted" style={{ fontSize: "0.78rem" }}>Flat ₹20 or 0.03% (whichever is lower) per executed order</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="p-3 rounded-3 text-center h-100" style={{ background: "var(--color-bg-card, #ffffff)", border: "1px solid var(--color-border, #e5e7eb)" }}>
            <div className="fs-3 mb-2 text-primary">₹0</div>
            <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>Direct Mutual Funds</h6>
            <small className="text-muted" style={{ fontSize: "0.78rem" }}>Zero commission, zero transaction fees on all mutual funds</small>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="p-3 rounded-3 text-center h-100" style={{ background: "var(--color-bg-card, #ffffff)", border: "1px solid var(--color-border, #e5e7eb)" }}>
            <div className="fs-3 mb-2 text-primary">₹0</div>
            <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>Account Opening</h6>
            <small className="text-muted" style={{ fontSize: "0.78rem" }}>Free 100% paperless Demat &amp; Trading account opening</small>
          </div>
        </div>
      </div>

      {/* 3. Comprehensive Regulatory Charges Table */}
      <div className="card shadow-sm border-0 mb-5 overflow-hidden" style={{ borderRadius: "12px", border: "1px solid var(--color-border, #e5e7eb)" }}>
        <div className="card-header bg-light d-flex justify-content-between align-items-center py-3 px-4 border-bottom">
          <h5 className="mb-0 fw-bold" style={{ fontSize: "1.05rem" }}>Detailed Regulatory &amp; Statutory Charges</h5>
          <span className="badge bg-secondary-subtle text-secondary small">SEBI Prescribed Limits</span>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.88rem" }}>
            <thead className="table-light">
              <tr>
                <th scope="col" className="ps-4">Segment</th>
                <th scope="col">Brokerage</th>
                <th scope="col">STT / CTT</th>
                <th scope="col">Exchange Turnover Fee</th>
                <th scope="col">GST (18%)</th>
                <th scope="col">SEBI Charges</th>
                <th scope="col" className="pe-4">Stamp Duty</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="ps-4 fw-bold">Equity Delivery</td>
                <td><span className="badge bg-success-subtle text-success">Zero (₹0)</span></td>
                <td>0.1% on Buy &amp; Sell</td>
                <td>NSE: 0.00297%<br />BSE: 0.00375%</td>
                <td>18% on (Brokerage + Txn Charges)</td>
                <td>₹10 / crore</td>
                <td className="pe-4">0.015% or ₹1500 / crore (Buy)</td>
              </tr>
              <tr>
                <td className="ps-4 fw-bold">Equity Intraday</td>
                <td>Flat ₹20 or 0.03% (whichever lower)</td>
                <td>0.025% on Sell only</td>
                <td>NSE: 0.00297%<br />BSE: 0.00375%</td>
                <td>18% on (Brokerage + Txn Charges)</td>
                <td>₹10 / crore</td>
                <td className="pe-4">0.003% or ₹300 / crore (Buy)</td>
              </tr>
              <tr>
                <td className="ps-4 fw-bold">Equity Futures</td>
                <td>Flat ₹20 or 0.03% (whichever lower)</td>
                <td>0.02% on Sell only</td>
                <td>NSE: 0.00173%</td>
                <td>18% on (Brokerage + Txn Charges)</td>
                <td>₹10 / crore</td>
                <td className="pe-4">0.002% or ₹200 / crore (Buy)</td>
              </tr>
              <tr>
                <td className="ps-4 fw-bold">Equity Options</td>
                <td>Flat ₹20 per executed order</td>
                <td>0.125% on Premium (Sell)</td>
                <td>NSE: 0.03503% (on Premium)</td>
                <td>18% on (Brokerage + Txn Charges)</td>
                <td>₹10 / crore</td>
                <td className="pe-4">0.003% or ₹300 / crore (Buy)</td>
              </tr>
              <tr>
                <td className="ps-4 fw-bold">Direct Mutual Funds</td>
                <td><span className="badge bg-success-subtle text-success">Zero (₹0)</span></td>
                <td>Nil</td>
                <td>Nil</td>
                <td>Nil</td>
                <td>Nil</td>
                <td className="pe-4">0.005% (Buy)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Terms, Conditions & Policy Clarifications */}
      <div className="row g-4 mb-5">
        <div className="col-lg-7">
          <div className="p-4 rounded-3 h-100" style={{ background: "var(--color-bg-card, #ffffff)", border: "1px solid var(--color-border, #e5e7eb)" }}>
            <h5 className="fw-bold mb-3" style={{ color: "var(--color-text-strong, #1f2937)" }}>
              Terms of Service &amp; Operational Charges
            </h5>
            <ul className="text-muted" style={{ lineHeight: "2.1", fontSize: "0.88rem", paddingLeft: "1.2rem" }}>
              <li>
                <b>Call &amp; Trade &amp; RMS Auto-Squareoff:</b> Additional charges of ₹50 + 18% GST per executed order for auto-squareoff by Risk Management Systems.
              </li>
              <li>
                <b>Digital Contract Notes:</b> Delivered via authenticated encrypted email daily at <b>₹0 (Free)</b>. Physical copies charged ₹20 + courier charges.
              </li>
              <li>
                <b>Depository Participant (DP) Charges:</b> ₹13.5 + GST per scrip per day on debit (irrespective of quantity sold) when selling delivery shares.
              </li>
              <li>
                <b>Delayed Payment Charges:</b> Interest levied at 0.05% per day (18% p.a.) on debit balances resulting from ledger deficits.
              </li>
              <li>
                <b>Instant Fund Transfers:</b> UPI deposits and IMPS/NEFT withdrawals are processed without broker-levied gateway fees.
              </li>
            </ul>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="p-4 rounded-3 h-100 d-flex flex-column justify-content-between" style={{ background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.25)" }}>
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-warning text-dark fw-bold" style={{ fontSize: "0.72rem" }}>MANDATORY SEBI ADVISORY</span>
              </div>
              <h6 className="fw-bold text-dark mb-2">Risk Disclosures on Derivatives</h6>
              <p className="text-secondary small mb-3" style={{ lineHeight: "1.6" }}>
                According to SEBI study, 9 out of 10 individual traders in equity Futures and Options Segment incurred net losses. 
                On average, loss makers registered net trading loss close to ₹50,000, with an additional 28% incurred in transaction costs.
              </p>
              <p className="text-secondary small mb-0" style={{ lineHeight: "1.6" }}>
                TradeXpert offers an institutional <b>₹1,00,000 risk-free paper trading sandbox</b> to practice and validate strategies before committing real funds.
              </p>
            </div>
            <div className="mt-4 pt-3 border-top border-warning-subtle d-flex justify-content-between align-items-center">
              <span className="small fw-semibold text-muted">Ready to practice?</span>
              <Link to="/signup" className="btn btn-primary btn-sm px-3 fw-semibold">
                Open Free Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Brokerage;
