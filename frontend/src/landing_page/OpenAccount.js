import React from "react";
import { Link } from "react-router-dom";

function OpenAccount() {
  return (
    <section className="open-account-section py-5 my-4">
      <div className="container">
        <div className="open-account-card fade-up">
          <div className="open-account-content text-center">
            <span className="badge-fintech mb-3">
              <span className="live-dot me-2"></span>
              INSTANT DIGITAL ONBOARDING
            </span>

            <h2 className="open-account-title display-5 fw-bold mb-3">
              Open your free TradeXpert account
            </h2>

            <p className="open-account-subtitle mb-4">
              Invest in zero-commission stocks, direct mutual funds, and trade intraday with institutional-grade speed and reliability.
            </p>

            <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
              <Link
                to="/signup"
                className="btn btn-primary btn-lg rounded-pill px-5 py-3 fw-bold shadow-sm hover-scale d-inline-flex align-items-center gap-2"
                style={{ fontSize: "1.05rem" }}
              >
                <span>Get Started Now</span>
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
              <Link
                to="/about"
                className="btn btn-outline-secondary btn-lg rounded-pill px-4 py-3 fw-semibold hover-scale"
                style={{ fontSize: "1.05rem" }}
              >
                Learn More
              </Link>
            </div>

            {/* Trust checklist */}
            <div className="open-account-trust-strip d-flex flex-wrap justify-content-center gap-4 pt-3 border-top">
              <span className="open-trust-item d-flex align-items-center gap-2 small">
                <i className="fa-solid fa-circle-check text-success"></i>
                <span>₹0 Demat Account Opening</span>
              </span>
              <span className="open-trust-item d-flex align-items-center gap-2 small">
                <i className="fa-solid fa-circle-check text-success"></i>
                <span>5-Minute Aadhaar eKYC</span>
              </span>
              <span className="open-trust-item d-flex align-items-center gap-2 small">
                <i className="fa-solid fa-circle-check text-success"></i>
                <span>₹0 Free Equity Delivery</span>
              </span>
              <span className="open-trust-item d-flex align-items-center gap-2 small">
                <i className="fa-solid fa-circle-check text-success"></i>
                <span>SEBI &amp; NSE Registered</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OpenAccount;