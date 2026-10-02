import React from 'react';
import { Link } from 'react-router-dom';
import { DASHBOARD_URL } from '../../utils/storage';

function Stats() {
  const DASHBOARD = DASHBOARD_URL;

  return (
    <section className="section stats-section fade-up">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-5 fade-up stagger-1">
          <span className="badge-fintech mb-2">
            ENGINEERED FOR MODERN TRADERS
          </span>
          <h2 className="display-6 fw-bold mb-3" style={{ letterSpacing: "-0.03em" }}>
            Built for speed. Rooted in trust.
          </h2>
          <p className="text-muted mx-auto" style={{ maxWidth: "620px", fontSize: "1.05rem" }}>
            Why millions of active traders and long-term investors make TradeXpert their primary financial operating system.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="row g-4 align-items-stretch">
          {/* Card 1: Scale */}
          <div className="col-md-6 col-lg-3 fade-up stagger-2">
            <div className="bento-card h-100">
              <div className="bento-icon-box mb-3">
                <i className="fa-solid fa-users-viewfinder"></i>
              </div>
              <h3 className="bento-title fs-5 fw-bold mb-2">Customer-First Scale</h3>
              <p className="bento-desc text-muted mb-0 small">
                Over 1.6+ crore clients entrust us with ~₹6 lakh crores of assets, representing over 15% of daily Indian equity trading volume.
              </p>
            </div>
          </div>

          {/* Card 2: Zero Spam */}
          <div className="col-md-6 col-lg-3 fade-up stagger-3">
            <div className="bento-card h-100">
              <div className="bento-icon-box mb-3">
                <i className="fa-solid fa-shield-check"></i>
              </div>
              <h3 className="bento-title fs-5 fw-bold mb-2">Zero Spam &amp; Gimmicks</h3>
              <p className="bento-desc text-muted mb-0 small">
                No unsolicited stock tips, no casino-like gamification, and no push notifications. A clean, distraction-free trading terminal.
              </p>
            </div>
          </div>

          {/* Card 3: Ecosystem */}
          <div className="col-md-6 col-lg-3 fade-up stagger-4">
            <div className="bento-card h-100">
              <div className="bento-icon-box mb-3">
                <i className="fa-solid fa-network-wired"></i>
              </div>
              <h3 className="bento-title fs-5 fw-bold mb-2">Deep Ecosystem</h3>
              <p className="bento-desc text-muted mb-0 small">
                Not just a broker. Rainmatter fund, open APIs, direct mutual funds, IPO subscriptions, and real-time algorithmic execution.
              </p>
            </div>
          </div>

          {/* Card 4: Capital Protection */}
          <div className="col-md-6 col-lg-3 fade-up stagger-5">
            <div className="bento-card h-100">
              <div className="bento-icon-box mb-3">
                <i className="fa-solid fa-sliders"></i>
              </div>
              <h3 className="bento-title fs-5 fw-bold mb-2">Intelligent Risk Controls</h3>
              <p className="bento-desc text-muted mb-0 small">
                Server-side GTT Stop-Loss orders, automated intraday square-off, and Kill Switch lockouts to safeguard your capital.
              </p>
            </div>
          </div>
        </div>

        {/* Ecosystem Graphic & Action Banner */}
        <div className="ecosystem-banner mt-5 p-4 p-lg-5 rounded-4 fade-up">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <h3 className="fw-bold mb-2" style={{ letterSpacing: "-0.02em" }}>
                Explore the complete TradeXpert technology universe
              </h3>
              <p className="text-muted mb-4 mb-lg-0" style={{ maxWidth: "540px" }}>
                Built from the ground up for modern investors. Access institutional charting, custom watchlists, and live portfolio telemetry.
              </p>
            </div>
            <div className="col-lg-5 text-lg-end d-flex flex-wrap gap-3 justify-content-lg-end">
              <Link
                to="/product"
                className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold hover-scale"
              >
                Our Products <i className="fa-solid fa-arrow-right ms-1"></i>
              </Link>
              <a
                href={DASHBOARD}
                className="btn btn-primary rounded-pill px-4 py-2 fw-bold hover-scale"
              >
                Launch Terminal <i className="fa-solid fa-arrow-up-right-from-square ms-1"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Stats;