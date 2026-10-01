import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer pt-5 pb-4">
      <div className="container mt-2">
        <div className="row fade-up stagger-1">
          {/* Brand Column */}
          <div className="col-lg-3 col-md-6 mb-4">
            <div className="d-flex align-items-center mb-3">
              <img
                src="/media/images/logo2.svg"
                alt="TradeXpert Logo"
                style={{ width: "38px" }}
              />
              <span className="footer-brand-title ms-2 fs-4">TradeXpert</span>
            </div>
            <p className="text-muted small">
              © 2010 - 2026, TradeXpert Broking Ltd. All rights reserved.
            </p>
            <div className="d-flex gap-2 mt-3">
              <a
                href="#"
                className="footer-social-link"
                title="X / Twitter"
              >
                𝕏
              </a>
              <a
                href="#"
                className="footer-social-link"
                title="Facebook"
              >
                f
              </a>
              <a
                href="#"
                className="footer-social-link"
                title="LinkedIn"
              >
                in
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
                <a href="#calculators" className="footer-link">
                  Calculators
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Careers
                </a>
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
                <a href="#faq" className="footer-link">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  File a Complaint
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Market Status
                </a>
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
                <a href="#" className="footer-link">
                  Virtual Trading
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Referral Program
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="col-lg-3 col-md-6 col-6 mb-4">
            <h6 className="footer-heading">Trading Tools</h6>
            <ul className="list-unstyled">
              <li>
                <a href="#calculators" className="footer-link">
                  Brokerage Calculator
                </a>
              </li>
              <li>
                <a href="#calculators" className="footer-link">
                  SIP Calculator
                </a>
              </li>
              <li>
                <Link to="/pricing" className="footer-link">
                  Fee Schedule
                </Link>
              </li>
              <li>
                <a href="#" className="footer-link">
                  Market Holidays
                </a>
              </li>
              <li>
                <a href="#" className="footer-link">
                  API Documentation
                </a>
              </li>
            </ul>
          </div>
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
