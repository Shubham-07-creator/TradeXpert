import React from "react";

function Brokerage() {
  return (
    <div className="container">
      <div className="row p-5 mt-5 border-top">
        <div className="col-lg-8 p-4">
          <h3 className="fs-5 mb-3" style={{ color: "var(--primary)" }}>
            Brokerage & Demat Policy
          </h3>
          <ul
            style={{
              textAlign: "left",
              lineHeight: "2.2",
              fontSize: "14px",
              color: "var(--ink-soft)",
            }}
          >
            <li>
              Call & Trade and RMS auto-squareoff: Additional charges of ₹50 +
              GST per order.
            </li>
            <li>Digital contract notes will be sent via e-mail for free.</li>
            <li>
              Physical copies of contract notes, if required, shall be charged
              ₹20 per contract note plus courier charges.
            </li>
            <li>
              For NRI account (non-PIS), 0.5% or ₹100 per executed order for
              equity (whichever is lower).
            </li>
            <li>
              For NRI account (PIS), 0.5% or ₹200 per executed order for equity
              (whichever is lower).
            </li>
            <li>
              If the account is in debit balance, any order placed will be
              charged ₹40 per executed order instead of ₹20 per executed order.
            </li>
          </ul>
        </div>
        <div className="col-lg-4 p-4 text-center">
          <h3 className="fs-5 mb-3" style={{ color: "var(--primary)" }}>
            List of Charges
          </h3>
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>
            All statutory taxes including STT, GST, Stamp Duty, and Exchange
            charges are passed on at actual cost without hidden markups.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Brokerage;
