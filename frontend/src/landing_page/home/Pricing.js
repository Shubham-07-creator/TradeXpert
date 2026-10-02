import React from 'react';
import { Link } from 'react-router-dom';

function Pricing() {
  return (
    <section className="section pricing-section py-5">
      <div className="container">
        {/* Section Header */}
        <div className="row align-items-end justify-content-between mb-5 g-4">
          <div className="col-lg-7 fade-up stagger-1">
            <span className="badge-fintech mb-2">100% TRANSPARENT PRICING</span>
            <h2 className="display-6 fw-bold mb-3" style={{ letterSpacing: "-0.03em" }}>
              Unbeatable pricing. Zero surprises.
            </h2>
            <p className="text-muted mb-0" style={{ fontSize: "1.05rem", maxWidth: "600px" }}>
              We pioneered transparent discount broking in India. Flat fees, no hidden charges, and zero maintenance overhead.
            </p>
          </div>
          <div className="col-lg-5 text-lg-end fade-up stagger-2">
            <a
              href="#calculators"
              className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold hover-scale d-inline-flex align-items-center gap-2"
            >
              <i className="fa-solid fa-calculator text-primary"></i>
              <span>Brokerage Calculator</span>
            </a>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="row g-4 align-items-stretch">
          {/* Card 1: Delivery */}
          <div className="col-md-6 fade-up stagger-2">
            <div className="pricing-card h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold text-muted small text-uppercase" style={{ letterSpacing: "1px" }}>
                    LONG-TERM INVESTING
                  </span>
                  <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10B981" }}>
                    FREE FOREVER
                  </span>
                </div>

                <div className="d-flex align-items-baseline gap-2 mb-2">
                  <span className="display-3 fw-bold text-dark pricing-number">₹0</span>
                  <span className="text-muted fw-semibold">/ executed delivery</span>
                </div>

                <p className="text-muted mb-4 small">
                  Hold stocks and direct mutual funds for years without paying any commission or maintenance fee.
                </p>

                <div className="pricing-feature-list border-top pt-3">
                  <div className="d-flex align-items-center gap-2 mb-2 small text-dark">
                    <i className="fa-solid fa-circle-check text-success"></i>
                    <span>Free Equity Delivery (CNC) investments</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-2 small text-dark">
                    <i className="fa-solid fa-circle-check text-success"></i>
                    <span>Direct Mutual Funds with zero distributor commissions</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-2 small text-dark">
                    <i className="fa-solid fa-circle-check text-success"></i>
                    <span>Zero Annual Demat Maintenance Charges (AMC)</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 small text-dark">
                    <i className="fa-solid fa-circle-check text-success"></i>
                    <span>Free IPO applications via standard UPI</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top">
                <Link
                  to="/signup"
                  className="btn btn-outline-primary w-100 rounded-pill py-2 fw-bold"
                >
                  Start Investing For Free
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Intraday & F&O */}
          <div className="col-md-6 fade-up stagger-3">
            <div className="pricing-card h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold text-muted small text-uppercase" style={{ letterSpacing: "1px" }}>
                    INTRADAY &amp; DERIVATIVES
                  </span>
                  <span className="badge rounded-pill px-3 py-1 fw-bold" style={{ background: "rgba(37, 99, 235, 0.12)", color: "#2563EB" }}>
                    FLAT RATE
                  </span>
                </div>

                <div className="d-flex align-items-baseline gap-2 mb-2">
                  <span className="display-3 fw-bold text-dark pricing-number">₹20</span>
                  <span className="text-muted fw-semibold">/ executed order</span>
                </div>

                <p className="text-muted mb-4 small">
                  Flat ₹20 or 0.03% (whichever is lower) per executed trade across Equity Intraday, Futures, and Options.
                </p>

                <div className="pricing-feature-list border-top pt-3">
                  <div className="d-flex align-items-center gap-2 mb-2 small text-dark">
                    <i className="fa-solid fa-circle-check text-primary"></i>
                    <span>Flat ₹20 per order for Intraday (MIS)</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-2 small text-dark">
                    <i className="fa-solid fa-circle-check text-primary"></i>
                    <span>Flat ₹20 per order for all F&amp;O trades</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-2 small text-dark">
                    <i className="fa-solid fa-circle-check text-primary"></i>
                    <span>Zero charges on unexecuted / cancelled limit orders</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 small text-dark">
                    <i className="fa-solid fa-circle-check text-primary"></i>
                    <span>Comprehensive real-time P&amp;L and margin calculation</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top">
                <Link
                  to="/pricing"
                  className="btn btn-primary w-100 rounded-pill py-2 fw-bold"
                >
                  View Complete Fee Schedule
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Pricing;