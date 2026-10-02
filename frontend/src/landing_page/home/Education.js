import React from 'react';
import { Link } from 'react-router-dom';

function Education() {
  return (
    <section className="section education-section fade-up">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-5 order-2 order-lg-1 text-center fade-up stagger-1">
            <img
              src="media/images/education.svg"
              alt="Financial Education & Community"
              className="img-fluid floating-animation"
              style={{ maxWidth: "88%", filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.06))" }}
            />
          </div>

          <div className="col-lg-7 order-1 order-lg-2 fade-up stagger-2">
            <span className="badge-fintech mb-2">OPEN FINANCIAL KNOWLEDGE</span>
            <h2 className="display-6 fw-bold mb-3" style={{ letterSpacing: "-0.03em" }}>
              Free &amp; open capital market education
            </h2>
            <p className="text-muted mb-4" style={{ fontSize: "1.05rem" }}>
              Empowering Indian retail investors with uncompromised, jargon-free market literacy from beginner basics to advanced quantitative derivatives.
            </p>

            <div className="row g-4">
              {/* Varsity Card */}
              <div className="col-sm-6">
                <div className="education-card p-4 rounded-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="education-icon-box">
                        <i className="fa-solid fa-graduation-cap"></i>
                      </div>
                      <span className="badge rounded-pill px-3 py-1 fw-bold small" style={{ background: "rgba(37, 99, 235, 0.1)", color: "#2563EB" }}>
                        VARSITY
                      </span>
                    </div>
                    <h3 className="fs-5 fw-bold mb-2">Comprehensive Courseware</h3>
                    <p className="text-muted small mb-3">
                      Over 10 in-depth modules covering technical analysis, options strategies, risk management, and fundamental valuation.
                    </p>
                  </div>
                  <Link
                    to="/support"
                    className="btn btn-outline-primary rounded-pill py-2 fw-semibold small text-center"
                  >
                    Explore Modules <i className="fa-solid fa-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>

              {/* TradingQ&A Card */}
              <div className="col-sm-6">
                <div className="education-card p-4 rounded-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="education-icon-box" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10B981" }}>
                        <i className="fa-solid fa-comments"></i>
                      </div>
                      <span className="badge rounded-pill px-3 py-1 fw-bold small" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10B981" }}>
                        COMMUNITY
                      </span>
                    </div>
                    <h3 className="fs-5 fw-bold mb-2">TradingQ&amp;A Community</h3>
                    <p className="text-muted small mb-3">
                      India's largest active market forum with over 500,000+ traders discussing regulations, strategies, and platform updates.
                    </p>
                  </div>
                  <Link
                    to="/support"
                    className="btn btn-outline-primary rounded-pill py-2 fw-semibold small text-center"
                  >
                    Join Discussion <i className="fa-solid fa-arrow-right ms-1"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Education;