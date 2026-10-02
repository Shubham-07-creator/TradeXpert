import React from 'react';
import { Link } from 'react-router-dom';
import { DASHBOARD_URL } from '../../utils/storage';

function Hero() {
  const DASHBOARD = DASHBOARD_URL;

  return (
    <div className="hero-section">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6 fade-up stagger-1">
            {/* Live Trust Eyebrow */}
            <div className="hero-eyebrow mb-3">
              <span className="live-dot me-2"></span>
              <span className="hero-eyebrow-text">ZERO BROKERAGE DELIVERY • PRO TRADING TERMINAL</span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-title display-4 fw-bold mb-4" style={{ letterSpacing: "-0.03em", lineHeight: "1.15" }}>
              Invest in everything.<br />
              <span className="text-gradient-primary">Trade with zero friction.</span>
            </h1>

            {/* Subtitle */}
            <p className="lead mb-4 hero-lead" style={{ fontSize: "1.15rem", lineHeight: "1.7" }}>
              The modern trading platform engineered for speed. ₹0 brokerage on equity delivery &amp; mutual funds, flat ₹20 on intraday &amp; F&amp;O, and real-time WebSocket market streams.
            </p>

            {/* Action Buttons */}
            <div className="d-flex flex-wrap gap-3 mb-5">
              <Link
                to="/signup"
                className="btn btn-primary btn-lg rounded-pill px-4 py-3 fw-bold shadow-sm hover-scale d-inline-flex align-items-center gap-2"
                style={{ fontSize: "1.02rem" }}
              >
                <span>Open Free Account</span>
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
              <a
                href={DASHBOARD}
                className="btn btn-outline-secondary btn-lg rounded-pill px-4 py-3 fw-semibold hover-scale d-inline-flex align-items-center gap-2"
                style={{ fontSize: "1.02rem" }}
              >
                <i className="fa-solid fa-chart-line text-primary"></i>
                <span>Explore Trading Terminal</span>
              </a>
            </div>

            {/* Institutional Stat Metrics */}
            <div className="row pt-4 border-top fade-up stagger-2 g-3">
              <div className="col-3">
                <h3 className="fw-bold mb-0 hero-stat-val">2M+</h3>
                <small className="hero-stat-label">Active Traders</small>
              </div>
              <div className="col-3">
                <h3 className="fw-bold mb-0 hero-stat-val">₹6L Cr+</h3>
                <small className="hero-stat-label">Turnover</small>
              </div>
              <div className="col-3">
                <h3 className="fw-bold mb-0 hero-stat-val">&lt;15ms</h3>
                <small className="hero-stat-label">Order Latency</small>
              </div>
              <div className="col-3">
                <h3 className="fw-bold mb-0 hero-stat-val">₹0</h3>
                <small className="hero-stat-label">Free Delivery</small>
              </div>
            </div>
          </div>

          {/* Hero Illustration with Floating Live Widgets */}
          <div className="col-lg-6 text-center mt-5 mt-lg-0 fade-up stagger-3 position-relative">
            <div className="hero-visual-wrapper position-relative d-inline-block">
              {/* Floating Top Widget */}
              <div className="floating-card floating-card-top shadow-md">
                <div className="d-flex align-items-center gap-2">
                  <span className="live-dot"></span>
                  <span className="fw-bold text-dark" style={{ fontSize: "0.85rem" }}>NIFTY 50</span>
                  <span className="text-success fw-bold" style={{ fontSize: "0.85rem" }}>24,850.20 (+0.45%)</span>
                </div>
              </div>

              {/* Main Graphic */}
              <img
                src="media/images/homeHero.png"
                alt="TradeXpert Trading Dashboard"
                className="img-fluid floating-animation"
                style={{ maxWidth: "92%", filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.08))" }}
              />

              {/* Floating Bottom Widget */}
              <div className="floating-card floating-card-bottom shadow-md">
                <div className="d-flex align-items-center gap-2">
                  <i className="fa-solid fa-shield-halved text-primary"></i>
                  <span className="fw-semibold text-dark" style={{ fontSize: "0.82rem" }}>GTT Stop-Loss &amp; Target Auto-Trigger</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;