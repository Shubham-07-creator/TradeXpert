import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer pt-5 pb-4">
      <div className="container mt-2">
        <div className="row fade-up stagger-1">
          {/* Brand Column */}
          <div className="col-lg-3 col-md-6 mb-4">
            <Link to="/" className="d-flex align-items-center mb-3 text-decoration-none">
              <img
                src="/media/images/logo2.svg"
                alt="TradeXpert Logo"
                style={{ width: "38px" }}
              />
              <span className="footer-brand-title ms-2 fs-4">TradeXpert</span>
            </Link>
            <p className="text-muted small">
              &copy; 2010 - 2026, TradeXpert Broking Ltd. All rights reserved.
            </p>
            <div className="d-flex gap-2 mt-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="footer-social-link"
                title="X / Twitter"
              >
                <i className="fa-brands fa-x-twitter"></i>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="footer-social-link"
                title="Facebook"
              >
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="footer-social-link"
                title="LinkedIn"
              >
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="footer-social-link"
                title="Instagram"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div className="col-lg-2 col-md-6 col-6 mb-4">
            <h6 className="footer-heading">Company</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/about" className="footer-link">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/product" className="footer-link">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="footer-link">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/#calculators" className="footer-link">
                  Calculators
                </Link>
              </li>
              <li>
                <Link to="/about" className="footer-link">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="col-lg-2 col-md-6 col-6 mb-4">
            <h6 className="footer-heading">Support</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/support" className="footer-link">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/support" className="footer-link">
                  Support Portal
                </Link>
              </li>
              <li>
                <Link to="/support#faq" className="footer-link">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/support" className="footer-link">
                  File a Complaint
                </Link>
              </li>
              <li>
                <Link to="/support" className="footer-link">
                  Market Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="col-lg-2 col-md-6 col-6 mb-4">
            <h6 className="footer-heading">Account</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/signup" className="footer-link">
                  Open Demat
                </Link>
              </li>
              <li>
                <Link to="/login" className="footer-link">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/profile" className="footer-link">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/signup" className="footer-link">
                  Virtual Trading
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="footer-link">
                  Referral Program
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="col-lg-3 col-md-6 col-6 mb-4">
            <h6 className="footer-heading">Trading Tools</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/#calculators" className="footer-link">
                  Brokerage Calculator
                </Link>
              </li>
              <li>
                <Link to="/#calculators" className="footer-link">
                  SIP Calculator
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="footer-link">
                  Fee Schedule
                </Link>
              </li>
              <li>
                <Link to="/support" className="footer-link">
                  Market Holidays
                </Link>
              </li>
              <li>
                <Link to="/product" className="footer-link">
                  API Documentation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* SEBI Regulatory Advisory Box */}
        <div className="p-3 my-3 rounded-2" style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-warning text-dark fw-bold" style={{ fontSize: "0.68rem" }}>SEBI RISK DISCLOSURE ON DERIVATIVES</span>
          </div>
          <p className="mb-0 text-muted" style={{ fontSize: "0.76rem", lineHeight: "1.5" }}>
            9 out of 10 individual traders in equity Futures and Options Segment incurred net losses. On average, loss makers registered net trading loss close to ₹50,000. Over and above the net trading losses, loss makers expended an additional 28% in transaction costs. TradeXpert provides virtual paper trading tools with zero risk to personal capital for educational excellence.
          </p>
        </div>

        {/* Legal Disclaimer Section */}
        <div className="footer-divider border-top my-4 pt-4 footer-legal-text fade-up stagger-2">
          <p>
            TradeXpert Broking Ltd.: Member of NSE, BSE, MCX & MSEI – SEBI
            Registration no.: INZ000031633 CDSL/NSDL: Depository services
            through TradeXpert Broking Ltd. – SEBI Registration no.:
            IN-DP-431-2019 Registered Address: TradeXpert Broking Ltd., #153/154,
            4th Cross, Dollars Colony, Opp. Clarence Public School, J.P Nagar 4th
            Phase, Bengaluru - 560078, Karnataka, India.
          </p>
          <p>
            Procedure to file a complaint on SEBI SCORES: Register on SCORES
            portal. Mandatory details for filing complaints on SCORES: Name, PAN,
            Address, Mobile Number, E-mail ID. Benefits: Effective
            Communication, Speedy redressal of grievances.
          </p>
          <p>
            Investments in securities market are subject to market risks; read
            all the related documents carefully before investing. Brokerage will
            not exceed the SEBI prescribed limit.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
